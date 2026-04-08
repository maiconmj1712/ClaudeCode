import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CompaniesService } from './companies.service'

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @Roles('ADMIN_PANEXA', 'ADMIN_CLINICA')
  findAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const clinicId = req.user.role === 'ADMIN_CLINICA' ? req.user.clinicId : undefined
    return this.companiesService.findAll({
      clinicId,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    })
  }

  @Post()
  @Roles('ADMIN_PANEXA', 'ADMIN_CLINICA')
  create(@Req() req: any, @Body() dto: any) {
    if (req.user.role === 'ADMIN_CLINICA') {
      dto.clinicId = req.user.clinicId
    }
    return this.companiesService.create(dto)
  }

  @Get(':id')
  @Roles('ADMIN_PANEXA', 'ADMIN_CLINICA', 'ADMIN_EMPRESA')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id)
  }

  @Put(':id')
  @Roles('ADMIN_PANEXA', 'ADMIN_CLINICA', 'ADMIN_EMPRESA')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.companiesService.update(id, dto)
  }

  // Employees sub-resource
  @Get(':id/employees')
  @Roles('ADMIN_PANEXA', 'ADMIN_CLINICA', 'ADMIN_EMPRESA')
  getEmployees(
    @Param('id') id: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.companiesService.getEmployees(id, {
      search, status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    })
  }

  @Post(':id/employees')
  @Roles('ADMIN_EMPRESA')
  createEmployee(@Param('id') id: string, @Body() dto: any) {
    return this.companiesService.createEmployee(id, dto)
  }

  @Put(':id/employees/:employeeId')
  @Roles('ADMIN_EMPRESA')
  updateEmployee(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
    @Body() dto: any,
  ) {
    return this.companiesService.updateEmployee(id, employeeId, dto)
  }

  @Patch(':id/employees/:employeeId/block')
  @Roles('ADMIN_EMPRESA', 'ADMIN_CLINICA', 'ADMIN_PANEXA')
  blockEmployee(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.companiesService.blockEmployee(id, employeeId)
  }

  @Post(':id/employees/import')
  @Roles('ADMIN_EMPRESA')
  importEmployees(@Param('id') id: string, @Body('rows') rows: any[]) {
    return this.companiesService.importEmployees(id, rows)
  }
}
