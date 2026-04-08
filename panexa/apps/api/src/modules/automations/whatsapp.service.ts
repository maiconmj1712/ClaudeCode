import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name)
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly instance: string
  private readonly enabled: boolean

  constructor() {
    this.baseUrl  = process.env.EVOLUTION_API_URL ?? 'http://localhost:8080'
    this.apiKey   = process.env.EVOLUTION_API_KEY ?? ''
    this.instance = process.env.EVOLUTION_INSTANCE ?? 'panexa-main'
    this.enabled  = !!this.apiKey
    if (!this.enabled) this.logger.warn('Evolution API key não configurada — WhatsApp desativado')
  }

  async send({ to, text }: { to: string; text: string }) {
    // Normalize phone: remove non-digits, ensure country code
    const phone = to.replace(/\D/g, '')
    const number = phone.startsWith('55') ? phone : `55${phone}`

    if (!this.enabled) {
      this.logger.debug(`[WHATSAPP MOCK] Para: ${number} | Mensagem: ${text.slice(0, 50)}...`)
      return
    }

    try {
      await axios.post(
        `${this.baseUrl}/message/sendText/${this.instance}`,
        { number: `${number}@s.whatsapp.net`, textMessage: { text } },
        { headers: { apikey: this.apiKey } }
      )
      this.logger.log(`WhatsApp enviado para: ${number}`)
    } catch (err: any) {
      this.logger.error(`Erro ao enviar WhatsApp para ${number}: ${err?.message}`)
    }
  }
}
