import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { ProductsService } from './products.service'

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Public: list active products (for storefront price calculator)
  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.productsService.findAll({
      category,
      type,
      isActive: isActive !== undefined ? isActive !== 'false' : true,
    })
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id)
  }

  @Get(':id/price')
  calculatePrice(
    @Param('id') id: string,
    @Query('quantity') quantity: string,
  ) {
    return this.productsService.calculatePrice(id, parseInt(quantity) || 1)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA')
  @Post()
  create(@Body() dto: any) {
    return this.productsService.create(dto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.productsService.update(id, dto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_PANEXA')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id)
  }
}
