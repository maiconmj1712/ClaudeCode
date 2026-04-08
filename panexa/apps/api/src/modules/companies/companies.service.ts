import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('automations') private automationsQueue: Queue,
  ) {}

  async findAll(query: {
    clinicId?: string
    search?: string
    isActive?: boolean
    page?: number
    limit?: number
  }) {
    const { clinicId, search, isActive, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: any = {}
    if (clinicId) where.clinicId = clinicId
    if (typeof isActive === 'boolean') where.isActive = isActive
    if (search) {
      where.OR = [
        { razaoSocial: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { employees: true } },
          clinic: { select: { razaoSocial: true } },
        },
      }),
      this.prisma.company.count({ where }),
    ])

    return { data, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        clinic: { select: { id: true, razaoSocial: true, slug: true } },
        _count: { select: { employees: true, orders: true, licenses: true } },
      },
    })
    if (!company) throw new NotFoundException('Empresa não encontrada')
    return company
  }

  async create(dto: any) {
    return this.prisma.company.create({ data: dto })
  }

  async update(id: string, dto: any) {
    await this.findOne(id)
    return this.prisma.company.update({ where: { id }, data: dto })
  }

  async getEmployees(companyId: string, query: { search?: string; status?: string; page?: number; limit?: number }) {
    const { search, status, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    await this.findOne(companyId)

    const where: any = { companyId }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({ where }),
    ])

    return { data, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async createEmployee(companyId: string, dto: any) {
    const company = await this.findOne(companyId)

    // Check available licenses
    const [totalLicenses, usedLicenses] = await Promise.all([
      this.prisma.license.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.license.count({ where: { companyId, status: 'ACTIVE', employeeId: { not: null } } }),
    ])

    if (usedLicenses >= totalLicenses) {
      throw new BadRequestException('Sem licenças disponíveis. Contrate mais licenças para adicionar colaboradores.')
    }

    const employee = await this.prisma.employee.create({
      data: { ...dto, companyId },
    })

    // Assign an available license
    const availableLicense = await this.prisma.license.findFirst({
      where: { companyId, status: 'ACTIVE', employeeId: null },
    })
    if (availableLicense) {
      await this.prisma.license.update({
        where: { id: availableLicense.id },
        data: { employeeId: employee.id },
      })
    }

    // Queue welcome notification
    if (employee.email || employee.phone) {
      await this.automationsQueue.add('send-notification', {
        trigger: 'EMPLOYEE_WELCOME',
        employeeId: employee.id,
        companyId,
        clinicId: company.clinicId,
      })
    }

    return employee
  }

  async updateEmployee(companyId: string, employeeId: string, dto: any) {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, companyId } })
    if (!employee) throw new NotFoundException('Colaborador não encontrado')
    return this.prisma.employee.update({ where: { id: employeeId }, data: dto })
  }

  async blockEmployee(companyId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, companyId } })
    if (!employee) throw new NotFoundException('Colaborador não encontrado')

    await this.prisma.$transaction([
      this.prisma.employee.update({ where: { id: employeeId }, data: { status: 'INACTIVE' } }),
      this.prisma.license.updateMany({ where: { employeeId }, data: { employeeId: null } }),
    ])

    return { success: true }
  }

  async importEmployees(companyId: string, rows: any[]) {
    await this.findOne(companyId)
    const results = { created: 0, skipped: 0, errors: [] as string[] }

    for (const row of rows) {
      try {
        const existing = await this.prisma.employee.findFirst({
          where: { OR: [{ cpf: row.cpf, companyId }, { email: row.email, companyId }] },
        })
        if (existing) {
          results.skipped++
          continue
        }

        await this.prisma.employee.create({
          data: {
            name: row.name,
            cpf: row.cpf?.replace(/\D/g, ''),
            email: row.email,
            phone: row.phone,
            birthDate: row.birthdate ? new Date(row.birthdate) : null,
            companyId,
          },
        })
        results.created++
      } catch (err: any) {
        results.errors.push(`${row.cpf ?? row.email}: ${err.message}`)
      }
    }

    return results
  }
}
