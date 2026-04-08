import { Module } from '@nestjs/common'
import { ClinicsController } from './clinics.controller'
import { ClinicsService } from './clinics.service'
import { AutomationsModule } from '../automations/automations.module'

@Module({
  imports: [AutomationsModule],
  controllers: [ClinicsController],
  providers: [ClinicsService],
  exports: [ClinicsService],
})
export class ClinicsModule {}
