import { Module } from '@nestjs/common'
import { CompaniesController } from './companies.controller'
import { CompaniesService } from './companies.service'
import { AutomationsModule } from '../automations/automations.module'

@Module({
  imports: [AutomationsModule],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
