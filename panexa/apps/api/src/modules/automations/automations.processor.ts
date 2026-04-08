import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { Logger } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { EmailService } from './email.service'
import { WhatsAppService } from './whatsapp.service'

@Processor('automations')
export class AutomationsProcessor {
  private readonly logger = new Logger(AutomationsProcessor.name)

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private whatsapp: WhatsAppService,
  ) {}

  @Process('send-notification')
  async handleNotification(job: Job<{ trigger: string; companyId?: string; clinicId?: string; employeeId?: string; orderId?: string }>) {
    const { trigger, companyId, clinicId, employeeId, orderId } = job.data
    this.logger.log(`Processando automação: ${trigger}`)

    // Find applicable templates
    const templates = await this.prisma.automationTemplate.findMany({
      where: { trigger: trigger as any, isActive: true },
    })

    for (const template of templates) {
      try {
        const vars = await this.buildVariables({ trigger, companyId, clinicId, employeeId, orderId })
        const rendered = this.renderTemplate(template.body, vars)
        const subject  = template.subject ? this.renderTemplate(template.subject, vars) : undefined

        if (template.channel === 'EMAIL' || template.channel === 'BOTH') {
          if (vars.email) {
            await this.email.send({ to: vars.email, subject: subject ?? 'Panexa', html: rendered })
            await this.logSent(template.id, trigger, vars, 'EMAIL', vars.email)
          }
        }

        if (template.channel === 'WHATSAPP' || template.channel === 'BOTH') {
          if (vars.phone) {
            await this.whatsapp.send({ to: vars.phone, text: this.stripHtml(rendered) })
            await this.logSent(template.id, trigger, vars, 'WHATSAPP', vars.phone)
          }
        }
      } catch (err) {
        this.logger.error(`Erro ao processar template ${template.id}: ${err}`)
      }
    }
  }

  private async buildVariables(ctx: any): Promise<Record<string, string>> {
    const vars: Record<string, string> = {
      app_url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    }

    if (ctx.companyId) {
      const company = await this.prisma.company.findUnique({ where: { id: ctx.companyId } })
      if (company) {
        vars.company_name  = company.razaoSocial
        vars.contact_name  = company.contactName
        vars.email         = company.email
        vars.phone         = company.phone
        vars.dashboard_url = `${vars.app_url}/empresa/dashboard`
      }
    }

    if (ctx.clinicId) {
      const clinic = await this.prisma.clinic.findUnique({ where: { id: ctx.clinicId } })
      if (clinic) {
        vars.clinic_name   = clinic.nomeFantasia ?? clinic.razaoSocial
        vars.clinic_url    = `${vars.app_url}/c/${clinic.slug}`
        vars.email         = clinic.email
        vars.phone         = clinic.phone
        vars.dashboard_url = `${vars.app_url}/clinica/dashboard`
      }
    }

    if (ctx.orderId) {
      const order = await this.prisma.order.findUnique({ where: { id: ctx.orderId }, include: { items: { include: { product: true } } } })
      if (order) {
        vars.amount       = `R$ ${order.finalAmount.toFixed(2).replace('.', ',')}`
        vars.product_name = order.items.map(i => i.product.name).join(', ')
        vars.retry_url    = `${vars.app_url}/c/checkout/retry?order=${order.id}`
        vars.payment_url  = `${vars.app_url}/empresa/financeiro`
      }
    }

    if (ctx.employeeId) {
      const emp = await this.prisma.employee.findUnique({ where: { id: ctx.employeeId }, include: { company: true } })
      if (emp) {
        vars.employee_name  = emp.name
        vars.email          = emp.email
        vars.phone          = emp.phone ?? ''
        vars.activation_url = `${vars.app_url}/ativar/${emp.inviteToken}`
        vars.company_name   = emp.company.razaoSocial
      }
    }

    return vars
  }

  private renderTemplate(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  }

  private async logSent(templateId: string, trigger: string, vars: Record<string, string>, channel: string, to: string) {
    await this.prisma.automationLog.create({
      data: {
        templateId,
        recipientId:   vars.company_id ?? vars.clinic_id ?? vars.employee_id ?? 'unknown',
        recipientType: vars.company_id ? 'company' : vars.clinic_id ? 'clinic' : 'employee',
        channel:       channel as any,
        to,
        subject:       vars.subject,
        status:        'SENT',
        sentAt:        new Date(),
      },
    })
  }
}
