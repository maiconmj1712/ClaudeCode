import { Module } from '@nestjs/common'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { AutomationsModule } from '../automations/automations.module'

@Module({
  imports: [AutomationsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
