import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { OrdersService } from './orders.service'

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Public: create order from storefront
  @Post()
  create(@Body() dto: any) {
    return this.ordersService.create(dto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA', 'ADMIN_CLINICA', 'ADMIN_EMPRESA')
  @Get()
  findAll(
    @Req() req: any,
    @Query('clinicId') clinicId?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = { status }

    if (req.user.role === 'ADMIN_CLINICA') filters.clinicId = req.user.clinicId
    else if (req.user.role === 'ADMIN_EMPRESA') filters.companyId = req.user.companyId
    else {
      if (clinicId) filters.clinicId = clinicId
      if (companyId) filters.companyId = companyId
    }

    return this.ordersService.findAll({
      ...filters,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    })
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA', 'ADMIN_CLINICA', 'ADMIN_EMPRESA')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA')
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id)
  }
}
