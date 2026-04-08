import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import slugify from 'slugify'
import { PrismaService } from '../../common/prisma/prisma.service'
import type { TokenPayload, AuthTokens } from '@panexa/shared-types'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { clinic: true, company: true, employee: true },
    })

    if (!user || !user.isActive) throw new UnauthorizedException('Credenciais inválidas')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Credenciais inválidas')

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const tokens = await this.generateTokens(user)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clinicId: user.clinicId,
        companyId: user.companyId,
        employeeId: user.employeeId,
      },
      tokens,
    }
  }

  async registerClinic(data: {
    cnpj: string
    razaoSocial: string
    email: string
    phone: string
    contactName: string
    password: string
  }) {
    // Check if CNPJ/email already exists
    const existing = await this.prisma.clinic.findFirst({
      where: { OR: [{ cnpj: data.cnpj.replace(/\D/g, '') }, { email: data.email }] },
    })
    if (existing) throw new ConflictException('CNPJ ou e-mail já cadastrado')

    const passwordHash = await bcrypt.hash(data.password, 12)

    // Generate unique slug from razaoSocial
    let slug = slugify(data.razaoSocial, { lower: true, strict: true })
    const existing2 = await this.prisma.clinic.findUnique({ where: { slug } })
    if (existing2) slug = `${slug}-${nanoid(6)}`

    const referralCode = nanoid(10).toUpperCase()

    // Create clinic + admin user in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          cnpj: data.cnpj.replace(/\D/g, ''),
          razaoSocial: data.razaoSocial,
          slug,
          email: data.email,
          phone: data.phone.replace(/\D/g, ''),
          referralCode,
          planStatus: 'TRIAL',
          planActivatedAt: new Date(),
          planExpiresAt: new Date(Date.now() + 14 * 24 * 3600 * 1000), // 14-day trial
        },
      })

      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.contactName,
          passwordHash,
          role: 'ADMIN_CLINICA',
          clinicId: clinic.id,
        },
      })

      return { clinic, user }
    })

    const tokens = await this.generateTokens(result.user)
    return { user: result.user, clinic: result.clinic, tokens }
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!stored || stored.expiresAt < new Date() || !stored.user.isActive) {
      throw new UnauthorizedException('Refresh token inválido')
    }

    // Rotate refresh token
    await this.prisma.refreshToken.delete({ where: { id: stored.id } })
    return this.generateTokens(stored.user)
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }
  }

  private async generateTokens(user: any): Promise<AuthTokens> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clinicId:   user.clinicId,
      companyId:  user.companyId,
      employeeId: user.employeeId,
    }

    const accessToken = this.jwt.sign(payload)

    const refreshExpiry = parseInt(this.config.get('JWT_REFRESH_EXPIRES', '7d')) || 7
    const refreshToken = nanoid(64)
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + refreshExpiry * 24 * 3600 * 1000),
      },
    })

    return { accessToken, refreshToken, expiresIn: 3600 }
  }
}
