import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const settings = await this.prisma.platformSetting.findMany()
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>)
  }

  async get(key: string) {
    const setting = await this.prisma.platformSetting.findUnique({ where: { key } })
    return setting?.value ?? null
  }

  async set(key: string, value: string, updatedBy: string) {
    return this.prisma.platformSetting.upsert({
      where: { key },
      create: { key, value, updatedBy },
      update: { value, updatedBy },
    })
  }

  async setBulk(entries: Record<string, string>, updatedBy: string) {
    const ops = Object.entries(entries).map(([key, value]) =>
      this.prisma.platformSetting.upsert({
        where: { key },
        create: { key, value, updatedBy },
        update: { value, updatedBy },
      })
    )
    return this.prisma.$transaction(ops)
  }

  async updateLogo(logoUrl: string, updatedBy: string) {
    return this.set('platform_logo_url', logoUrl, updatedBy)
  }

  async getTheme() {
    const [primaryColor, secondaryColor, logoUrl, platformName, heroTitle, heroSubtitle] = await Promise.all([
      this.get('platform_primary_color'),
      this.get('platform_secondary_color'),
      this.get('platform_logo_url'),
      this.get('platform_name'),
      this.get('hero_title'),
      this.get('hero_subtitle'),
    ])
    return { primaryColor, secondaryColor, logoUrl, platformName, heroTitle, heroSubtitle }
  }
}
