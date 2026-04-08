'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardApi, clinicsApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatCard } from '@/components/shared/stat-card'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { DollarSign, Building2, Users, Trophy, Copy, QrCode, ArrowUpRight, Star } from 'lucide-react'
import { toast } from 'sonner'
import type { ClinicDashboardDto } from '@panexa/shared-types'

const RANK_COLORS = ['text-amber-500', 'text-gray-400', 'text-amber-700', 'text-muted-foreground']

export default function ClinicaDashboard() {
  const { data, isLoading } = useQuery<ClinicDashboardDto>({
    queryKey: ['dashboard', 'clinic'],
    queryFn: dashboardApi.getClinic,
    refetchInterval: 60_000,
  })

  const clinicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/c/[sua-slug]`
    : 'panexa.com.br/c/sua-clinica'

  const copyUrl = () => {
    navigator.clipboard.writeText(clinicUrl)
    toast.success('URL copiada!')
  }

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Acompanhe suas vendas e comissões em tempo real" />

      {/* URL exclusiva */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-5 mb-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">Sua URL exclusiva</p>
          <p className="font-mono text-sm font-semibold">{clinicUrl}</p>
          <p className="text-xs text-white/60 mt-1">Compartilhe com as empresas da sua carteira</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={copyUrl}>
            <Copy className="h-4 w-4" /> Copiar
          </Button>
          <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
            <a href="/clinica/minha-url"><QrCode className="h-4 w-4" /> QR Code</a>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="MRR Gerado"
          value={data?.mrrGenerated ?? 0}
          isCurrency compact
          trend={data?.mrrGrowth}
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-100"
          loading={isLoading}
        />
        <StatCard
          label="Comissão do Mês"
          value={data?.commissionThisMonth ?? 0}
          isCurrency compact
          trend={data?.commissionGrowth}
          icon={<Star className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-100"
          loading={isLoading}
        />
        <StatCard
          label="Empresas Ativas"
          value={data?.activeCompanies ?? 0}
          icon={<Building2 className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          loading={isLoading}
        />
        <StatCard
          label="Colaboradores"
          value={data?.totalEmployees ?? 0}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-100"
          loading={isLoading}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Commission chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Evolução das Comissões</h3>
              <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
            </div>
          </div>
          {isLoading ? (
            <div className="skeleton h-48 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data?.commissionChart ?? []}>
                <defs>
                  <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'Comissão']} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#commGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ranking */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="font-semibold text-foreground">Seu Ranking</h3>
              <p className="text-xs text-muted-foreground">Mês atual</p>
            </div>
          </div>

          {isLoading ? (
            <div className="skeleton h-32 rounded-xl" />
          ) : (
            <>
              <div className="text-center py-4">
                <div className="text-6xl font-black text-amber-500">#{data?.rankingPosition ?? '--'}</div>
                <p className="text-sm text-muted-foreground mt-1">de {data?.rankingTotal ?? '--'} clínicas</p>
              </div>
              <div className="mt-auto">
                <div className="bg-muted/40 rounded-xl p-3 text-sm">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Sua posição</span>
                    <span>{data?.rankingPosition}/{data?.rankingTotal}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${data ? (1 - data.rankingPosition / data.rankingTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3" asChild>
                  <a href="/clinica/ranking">Ver ranking completo</a>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent sales */}
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-semibold text-foreground">Últimas Vendas</h3>
          <a href="/clinica/vendas" className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
            Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-full rounded-lg" />)}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Empresa</th>
                  <th>Valor Bruto</th>
                  <th>Sua Comissão (30%)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentSales ?? []).map(order => (
                  <tr key={order.id}>
                    <td className="text-muted-foreground text-xs">{formatDate(order.createdAt)}</td>
                    <td className="font-medium text-sm">{order.companyId}</td>
                    <td className="font-semibold">{formatCurrency(order.finalAmount)}</td>
                    <td className="font-semibold text-emerald-600">{formatCurrency(order.finalAmount * 0.30)}</td>
                    <td>
                      <Badge variant={order.status === 'PAID' ? 'success' : 'warning'}>
                        {order.status === 'PAID' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {!data?.recentSales?.length && (
                  <tr><td colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma venda ainda. Compartilhe sua URL!</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
