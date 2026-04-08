'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardApi, clinicsApi } from '@/lib/api'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, Building2, TrendingUp, Package } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#0cd5ef', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function RelatoriosPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard-panexa'],
    queryFn: dashboardApi.getPanexa,
  })

  const { data: clinics } = useQuery({
    queryKey: ['clinics-relatorios'],
    queryFn: () => clinicsApi.findAll({ limit: 10 }),
  })

  const kpi = dashboard ?? {}
  const clinicList = (clinics?.data ?? []) as any[]

  // Health score distribution
  const scoreRanges = [
    { name: '0–25',  count: clinicList.filter((c: any) => c.healthScore <= 25).length },
    { name: '26–50', count: clinicList.filter((c: any) => c.healthScore > 25 && c.healthScore <= 50).length },
    { name: '51–75', count: clinicList.filter((c: any) => c.healthScore > 50 && c.healthScore <= 75).length },
    { name: '76–100', count: clinicList.filter((c: any) => c.healthScore > 75).length },
  ]

  // Status distribution
  const statusDist = [
    { name: 'Ativas',    value: clinicList.filter((c: any) => c.status === 'ACTIVE').length },
    { name: 'Pendentes', value: clinicList.filter((c: any) => c.status === 'PENDING').length },
    { name: 'Suspensas', value: clinicList.filter((c: any) => c.status === 'SUSPENDED').length },
  ].filter(d => d.value > 0)

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Análise de performance, crescimento e saúde da plataforma"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total de Clínicas"
          value={kpi.totalClinics ?? clinicList.length}
          loading={isLoading}
          icon={<Building2 className="h-5 w-5 text-primary" />}
        />
        <StatCard
          label="Total de Empresas"
          value={kpi.totalCompanies ?? 0}
          loading={isLoading}
          icon={<Building2 className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          label="Colaboradores Ativos"
          value={kpi.totalEmployees ?? 0}
          loading={isLoading}
          icon={<Users className="h-5 w-5 text-amber-500" />}
        />
        <StatCard
          label="MRR Total"
          value={kpi.mrr ?? 0}
          isCurrency
          loading={isLoading}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Health score distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Distribuição de Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clinicList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                <BarChart3 className="h-8 w-8 opacity-30" />
                <p className="text-sm">Sem dados de clínicas</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scoreRanges} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="count" name="Clínicas" fill="#0cd5ef" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" /> Status das Clínicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusDist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                <Package className="h-8 w-8 opacity-30" />
                <p className="text-sm">Sem dados de status</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDist.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{v}</span>}
                  />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MRR trend placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Crescimento MRR (últimos 6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(kpi.mrrHistory ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <TrendingUp className="h-8 w-8 opacity-30" />
              <p className="text-sm">Dados de MRR disponíveis após o primeiro mês de operação</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={kpi.mrrHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="value" stroke="#0cd5ef" strokeWidth={2.5} dot={{ r: 4, fill: '#0cd5ef' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
