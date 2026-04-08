'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { PageHeader } from '@/components/shared/page-header'
import { ordersApi } from '@/lib/api'
import { formatCurrency, formatDatetime } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_CONFIG = {
  PENDING:    { label: 'Pendente',    color: 'badge-warning' },
  PAID:       { label: 'Pago',        color: 'badge-success' },
  OVERDUE:    { label: 'Inadimplente',color: 'badge-destructive' },
  CANCELLED:  { label: 'Cancelado',   color: 'badge' },
  REFUNDED:   { label: 'Reembolsado', color: 'badge-info' },
} as const

export default function VendasPage() {
  const { data: session } = useSession()
  const [status, setStatus] = useState('')
  const [page, setPage]     = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', { status, page }],
    queryFn: () => ordersApi.findAll({ status: status || undefined, page, limit: 20 }),
    placeholderData: (prev) => prev,
  })

  const orders = data?.data ?? []
  const total  = data?.total ?? 0
  const pages  = data?.pages ?? 1

  return (
    <div className="page-container">
      <PageHeader title="Vendas" subtitle={`${total} pedidos encontrados`} />

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-content pt-4">
          <div className="flex gap-2 flex-wrap">
            {['', 'PAID', 'PENDING', 'OVERDUE', 'CANCELLED'].map(s => (
              <button
                key={s}
                className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setStatus(s); setPage(1) }}
              >
                {s === '' ? 'Todos' : (STATUS_CONFIG as any)[s]?.label ?? s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Empresa</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j}><div className="skeleton h-4 w-full rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">Nenhuma venda encontrada.</td>
                </tr>
              ) : orders.map((order: any) => {
                const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? { label: order.status, color: 'badge' }
                return (
                  <tr key={order.id}>
                    <td className="font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td>{order.company?.razaoSocial ?? order.companyId}</td>
                    <td className="font-semibold">{formatCurrency(order.finalAmount)}</td>
                    <td><span className={`badge ${cfg.color}`}>{cfg.label}</span></td>
                    <td className="text-sm text-muted-foreground">{formatDatetime(order.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">Página {page} de {pages}</span>
            <div className="flex gap-1">
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
