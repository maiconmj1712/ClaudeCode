'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/page-header'
import { clinicsApi } from '@/lib/api'
import { formatCNPJ, formatCurrency } from '@/lib/utils'
import { Search, Plus, CheckCircle, Clock, AlertTriangle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_CONFIG = {
  ACTIVE:    { label: 'Ativa',      color: 'badge-success' },
  TRIAL:     { label: 'Trial',      color: 'badge-info' },
  SUSPENDED: { label: 'Suspensa',   color: 'badge-warning' },
  CANCELLED: { label: 'Cancelada',  color: 'badge-destructive' },
} as const

const PLAN_LABELS: Record<string, string> = {
  BASIC:        'Básico',
  PROFESSIONAL: 'Profissional',
  ENTERPRISE:   'Enterprise',
}

export default function ClinicasPage() {
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('')
  const [plan, setPlan]       = useState('')
  const [page, setPage]       = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['clinics', { search, status, plan, page }],
    queryFn: () => clinicsApi.findAll({ search, status, plan, page, limit: 20 }),
    placeholderData: (prev) => prev,
  })

  const clinics = data?.data ?? []
  const total   = data?.total ?? 0
  const pages   = data?.pages ?? 1

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Clínicas"
        subtitle={`${total} clínicas cadastradas`}
      >
        <button className="btn btn-primary btn-sm gap-1">
          <Plus className="w-4 h-4" />
          Nova Clínica
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-content pt-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="input pl-9 w-full"
                placeholder="Buscar por nome, CNPJ ou e-mail..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>

            <select
              className="input w-full sm:w-40"
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1) }}
            >
              <option value="">Todos os status</option>
              <option value="ACTIVE">Ativa</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Suspensa</option>
              <option value="CANCELLED">Cancelada</option>
            </select>

            <select
              className="input w-full sm:w-40"
              value={plan}
              onChange={e => { setPlan(e.target.value); setPage(1) }}
            >
              <option value="">Todos os planos</option>
              <option value="BASIC">Básico</option>
              <option value="PROFESSIONAL">Profissional</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Clínica</th>
                <th>CNPJ</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Empresas</th>
                <th>Slug</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}><div className="skeleton h-4 w-full rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : clinics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    Nenhuma clínica encontrada.
                  </td>
                </tr>
              ) : clinics.map((clinic: any) => {
                const cfg = STATUS_CONFIG[clinic.planStatus as keyof typeof STATUS_CONFIG] ?? { label: clinic.planStatus, color: '' }
                return (
                  <tr key={clinic.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {clinic.logoUrl ? (
                          <img src={clinic.logoUrl} alt={clinic.razaoSocial} className="w-8 h-8 rounded object-contain" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {clinic.razaoSocial.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{clinic.razaoSocial}</p>
                          <p className="text-xs text-muted-foreground">{clinic.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{formatCNPJ(clinic.cnpj)}</td>
                    <td>{PLAN_LABELS[clinic.plan] ?? clinic.plan}</td>
                    <td>
                      <span className={`badge ${cfg.color}`}>{cfg.label}</span>
                    </td>
                    <td>{clinic._count?.companies ?? 0}</td>
                    <td>
                      <a
                        href={`/c/${clinic.slug}`}
                        target="_blank"
                        className="text-primary hover:underline text-sm font-mono"
                      >
                        /c/{clinic.slug}
                      </a>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn btn-ghost btn-sm text-xs">Ver</button>
                        <button className="btn btn-ghost btn-sm text-xs">Editar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">
              Página {page} de {pages} • {total} clínicas
            </span>
            <div className="flex items-center gap-1">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
