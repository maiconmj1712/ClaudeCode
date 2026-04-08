import { Injectable, Logger } from '@nestjs/common'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sgMail = require('@sendgrid/mail')

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly enabled: boolean

  constructor() {
    const key = process.env.SENDGRID_API_KEY
    this.enabled = !!key
    if (key) sgMail.setApiKey(key)
    else this.logger.warn('SendGrid API key não configurada — e-mails desativados')
  }

  async send({ to, subject, html, text }: { to: string; subject: string; html?: string; text?: string }) {
    if (!this.enabled) {
      this.logger.debug(`[E-MAIL MOCK] Para: ${to} | Assunto: ${subject}`)
      return
    }

    await sgMail.send({
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL ?? 'noreply@panexa.com.br',
        name:  process.env.SENDGRID_FROM_NAME  ?? 'Panexa',
      },
      subject,
      html:  html ?? text ?? '',
      text:  text ?? '',
    })

    this.logger.log(`E-mail enviado para: ${to}`)
  }
}
