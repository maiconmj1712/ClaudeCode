'use client'

import { useQuery } from '@tanstack/react-query'
import { paymentsApi, ordersApi } from '@/lib/api'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function FinanceiroPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders-financeiro'],
    queryFn: () => ordersApi.findAll({ limit: 50 }),
  })

  const list = (orders?.data ?? []) as any[]

  const totalReceita   = list.reduce((s: number, o: any) => s + (o.totalAmount ?? 0), 0)
  const totalComissao  = list.reduce((s: number, o: any) => s + (o.platformCommission ?? 0), 0)
  const totalPagos     = list.filter((o: any) => o.paymentStatus === 'PAID').length
  const totalPendentes = list.filter((o: any) => o.paymentStatus === 'PENDING').length

  const STATUS_LABEL: Record<string, string> = {
    PAID:     'Pago',
    PENDING:  'Pendente',
    FAILED:   'Falhou',
    REFUNDED: 'Reembolsado',
    OVERDUE:  'Inadimplente',
  }
  const STATUS_VARIANT: Record<string, any> = {
    PAID:     'success',
    PENDING:  'warning',
    FAILED:   'destructive',
    REFUNDED: 'info',
    OVERDUE:  'destructive',
  }

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Visão geral de receitas, comissões e pagamentos da plataforma"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Receita Total"
          value={totalReceita}
          isCurrency
          loading={isLoading}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
        />
        <StatCard
          label="Comissão Panexa"
          value={totalComissao}
          isCurrency
          loading={isLoading}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          label="Pedidos Pagos"
          value={totalPagos}
          loading={isLoading}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          label="Pedidos Pendentes"
          value={totalPendentes}
          loading={isLoading}
          icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
        />
      </div>

      <div className="bg-card rounded-[1rem] border border-border shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Histórico de Pagamentos</h2>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-lg" />)}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Empresa</th>
                  <th>Valor Total</th>
                  <th>Comissão</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {list.map((order: any) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs text-muted-foreground">{order.id?.slice(0, 8)}…</td>
                    <td className="text-sm font-medium">{order.company?.name ?? '—'}</td>
                    <td className="text-sm font-semibold">{formatCurrency(order.totalAmount ?? 0)}</td>
                    <td className="text-sm text-emerald-600 font-medium">{formatCurrency(order.platformCommission ?? 0)}</td>
                    <td>
                      <Badge variant={STATUS_VARIANT[order.paymentStatus] ?? 'info'}>
                        {STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
                {!list.length && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <DollarSign className="h-8 w-8 opacity-30" />
                        <p>Nenhum pagamento encontrado</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
