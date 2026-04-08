import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { AutomationsProcessor } from './automations.processor'
import { EmailService } from './email.service'
import { WhatsAppService } from './whatsapp.service'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'automations' }),
  ],
  providers: [AutomationsProcessor, EmailService, WhatsAppService],
  exports: [BullModule, EmailService, WhatsAppService],
})
export class AutomationsModule {}
