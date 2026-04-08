import { Controller, Post, Body, Headers, HttpCode, HttpStatus, UnauthorizedException, Logger } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PrismaService } from '../../common/prisma/prisma.service'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name)

  constructor(
    private prisma: PrismaService,
    @InjectQueue('automations') private automationsQueue: Queue,
  ) {}

  /**
   * Webhook Asaas — processa confirmações, falhas e inadimplência
   * Endpoint: POST /payments/webhook/asaas
   */
  @Post('webhook/asaas')
  @HttpCode(HttpStatus.OK)
  async asaasWebhook(
    @Body() body: any,
    @Headers('asaas-webhook-token') token: string,
  ) {
    // Validate webhook token
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      throw new UnauthorizedException('Token de webhook inválido')
    }

    const { event, payment } = body
    this.logger.log(`Webhook Asaas recebido: ${event} — payment: ${payment?.id}`)

    const order = payment?.externalReference
      ? await this.prisma.order.findUnique({
          where: { id: payment.externalReference },
          include: { commission: true, company: true, clinic: true },
        })
      : null

    if (!order) {
      this.logger.warn(`Pedido não encontrado para externalReference: ${payment?.externalReference}`)
      return { received: true }
    }

    switch (event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED': {
        // 1. Update order and payment status
        await this.prisma.$transaction([
          this.prisma.order.update({ where: { id: order.id }, data: { status: 'PAID', paidAt: new Date() } }),
          this.prisma.payment.updateMany({
            where: { orderId: order.id },
            data: { status: 'CONFIRMED', confirmedAt: new Date(), webhookData: body as any },
          }),
        ])

        // 2. Trigger split — in production, Asaas handles this via subconta
        if (order.commission) {
          await this.prisma.commission.update({
            where: { id: order.commission.id },
            data: { status: 'PAID', paidAt: new Date() },
          })
        }

        // 3. Activate licenses for all ordered products
        await this.activateLicenses(order.id)

        // 4. Queue confirmation notification
        await this.automationsQueue.add('send-notification', {
          trigger: 'PAYMENT_CONFIRMED',
          companyId: order.companyId,
          orderId: order.id,
        })
        break
      }

      case 'PAYMENT_OVERDUE': {
        const daysSinceDue = payment.daysAfterDueDate || 0
        const trigger = daysSinceDue >= 15 ? 'PAYMENT_OVERDUE_D15'
          : daysSinceDue >= 12 ? 'PAYMENT_OVERDUE_D12'
          : daysSinceDue >= 7  ? 'PAYMENT_OVERDUE_D7'
          : 'PAYMENT_OVERDUE_D1'

        await this.prisma.order.update({ where: { id: order.id }, data: { status: 'OVERDUE' } })

        if (daysSinceDue >= 15) {
          // Suspend all licenses
          await this.prisma.license.updateMany({ where: { orderId: order.id }, data: { status: 'SUSPENDED', suspendedAt: new Date() } })
        }

        await this.automationsQueue.add('send-notification', { trigger, companyId: order.companyId, orderId: order.id })
        break
      }

      case 'PAYMENT_REFUNDED': {
        await this.prisma.order.update({ where: { id: order.id }, data: { status: 'REFUNDED' } })
        await this.prisma.license.updateMany({ where: { orderId: order.id }, data: { status: 'CANCELLED', cancelledAt: new Date() } })
        break
      }
    }

    // Store webhook for audit
    await this.prisma.payment.updateMany({
      where: { orderId: order.id },
      data: { webhookData: body as any },
    })

    return { received: true }
  }

  private async activateLicenses(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, company: { include: { employees: true } } },
    })
    if (!order) return

    // Create/activate licenses for each order item
    for (const item of order.items) {
      await this.prisma.license.updateMany({
        where: { orderId, productId: item.productId, status: 'SUSPENDED' },
        data: { status: 'ACTIVE' },
      })

      // Create new licenses if none exist
      const existing = await this.prisma.license.count({ where: { orderId, productId: item.productId } })
      if (!existing) {
        const licenses = Array.from({ length: item.quantity }, () => ({
          orderId,
          companyId: order.companyId,
          productId: item.productId,
          status:    'ACTIVE' as const,
        }))
        await this.prisma.license.createMany({ data: licenses })
      }
    }
  }
}
