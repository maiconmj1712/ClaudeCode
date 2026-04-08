import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import slugify from 'slugify'

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; plan?: string; status?: string; page?: number; limit?: number }) {
    const { search, plan, status, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { razaoSocial: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (plan) where.plan = plan
    if (status) where.planStatus = status

    const [data, total] = await Promise.all([
      this.prisma.clinic.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { companies: true } },
        },
      }),
      this.prisma.clinic.count({ where }),
    ])

    return { data, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
      include: {
        _count: { select: { companies: true, commissions: true } },
      },
    })
    if (!clinic) throw new NotFoundException('Clínica não encontrada')
    return clinic
  }

  async findBySlug(slug: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { slug },
      select: {
        id: true, razaoSocial: true, slug: true, logoUrl: true,
        primaryColor: true, planStatus: true,
        products: {
          where: { isEnabled: true },
          include: { product: { include: { discountTiers: { orderBy: { minQuantity: 'asc' } } } } },
        },
      },
    })
    if (!clinic || clinic.planStatus !== 'ACTIVE') throw new NotFoundException('Clínica não encontrada')
    return clinic
  }

  async create(dto: any) {
    const exists = await this.prisma.clinic.findUnique({ where: { cnpj: dto.cnpj } })
    if (exists) throw new ConflictException('CNPJ já cadastrado')

    const baseSlug = slugify(dto.razaoSocial, { lower: true, strict: true })
    let slug = baseSlug
    let attempt = 0
    while (await this.prisma.clinic.findUnique({ where: { slug } })) {
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    return this.prisma.clinic.create({
      data: { ...dto, slug, planStatus: 'TRIAL', planActivatedAt: new Date() },
    })
  }

  async update(id: string, dto: any) {
    await this.findOne(id)
    return this.prisma.clinic.update({ where: { id }, data: dto })
  }

  async activatePlan(id: string) {
    await this.findOne(id)
    return this.prisma.clinic.update({
      where: { id },
      data: { planStatus: 'ACTIVE', planActivatedAt: new Date() },
    })
  }

  async suspendClinic(id: string, _reason: string) {
    await this.findOne(id)
    return this.prisma.clinic.update({
      where: { id },
      data: { planStatus: 'SUSPENDED' },
    })
  }

  async getCommissions(clinicId: string, query: { month?: string; page?: number; limit?: number }) {
    const { month, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: any = { clinicId }
    if (month) {
      const [year, m] = month.split('-').map(Number)
      where.createdAt = {
        gte: new Date(year, m - 1, 1),
        lt: new Date(year, m, 1),
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.commission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { order: { select: { id: true, status: true, company: { select: { razaoSocial: true } } } } },
      }),
      this.prisma.commission.count({ where }),
    ])

    return { data, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async getHealthScore(clinicId: string) {
    await this.findOne(clinicId)
    const now = new Date()
    const month = new Date(now.getFullYear(), now.getMonth(), 1)

    const [companies, employees, ordersThisMonth, ordersLast3Months, commissions, ranking] = await Promise.all([
      this.prisma.company.count({ where: { clinicId, isActive: true } }),
      this.prisma.employee.count({ where: { company: { clinicId }, status: 'ACTIVE' } }),
      this.prisma.order.count({ where: { clinicId, status: 'PAID', paidAt: { gte: month } } }),
      this.prisma.order.count({ where: { clinicId, status: 'PAID', paidAt: { gte: new Date(now.getFullYear(), now.getMonth() - 3, 1) } } }),
      this.prisma.commission.aggregate({ where: { clinicId, status: 'PAID', createdAt: { gte: month } }, _sum: { clinicAmount: true } }),
      this.prisma.gamificationRanking.findFirst({
        where: { clinicId, period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` },
      }),
    ])

    // Score components (0-100)
    const activeClientsScore  = Math.min(companies * 2, 30)    // max 30pts: 15+ companies
    const employeesScore      = Math.min(employees / 10, 20)   // max 20pts: 200+ employees
    const salesScore          = Math.min(ordersThisMonth * 2, 20) // max 20pts
    const retentionScore      = ordersLast3Months > 0 ? 15 : 0 // 15pts if sold last 3 months
    const rankingScore        = ranking ? Math.max(0, 15 - ranking.position) : 0 // max 15pts

    const totalScore = Math.round(activeClientsScore + employeesScore + salesScore + retentionScore + rankingScore)

    return {
      score: Math.min(totalScore, 100),
      breakdown: {
        activeClients: { score: Math.round(activeClientsScore), max: 30, value: companies },
        employees:     { score: Math.round(employeesScore), max: 20, value: employees },
        sales:         { score: Math.round(salesScore), max: 20, value: ordersThisMonth },
        retention:     { score: retentionScore, max: 15, value: ordersLast3Months },
        ranking:       { score: rankingScore, max: 15, value: ranking?.position ?? null },
      },
      mrrThisMonth: commissions._sum.clinicAmount ?? 0,
    }
  }

  async getClinicProducts(clinicId: string) {
    return this.prisma.clinicProduct.findMany({
      where: { clinicId },
      include: { product: { include: { discountTiers: true } } },
    })
  }

  async updateClinicProducts(clinicId: string, productIds: string[]) {
    await this.findOne(clinicId)

    // Upsert each product
    for (const productId of productIds) {
      await this.prisma.clinicProduct.upsert({
        where: { clinicId_productId: { clinicId, productId } },
        create: { clinicId, productId, isEnabled: true },
        update: { isEnabled: true },
      })
    }

    // Deactivate products not in the new list
    await this.prisma.clinicProduct.updateMany({
      where: { clinicId, productId: { notIn: productIds } },
      data: { isEnabled: false },
    })

    return this.getClinicProducts(clinicId)
  }
}
