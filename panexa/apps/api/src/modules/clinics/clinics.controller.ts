import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { ClinicsService } from './clinics.service'

@ApiTags('Clinics')
@ApiBearerAuth()
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  // Public endpoint — no auth required
  @Get('public/:slug')
  @ApiOperation({ summary: 'Get clinic storefront by slug (public)' })
  getBySlug(@Param('slug') slug: string) {
    return this.clinicsService.findBySlug(slug)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA')
  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'plan', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('search') search?: string,
    @Query('plan') plan?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.clinicsService.findAll({
      search, plan, status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    })
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA')
  @Post()
  create(@Body() dto: any) {
    return this.clinicsService.create(dto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.clinicsService.update(id, dto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA')
  @Patch(':id/activate')
  activatePlan(@Param('id') id: string) {
    return this.clinicsService.activatePlan(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA')
  @Patch(':id/suspend')
  suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.clinicsService.suspendClinic(id, reason)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA')
  @Get(':id/commissions')
  getCommissions(
    @Param('id') id: string,
    @Query('month') month?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.clinicsService.getCommissions(id, {
      month,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    })
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA', 'ADMIN_CLINICA')
  @Get(':id/health-score')
  getHealthScore(@Param('id') id: string) {
    return this.clinicsService.getHealthScore(id)
  }

  // Clinic admin manages their own products
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_CLINICA')
  @Get('me/products')
  getMyProducts(@Req() req: any) {
    return this.clinicsService.getClinicProducts(req.user.clinicId)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_CLINICA')
  @Put('me/products')
  updateMyProducts(@Req() req: any, @Body('productIds') productIds: string[]) {
    return this.clinicsService.updateClinicProducts(req.user.clinicId, productIds)
  }
}
