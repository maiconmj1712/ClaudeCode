import { Module } from '@nestjs/common'
import { PaymentsController } from './payments.controller'
import { AutomationsModule } from '../automations/automations.module'

@Module({
  imports: [AutomationsModule],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
