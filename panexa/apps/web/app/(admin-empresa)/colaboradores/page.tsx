'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesApi, companiesApi } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatDate, getInitials } from '@/lib/utils'
import { Search, Upload, Plus, Mail, UserX, RefreshCw, Download } from 'lucide-react'
import type { EmployeeDto } from '@panexa/shared-types'

type StatusFilter = 'ALL' | 'ACTIVE' | 'PENDING_ACTIVATION' | 'BLOCKED'

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'destructive' | 'info'> = {
  ACTIVE:             'success',
  PENDING_ACTIVATION: 'warning',
  BLOCKED:            'destructive',
  INACTIVE:           'info',
}
const STATUS_LABEL: Record<string, string> = {
  ACTIVE:             'Ativo',
  PENDING_ACTIVATION: 'Aguardando ativação',
  BLOCKED:            'Bloqueado',
  INACTIVE:           'Inativo',
}

export default function ColaboradoresPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [importing, setImporting] = useState(false)

  const { data, isLoading } = useQuery<{ data: EmployeeDto[]; total: number }>({
    queryKey: ['employees', search, statusFilter],
    queryFn: () => employeesApi.getAll({ search, status: statusFilter === 'ALL' ? undefined : statusFilter }),
  })

  const inviteMutation = useMutation({
    mutationFn: (id: string) => employeesApi.sendInvite(id),
    onSuccess: () => {
      toast.success('Convite reenviado!')
      qc.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: () => toast.error('Erro ao reenviar convite'),
  })

  const blockMutation = useMutation({
    mutationFn: (id: string) => employeesApi.block(id),
    onSuccess: () => {
      toast.success('Colaborador bloqueado')
      qc.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const res = await companiesApi.importEmployees(file)
      toast.success(`${res.imported} colaboradores importados! ${res.errors} erros.`)
      qc.invalidateQueries({ queryKey: ['employees'] })
    } catch {
      toast.error('Erro ao importar. Verifique o formato do CSV.')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const employees = data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Colaboradores"
        subtitle={`${data?.total ?? 0} colaboradores cadastrados`}
      >
        <a
          href="/templates/colaboradores.csv"
          download
          className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline"
        >
          <Download className="h-4 w-4" /> Template CSV
        </a>
        <label className="cursor-pointer">
          <Button variant="outline" loading={importing} asChild>
            <span>
              <Upload className="h-4 w-4" />
              {importing ? 'Importando...' : 'Importar CSV'}
            </span>
          </Button>
          <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
        </label>
        <Button asChild>
          <a href="/empresa/colaboradores/novo"><Plus className="h-4 w-4" /> Adicionar</a>
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou CPF..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['ALL', 'ACTIVE', 'PENDING_ACTIVATION', 'BLOCKED'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === s ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {s === 'ALL' ? 'Todos' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-lg" />)}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>CPF</th>
                  <th>Departamento</th>
                  <th>Cargo</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                          {getInitials(emp.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-foreground text-sm font-mono">{emp.cpf}</td>
                    <td className="text-muted-foreground text-sm">{emp.department ?? '—'}</td>
                    <td className="text-muted-foreground text-sm">{emp.position ?? '—'}</td>
                    <td>
                      <Badge variant={STATUS_BADGE[emp.status] ?? 'info'}>
                        {STATUS_LABEL[emp.status] ?? emp.status}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground text-xs">{formatDate(emp.createdAt)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {emp.status === 'PENDING_ACTIVATION' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => inviteMutation.mutate(emp.id)}
                            title="Reenviar convite"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {emp.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => blockMutation.mutate(emp.id)}
                            title="Bloquear colaborador"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!employees.length && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 opacity-30" />
                        <p>Nenhum colaborador encontrado</p>
                        {search && <p className="text-xs">Tente limpar o filtro de busca</p>}
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
