'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { PageHeader } from '@/components/shared/page-header'
import { dashboardApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react'

export default function RankingPage() {
  const { data: session } = useSession()
  const clinicId = (session?.user as any)?.clinicId

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['clinic-dashboard'],
    queryFn: () => dashboardApi.getClinic(),
  })

  const position    = dashboard?.rankingPosition ?? 99
  const total       = dashboard?.rankingTotal ?? 0
  const percentile  = total ? Math.round((1 - (position - 1) / total) * 100) : 0

  function getMedalIcon(pos: number) {
    if (pos === 1) return <Trophy className="w-8 h-8 text-yellow-500" />
    if (pos === 2) return <Medal className="w-8 h-8 text-gray-400" />
    if (pos === 3) return <Medal className="w-8 h-8 text-amber-600" />
    return <Star className="w-8 h-8 text-primary" />
  }

  return (
    <div className="page-container max-w-2xl">
      <PageHeader
        title="Ranking Mensal"
        subtitle="Sua posição no ranking de clínicas parceiras este mês."
      />

      {/* Current position highlight */}
      <div className="card p-8 mb-6 text-center">
        {isLoading ? (
          <div className="space-y-3">
            <div className="skeleton h-16 w-16 rounded-full mx-auto" />
            <div className="skeleton h-8 w-24 rounded mx-auto" />
            <div className="skeleton h-4 w-48 rounded mx-auto" />
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">{getMedalIcon(position)}</div>
            <div className="text-6xl font-black text-primary mb-1">#{position}</div>
            <p className="text-muted-foreground mb-4">de {total} clínicas ativas</p>
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progresso</span>
                <span>Top {100 - percentile}%</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-700"
                  style={{ width: `${percentile}%` }}
                />
              </div>
            </div>
            {position <= 3 && (
              <p className="mt-4 text-sm font-medium text-primary">
                🏆 Parabéns! Você está no pódio este mês!
              </p>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-sm text-muted-foreground mb-1">MRR gerado este mês</p>
          <p className="text-2xl font-bold text-primary">
            {isLoading ? <span className="skeleton inline-block h-7 w-28 rounded" /> : formatCurrency(dashboard?.mrrGenerated ?? 0)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted-foreground mb-1">Comissão este mês</p>
          <p className="text-2xl font-bold">
            {isLoading ? <span className="skeleton inline-block h-7 w-28 rounded" /> : formatCurrency(dashboard?.commissionThisMonth ?? 0)}
          </p>
        </div>
      </div>

      {/* Growth tip */}
      <div className="card p-5 border-primary/20 bg-primary/5">
        <div className="flex gap-3">
          <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm mb-1">Como subir no ranking?</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Adicione mais empresas clientes à sua carteira</li>
              <li>Convide colaboradores para ativar seus benefícios</li>
              <li>Mantenha os pagamentos em dia (sem inadimplência)</li>
              <li>Compartilhe sua URL exclusiva nas redes sociais</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
