import { Controller, Get, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { PrismaService } from '../../common/prisma/prisma.service'

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get('panexa')
  @Roles('ADMIN_PANEXA')
  async getPanexaDashboard() {
    const now   = new Date()
    const month = new Date(now.getFullYear(), now.getMonth(), 1)
    const prev  = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [clinicsActive, clinicsNew, paidOrders, prevPaid, companies, employees] = await Promise.all([
      this.prisma.clinic.count({ where: { planStatus: 'ACTIVE' } }),
      this.prisma.clinic.count({ where: { planStatus: 'ACTIVE', planActivatedAt: { gte: month } } }),
      this.prisma.order.findMany({ where: { status: 'PAID', paidAt: { gte: month } } }),
      this.prisma.order.findMany({ where: { status: 'PAID', paidAt: { gte: prev, lt: month } } }),
      this.prisma.company.count({ where: { isActive: true } }),
      this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
    ])

    const mrrTotal  = paidOrders.reduce((s, o) => s + o.finalAmount, 0)
    const mrrPrev   = prevPaid.reduce((s, o) => s + o.finalAmount, 0)
    const mrrGrowth = mrrPrev ? ((mrrTotal - mrrPrev) / mrrPrev) * 100 : 0

    // MRR chart — last 12 months
    const mrrChart = await Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
        const d2 = new Date(d.getFullYear(), d.getMonth() + 1, 1)
        return this.prisma.order
          .aggregate({ where: { status: 'PAID', paidAt: { gte: d, lt: d2 } }, _sum: { finalAmount: true } })
          .then(r => ({
            label: d.toLocaleString('pt-BR', { month: 'short' }),
            value: r._sum.finalAmount ?? 0,
          }))
      })
    )

    // Top 10 clinics
    const topClinicsRaw = await this.prisma.commission.groupBy({
      by: ['clinicId'],
      where: { status: 'PAID', createdAt: { gte: month } },
      _sum: { grossAmount: true },
      orderBy: { _sum: { grossAmount: 'desc' } },
      take: 10,
    })

    const topClinics = await Promise.all(
      topClinicsRaw.map(async (c, i) => {
        const clinic = await this.prisma.clinic.findUnique({ where: { id: c.clinicId }, select: { razaoSocial: true, logoUrl: true } })
        return { clinicId: c.clinicId, clinicName: clinic?.razaoSocial ?? '—', logoUrl: clinic?.logoUrl, position: i + 1, mrr: c._sum.grossAmount ?? 0, salesCount: 0 }
      })
    )

    const recentTransactions = await this.prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, companyId: true, clinicId: true, finalAmount: true, status: true, createdAt: true },
    })

    return {
      clinicsActive, clinicsNew,
      mrrTotal, mrrGrowth: parseFloat(mrrGrowth.toFixed(1)),
      gmvMonth: mrrTotal, gmvGrowth: mrrGrowth,
      takeRate: 0.70,
      companiesActive: companies,
      employeesActive: employees,
      churnRate: 0,
      topClinics,
      recentTransactions,
      mrrChart,
      salesChart: mrrChart,
    }
  }

  @Get('clinic')
  @Roles('ADMIN_CLINICA')
  async getClinicDashboard(@Req() req: any) {
    const clinicId = req.user.clinicId
    const now  = new Date()
    const month = new Date(now.getFullYear(), now.getMonth(), 1)
    const prev  = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [commissions, prevComm, companies, employees, recentSales] = await Promise.all([
      this.prisma.commission.findMany({ where: { clinicId, status: 'PAID', createdAt: { gte: month } } }),
      this.prisma.commission.findMany({ where: { clinicId, status: 'PAID', createdAt: { gte: prev, lt: month } } }),
      this.prisma.company.count({ where: { clinicId, isActive: true } }),
      this.prisma.employee.count({ where: { company: { clinicId }, status: 'ACTIVE' } }),
      this.prisma.order.findMany({ where: { clinicId, status: 'PAID' }, take: 10, orderBy: { paidAt: 'desc' }, select: { id: true, companyId: true, finalAmount: true, status: true, createdAt: true } }),
    ])

    const mrrGenerated       = commissions.reduce((s, c) => s + c.grossAmount, 0)
    const commissionThisMonth = commissions.reduce((s, c) => s + c.clinicAmount, 0)
    const prevMrr            = prevComm.reduce((s, c) => s + c.grossAmount, 0)
    const mrrGrowth          = prevMrr ? ((mrrGenerated - prevMrr) / prevMrr) * 100 : 0

    const commissionChart = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d  = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        const d2 = new Date(d.getFullYear(), d.getMonth() + 1, 1)
        return this.prisma.commission
          .aggregate({ where: { clinicId, createdAt: { gte: d, lt: d2 } }, _sum: { clinicAmount: true } })
          .then(r => ({ label: d.toLocaleString('pt-BR', { month: 'short' }), value: r._sum.clinicAmount ?? 0 }))
      })
    )

    const ranking = await this.prisma.gamificationRanking.findFirst({
      where: { clinicId, period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` },
    })

    return {
      mrrGenerated,
      mrrGrowth: parseFloat(mrrGrowth.toFixed(1)),
      commissionThisMonth,
      commissionGrowth: mrrGrowth,
      activeCompanies: companies,
      totalEmployees: employees,
      conversionRate: 0,
      rankingPosition: ranking?.position ?? 99,
      rankingTotal: await this.prisma.clinic.count({ where: { planStatus: 'ACTIVE' } }),
      commissionChart,
      companiesList: [],
      recentSales,
    }
  }

  @Get('company')
  @Roles('ADMIN_EMPRESA')
  async getCompanyDashboard(@Req() req: any) {
    const companyId = req.user.companyId

    const [totalLicenses, usedLicenses, overdueOrder] = await Promise.all([
      this.prisma.license.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.license.count({ where: { companyId, status: 'ACTIVE', employeeId: { not: null } } }),
      this.prisma.order.findFirst({ where: { companyId, status: 'OVERDUE' }, select: { id: true, finalAmount: true } }),
    ])

    const activeProducts = await this.prisma.product.findMany({
      where: { licenses: { some: { companyId, status: 'ACTIVE' } } },
    })

    const recentEmployees = await this.prisma.employee.findMany({
      where: { companyId },
      take: 8,
      orderBy: { createdAt: 'desc' },
    })

    return {
      activeProducts,
      totalLicenses,
      usedLicenses,
      availableLicenses: Math.max(0, totalLicenses - usedLicenses),
      nextBillingDate: null,
      nextBillingAmount: 0,
      isOverdue: !!overdueOrder,
      overdueAmount: overdueOrder?.finalAmount,
      recentEmployees,
      upsellSuggestions: [],
    }
  }
}
