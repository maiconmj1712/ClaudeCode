'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatCard } from '@/components/shared/stat-card'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts'
import { Building2, DollarSign, Users, TrendingUp, Activity, ArrowUpRight } from 'lucide-react'
import type { PanexaDashboardDto } from '@panexa/shared-types'

const ORDER_STATUS_COLOR: Record<string, 'success' | 'warning' | 'destructive' | 'info'> = {
  PAID:      'success',
  PENDING:   'warning',
  FAILED:    'destructive',
  OVERDUE:   'destructive',
  CANCELLED: 'info',
}

export default function AdminPanexaDashboard() {
  const { data, isLoading } = useQuery<PanexaDashboardDto>({
    queryKey: ['dashboard', 'panexa'],
    queryFn: dashboardApi.getPanexa,
    refetchInterval: 30_000, // 30s real-time refresh
  })

  return (
    <div>
      <PageHeader
        title="Dashboard Global"
        subtitle={`Visão geral da plataforma Panexa · Atualiza a cada 30s`}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-green-500 animate-pulse" />
          Tempo real
        </div>
      </PageHeader>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Clínicas Ativas"
          value={data?.clinicsActive ?? 0}
          trend={data?.clinicsNew ? (data.clinicsNew / (data.clinicsActive - data.clinicsNew)) * 100 : undefined}
          trendLabel="novas este mês"
          icon={<Building2 className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          loading={isLoading}
        />
        <StatCard
          label="MRR Total"
          value={data?.mrrTotal ?? 0}
          isCurrency
          compact
          trend={data?.mrrGrowth}
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          loading={isLoading}
        />
        <StatCard
          label="GMV do Mês"
          value={data?.gmvMonth ?? 0}
          isCurrency
          compact
          trend={data?.gmvGrowth}
          icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          loading={isLoading}
        />
        <StatCard
          label="Colaboradores Ativos"
          value={data?.employeesActive ?? 0}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          loading={isLoading}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* MRR evolution */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Evolução do MRR</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Últimos 12 meses</p>
            </div>
            {data && (
              <div className="text-right">
                <p className="text-xl font-bold text-foreground">{formatCurrency(data.mrrTotal)}</p>
                <p className="text-xs text-emerald-600 font-semibold">+{data.mrrGrowth?.toFixed(1)}% vs. mês ant.</p>
              </div>
            )}
          </div>
          {isLoading ? (
            <div className="skeleton h-48 w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data?.mrrChart ?? []}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'MRR']} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#mrrGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top 10 clinics */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Top Clínicas do Mês</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Por volume de vendas</p>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-8 w-full rounded-lg" />)}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={(data?.topClinics ?? []).slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="clinicName" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'MRR']} />
                <Bar dataKey="mrr" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">Últimas Transações</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Atualizando em tempo real</p>
          </div>
          <a href="/admin/financeiro" className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
            Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-10 w-full rounded-lg" />)}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Empresa</th>
                  <th>Clínica</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentTransactions ?? []).map(order => (
                  <tr key={order.id}>
                    <td className="text-muted-foreground text-xs">{formatDate(order.createdAt)}</td>
                    <td className="font-medium">{order.companyId}</td>
                    <td className="text-muted-foreground text-sm">{order.clinicId}</td>
                    <td className="font-semibold">{formatCurrency(order.finalAmount)}</td>
                    <td>
                      <Badge variant={ORDER_STATUS_COLOR[order.status] ?? 'info'} className="capitalize">
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {(!data?.recentTransactions?.length) && (
                  <tr><td colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma transação encontrada</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
