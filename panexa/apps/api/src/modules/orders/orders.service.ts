import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { calculatePrice } from '@panexa/shared-types'
import type { CreateOrderDto } from '@panexa/shared-types'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import axios from 'axios'

@Injectable()
export class OrdersService {
  private readonly asaasUrl: string
  private readonly asaasKey: string

  constructor(
    private prisma: PrismaService,
    @InjectQueue('automations') private automationsQueue: Queue,
  ) {
    this.asaasUrl = process.env.ASAAS_API_URL ?? 'https://sandbox.asaas.com/api/v3'
    this.asaasKey = process.env.ASAAS_API_KEY ?? ''
  }

  async create(dto: CreateOrderDto) {
    // 1. Find clinic by slug
    const clinic = await this.prisma.clinic.findUnique({ where: { slug: dto.clinicSlug } })
    if (!clinic) throw new NotFoundException('Clínica não encontrada')
    if (clinic.planStatus !== 'ACTIVE') throw new BadRequestException('Clínica não está com plano ativo')

    // 2. Find or create company
    let company = await this.prisma.company.findUnique({
      where: { cnpj: dto.company.cnpj.replace(/\D/g, '') },
    })

    if (!company) {
      company = await this.prisma.company.create({
        data: {
          cnpj:         dto.company.cnpj.replace(/\D/g, ''),
          razaoSocial:  dto.company.razaoSocial,
          nomeFantasia: dto.company.nomeFantasia,
          email:        dto.company.email,
          phone:        dto.company.phone.replace(/\D/g, ''),
          contactName:  dto.company.contactName,
          address:      dto.company.address as any,
          clinicId:     clinic.id,
          referralToken: dto.referralToken,
          utmSource:    dto.utmSource,
          utmMedium:    dto.utmMedium,
          utmCampaign:  dto.utmCampaign,
        },
      })
    }

    // 3. Calculate order totals
    const itemsWithPrices = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: { discountTiers: true },
        })
        if (!product) throw new NotFoundException(`Produto ${item.productId} não encontrado`)

        const calc = calculatePrice(product as any, item.quantity)
        return { product, item, calc }
      })
    )

    const totalAmount  = itemsWithPrices.reduce((s, i) => s + i.product.pricePerUnit * i.item.quantity, 0)
    const discountAmount = itemsWithPrices.reduce((s, i) => s + i.calc.discountAmount, 0)
    const finalAmount  = totalAmount - discountAmount

    // 4. Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          clinicId:    clinic.id,
          companyId:   company!.id,
          status:      'PENDING',
          totalAmount,
          discountAmount,
          finalAmount,
          paymentMethod: dto.paymentMethod as any,
          referralToken: dto.referralToken,
          utmSource:   dto.utmSource,
          utmMedium:   dto.utmMedium,
          utmCampaign: dto.utmCampaign,
          items: {
            create: itemsWithPrices.map(({ product, item, calc }) => ({
              productId:  product.id,
              quantity:   item.quantity,
              unitPrice:  product.pricePerUnit,
              discountPct: calc.discountPct,
              totalPrice:  calc.totalPrice,
            })),
          },
          commission: {
            create: {
              clinicId:     clinic.id,
              grossAmount:  finalAmount,
              clinicPct:    clinic.commissionRate,
              clinicAmount: finalAmount * clinic.commissionRate,
              panexaAmount: finalAmount * (1 - clinic.commissionRate),
              status:       'PENDING',
            },
          },
        },
        include: { items: true, commission: true },
      })
      return o
    })

    // 5. Create payment via Asaas
    try {
      const paymentRes = await this.createAsaasPayment(order, company!, dto)
      await this.prisma.payment.create({
        data: {
          orderId:         order.id,
          method:          dto.paymentMethod as any,
          status:          'PENDING',
          amount:          finalAmount,
          gatewayPaymentId: paymentRes.id,
          pixQrCode:       paymentRes.pixQrCodeImage,
          boletoUrl:       paymentRes.bankSlipUrl,
          boletoBarCode:   paymentRes.identificationField,
          dueDate:         paymentRes.dueDate ? new Date(paymentRes.dueDate) : null,
          billingType:     paymentRes.billingType,
        },
      })
    } catch (err) {
      // Payment creation failed — keep order as PENDING, notify admin
      console.error('Erro ao criar pagamento Asaas:', err)
    }

    // 6. Queue confirmation emails
    await this.automationsQueue.add('send-notification', {
      trigger: 'COMPANY_PURCHASE',
      companyId: company!.id,
      orderId: order.id,
    })

    return { id: order.id, status: 'PENDING', finalAmount }
  }

  async findAll(params?: { clinicId?: string; companyId?: string; status?: string; page?: number; limit?: number }) {
    const page  = params?.page  ?? 1
    const limit = params?.limit ?? 20
    const skip  = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          ...(params?.clinicId  && { clinicId: params.clinicId }),
          ...(params?.companyId && { companyId: params.companyId }),
          ...(params?.status    && { status: params.status as any }),
        },
        include: { items: { include: { product: true } }, payment: true, commission: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: {
        ...(params?.clinicId  && { clinicId: params.clinicId }),
        ...(params?.companyId && { companyId: params.companyId }),
        ...(params?.status    && { status: params.status as any }),
      }}),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, payment: true, commission: true, company: true, clinic: true },
    })
    if (!order) throw new NotFoundException('Pedido não encontrado')
    return order
  }

  async cancel(id: string) {
    const order = await this.findOne(id)
    if (order.status === 'PAID') throw new BadRequestException('Não é possível cancelar um pedido já pago')
    return this.prisma.order.update({ where: { id }, data: { status: 'CANCELLED' } })
  }

  private async createAsaasPayment(order: any, company: any, dto: CreateOrderDto) {
    if (!this.asaasKey) {
      // Return mock in dev
      return { id: `mock_${order.id}`, billingType: dto.paymentMethod }
    }

    const billingType = dto.paymentMethod === 'CREDIT_CARD' ? 'CREDIT_CARD'
      : dto.paymentMethod === 'PIX' ? 'PIX' : 'BOLETO'

    const { data } = await axios.post(
      `${this.asaasUrl}/payments`,
      {
        customer:     company.cnpj,
        billingType,
        value:        order.finalAmount,
        dueDate:      new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
        description:  `Panexa — Pedido ${order.id}`,
        externalReference: order.id,
        ...(dto.paymentMethod === 'PIX' && { pixAddressKey: process.env.ASAAS_PIX_KEY }),
      },
      { headers: { access_token: this.asaasKey } }
    )
    return data
  }
}
