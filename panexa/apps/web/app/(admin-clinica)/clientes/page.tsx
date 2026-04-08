'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/page-header'
import { companiesApi } from '@/lib/api'
import { formatCNPJ } from '@/lib/utils'
import { Search, ChevronLeft, ChevronRight, Building2 } from 'lucide-react'

export default function ClientesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['companies', { search, page }],
    queryFn: () => companiesApi.findAll({ search, page, limit: 20 }),
    placeholderData: (prev) => prev,
  })

  const companies = data?.data ?? []
  const total     = data?.total ?? 0
  const pages     = data?.pages ?? 1

  return (
    <div className="page-container">
      <PageHeader title="Empresas Clientes" subtitle={`${total} empresas vinculadas`} />

      <div className="card mb-6">
        <div className="card-content pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="input pl-9 w-full sm:w-80"
              placeholder="Buscar por nome ou CNPJ..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-4 w-3/4 rounded mb-2" />
              <div className="skeleton h-3 w-1/2 rounded mb-4" />
              <div className="skeleton h-3 w-full rounded" />
            </div>
          ))
        ) : companies.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-16 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma empresa encontrada.</p>
          </div>
        ) : companies.map((company: any) => (
          <div key={company.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{company.razaoSocial}</h3>
                <p className="text-xs text-muted-foreground font-mono">{formatCNPJ(company.cnpj)}</p>
              </div>
              <span className={`badge ml-2 ${company.isActive ? 'badge-success' : 'badge-destructive'} text-xs`}>
                {company.isActive ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{company._count?.employees ?? 0} colaboradores</span>
              <button className="btn btn-ghost btn-sm text-xs">Ver detalhes</button>
            </div>
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground">Página {page} de {pages}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
