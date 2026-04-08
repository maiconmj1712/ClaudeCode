'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatCard } from '@/components/shared/stat-card'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CreditCard, ShieldAlert, Package, ArrowUpRight, AlertTriangle, Plus } from 'lucide-react'
import type { CompanyDashboardDto } from '@panexa/shared-types'

export default function EmpresaDashboard() {
  const { data, isLoading } = useQuery<CompanyDashboardDto>({
    queryKey: ['dashboard', 'company'],
    queryFn: dashboardApi.getCompany,
    refetchInterval: 60_000,
  })

  return (
    <div>
      <PageHeader title="Painel da Empresa" subtitle="Gerencie benefícios e colaboradores">
        <Button asChild>
          <a href="/empresa/colaboradores">
            <Plus className="h-4 w-4" /> Adicionar colaboradores
          </a>
        </Button>
      </PageHeader>

      {/* Inadimplência alert */}
      {data?.isOverdue && (
        <div className="mb-6 rounded-2xl bg-destructive/10 border-2 border-destructive p-5 flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/20 flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-destructive">Pagamento em atraso — {formatCurrency(data.overdueAmount ?? 0)}</p>
            <p className="text-sm text-destructive/80 mt-1">O acesso dos colaboradores será suspenso em breve. Regularize agora para evitar interrupção.</p>
          </div>
          <Button variant="destructive" size="sm" asChild>
            <a href={data.overduePaymentUrl ?? '/empresa/financeiro'}>Pagar agora</a>
          </Button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total de Licenças"
          value={data?.totalLicenses ?? 0}
          icon={<Package className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          loading={isLoading}
        />
        <StatCard
          label="Licenças Utilizadas"
          value={data?.usedLicenses ?? 0}
          icon={<Users className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-100"
          loading={isLoading}
        />
        <StatCard
          label="Licenças Disponíveis"
          value={data?.availableLicenses ?? 0}
          icon={<ShieldAlert className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-100"
          loading={isLoading}
        />
        <StatCard
          label="Próxima Cobrança"
          value={data?.nextBillingAmount ?? 0}
          isCurrency
          icon={<CreditCard className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-100"
          loading={isLoading}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active products */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-5">Produtos Contratados</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.activeProducts ?? []).map(product => (
                <div key={product.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.shortDesc}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground text-sm">{formatCurrency(product.pricePerUnit)}<span className="text-xs font-normal text-muted-foreground">/colab/mês</span></p>
                  </div>
                  <Badge variant="success">Ativo</Badge>
                </div>
              ))}
              {!data?.activeProducts?.length && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum produto contratado. Fale com sua clínica parceira.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Billing + next steps */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Próxima cobrança</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="skeleton h-16 rounded-xl" /> : (
                <>
                  <p className="text-3xl font-black text-foreground">{formatCurrency(data?.nextBillingAmount ?? 0)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vence em {data?.nextBillingDate ? formatDate(data.nextBillingDate) : '--'}
                  </p>
                  <Button size="sm" variant="outline" className="w-full mt-4" asChild>
                    <a href="/empresa/financeiro">Ver histórico</a>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Upsell */}
          {data?.upsellSuggestions?.length ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-primary">💡 Sugestão para sua equipe</CardTitle>
              </CardHeader>
              <CardContent>
                {data.upsellSuggestions.slice(0, 1).map(p => (
                  <div key={p.id}>
                    <p className="font-semibold text-foreground text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.shortDesc}</p>
                    <p className="text-lg font-bold text-primary mt-2">{formatCurrency(p.pricePerUnit)}<span className="text-xs font-normal text-muted-foreground">/colab/mês</span></p>
                    <Button size="sm" className="w-full mt-3">Contratar agora</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Recent employees */}
      <div className="mt-6 bg-card rounded-2xl border border-border shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-semibold text-foreground">Colaboradores Recentes</h3>
          <a href="/empresa/colaboradores" className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
            Gerenciar todos <ArrowUpRight className="h-3.5 w-3.5" />
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
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Departamento</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentEmployees ?? []).map(emp => (
                  <tr key={emp.id}>
                    <td className="font-medium text-sm">{emp.name}</td>
                    <td className="text-muted-foreground text-sm">{emp.email}</td>
                    <td className="text-muted-foreground text-sm">{emp.department ?? '—'}</td>
                    <td>
                      <Badge variant={emp.status === 'ACTIVE' ? 'success' : emp.status === 'PENDING_ACTIVATION' ? 'warning' : 'destructive'}>
                        {emp.status === 'ACTIVE' ? 'Ativo' : emp.status === 'PENDING_ACTIVATION' ? 'Aguardando ativação' : 'Bloqueado'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {!data?.recentEmployees?.length && (
                  <tr><td colSpan={4} className="text-center text-muted-foreground py-8">Nenhum colaborador cadastrado ainda.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
