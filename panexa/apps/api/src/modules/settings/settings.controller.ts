import { Controller, Get, Put, Post, Body, Param, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SettingsService } from './settings.service'

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Public theme endpoint (no auth) — called by frontend before login
  @Get('theme')
  getTheme() {
    return this.settingsService.getTheme()
  }

  @Get()
  @Roles('ADMIN_PANEXA')
  getAll() {
    return this.settingsService.getAll()
  }

  @Get(':key')
  @Roles('ADMIN_PANEXA')
  get(@Param('key') key: string) {
    return this.settingsService.get(key)
  }

  @Put(':key')
  @Roles('ADMIN_PANEXA')
  set(@Param('key') key: string, @Body('value') value: string, @Req() req: any) {
    return this.settingsService.set(key, value, req.user.id)
  }

  @Put()
  @Roles('ADMIN_PANEXA')
  setBulk(@Body() entries: Record<string, string>, @Req() req: any) {
    return this.settingsService.setBulk(entries, req.user.id)
  }

  @Post('logo')
  @Roles('ADMIN_PANEXA')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^image\/(png|jpeg|svg\+xml|webp)$/)) {
        cb(new Error('Formato de arquivo não suportado'), false)
      } else {
        cb(null, true)
      }
    },
  }))
  async uploadLogo(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    // In production: upload to S3/R2 and return URL
    // For now: return a placeholder URL (replace with actual S3 upload logic)
    const logoUrl = `/uploads/logo-${Date.now()}.${file.originalname.split('.').pop()}`
    await this.settingsService.updateLogo(logoUrl, req.user.id)
    return { logoUrl }
  }
}
