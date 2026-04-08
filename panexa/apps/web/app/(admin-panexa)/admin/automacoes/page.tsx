'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { Bell, Mail, MessageSquare, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react'

const TRIGGER_LABEL: Record<string, string> = {
  EMPLOYEE_INVITE:        'Convite de colaborador',
  ORDER_CONFIRMED:        'Pedido confirmado',
  PAYMENT_OVERDUE:        'Pagamento inadimplente',
  LICENSE_EXPIRING:       'Licença expirando',
  WELCOME_CLINIC:         'Boas-vindas clínica',
  WELCOME_COMPANY:        'Boas-vindas empresa',
  PAYMENT_RECEIVED:       'Pagamento recebido',
  REPORT_WEEKLY:          'Relatório semanal',
}

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  email:    <Mail className="h-4 w-4" />,
  whatsapp: <MessageSquare className="h-4 w-4" />,
  both:     <Bell className="h-4 w-4" />,
}

export default function AutomacoesPage() {
  const [tab, setTab] = useState<'templates' | 'logs'>('templates')

  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['automation-templates'],
    queryFn: () => api.get('/automations/templates').then(r => r.data),
  })

  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ['automation-logs'],
    queryFn: () => api.get('/automations/logs').then(r => r.data),
    enabled: tab === 'logs',
  })

  const templateList = (templates?.data ?? templates ?? []) as any[]
  const logList      = (logs?.data ?? logs ?? []) as any[]

  return (
    <div>
      <PageHeader
        title="Automações"
        subtitle="Disparos automáticos de e-mail e WhatsApp da plataforma"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Templates ativos',  value: templateList.filter((t: any) => t.isActive).length, icon: Zap,           color: 'text-primary' },
          { label: 'Disparos hoje',     value: logList.filter((l: any) => l.sentAt?.startsWith(new Date().toISOString().slice(0,10))).length, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Falhas recentes',   value: logList.filter((l: any) => l.status === 'FAILED').length, icon: XCircle,  color: 'text-destructive' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit mb-6">
        {(['templates', 'logs'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t === 'templates' ? 'Templates' : 'Histórico de Disparos'}
          </button>
        ))}
      </div>

      {tab === 'templates' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {loadingTemplates
            ? [...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-[1rem]" />)
            : templateList.length === 0
            ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Zap className="h-10 w-10 opacity-30" />
                <p>Nenhum template configurado</p>
                <p className="text-xs">Execute o seed para carregar os templates padrão</p>
              </div>
            )
            : templateList.map((tpl: any) => (
              <Card key={tpl.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm">{tpl.name}</CardTitle>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-muted-foreground">{CHANNEL_ICON[tpl.channel] ?? <Bell className="h-4 w-4" />}</span>
                      <Badge variant={tpl.isActive ? 'success' : 'secondary'}>
                        {tpl.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    Gatilho: <span className="font-medium text-foreground">{TRIGGER_LABEL[tpl.trigger] ?? tpl.trigger}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{tpl.subject || tpl.bodyText || '—'}</p>
                </CardContent>
              </Card>
            ))
          }
        </div>
      )}

      {tab === 'logs' && (
        <div className="bg-card rounded-[1rem] border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            {loadingLogs ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-lg" />)}
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Template</th>
                    <th>Destinatário</th>
                    <th>Canal</th>
                    <th>Status</th>
                    <th>Enviado em</th>
                  </tr>
                </thead>
                <tbody>
                  {logList.map((log: any) => (
                    <tr key={log.id}>
                      <td className="text-sm font-medium">{log.template?.name ?? '—'}</td>
                      <td className="text-sm text-muted-foreground">{log.recipientEmail ?? log.recipientPhone ?? '—'}</td>
                      <td>
                        <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                          {CHANNEL_ICON[log.channel] ?? <Bell className="h-3.5 w-3.5" />}
                          {log.channel}
                        </span>
                      </td>
                      <td>
                        <Badge variant={log.status === 'SENT' ? 'success' : log.status === 'FAILED' ? 'destructive' : 'warning'}>
                          {log.status === 'SENT' ? 'Enviado' : log.status === 'FAILED' ? 'Falhou' : log.status ?? '—'}
                        </Badge>
                      </td>
                      <td className="text-xs text-muted-foreground">{formatDate(log.sentAt)}</td>
                    </tr>
                  ))}
                  {!logList.length && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="h-8 w-8 opacity-30" />
                          <p>Nenhum disparo registrado</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
