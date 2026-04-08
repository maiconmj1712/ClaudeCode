'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/page-header'
import { productsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORY_LABELS: Record<string, string> = {
  TELEMEDICINE:   'Telemedicina',
  MENTAL_HEALTH:  'Saúde Mental',
  DENTAL:         'Odontológico',
  CLUB:           'Clube de Benefícios',
  OCCUPATIONAL:   'Saúde Ocupacional',
  EXAM:           'Exames',
}

export default function ProdutosPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<any | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<any>({})

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.findAll({ isActive: undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Produto removido') },
    onError: () => toast.error('Erro ao remover produto'),
  })

  function startEdit(product: any) {
    setEditing(product)
    setForm({ ...product })
  }

  function startCreate() {
    setCreating(true)
    setForm({ name: '', description: '', basePrice: '', type: 'SUBSCRIPTION', category: 'TELEMEDICINE', isActive: true })
  }

  function cancelForm() {
    setEditing(null)
    setCreating(false)
    setForm({})
  }

  async function saveProduct() {
    try {
      if (editing) {
        await productsApi.update(editing.id, form)
        toast.success('Produto atualizado')
      } else {
        await productsApi.create(form)
        toast.success('Produto criado')
      }
      qc.invalidateQueries({ queryKey: ['products'] })
      cancelForm()
    } catch {
      toast.error('Erro ao salvar produto')
    }
  }

  return (
    <div className="page-container">
      <PageHeader title="Produtos" subtitle="Catálogo de produtos da plataforma">
        <button className="btn btn-primary btn-sm gap-1" onClick={startCreate}>
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </PageHeader>

      {/* Create / Edit Form */}
      {(creating || editing) && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">{creating ? 'Novo Produto' : 'Editar Produto'}</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nome</label>
                <input className="input w-full" value={form.name ?? ''} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Preço Base (R$)</label>
                <input className="input w-full" type="number" step="0.01" value={form.basePrice ?? ''} onChange={e => setForm((f: any) => ({ ...f, basePrice: parseFloat(e.target.value) }))} />
              </div>
              <div>
                <label className="label">Categoria</label>
                <select className="input w-full" value={form.category ?? ''} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))}>
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Tipo</label>
                <select className="input w-full" value={form.type ?? ''} onChange={e => setForm((f: any) => ({ ...f, type: e.target.value }))}>
                  <option value="SUBSCRIPTION">Recorrente (assinatura)</option>
                  <option value="ONE_TIME">Avulso (pontual)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Descrição</label>
                <textarea className="input w-full min-h-[80px]" value={form.description ?? ''} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive ?? true} onChange={e => setForm((f: any) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4" />
                <label htmlFor="isActive" className="label mb-0 cursor-pointer">Produto ativo</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-ghost btn-sm" onClick={cancelForm}><X className="w-4 h-4 mr-1" />Cancelar</button>
              <button className="btn btn-primary btn-sm" onClick={saveProduct}><Check className="w-4 h-4 mr-1" />Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-4 w-3/4 rounded mb-3" />
              <div className="skeleton h-3 w-full rounded mb-2" />
              <div className="skeleton h-6 w-1/3 rounded" />
            </div>
          ))
        ) : products.map((product: any) => (
          <div key={product.id} className="card p-5 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <span className="badge badge-secondary text-xs">{CATEGORY_LABELS[product.category] ?? product.category}</span>
              </div>
              <span className={`badge ${product.isActive ? 'badge-success' : 'badge-destructive'} text-xs`}>
                {product.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between mt-auto pt-2 border-t">
              <span className="text-lg font-bold text-primary">{formatCurrency(product.basePrice)}</span>
              <span className="text-xs text-muted-foreground">{product.type === 'SUBSCRIPTION' ? '/mês/colaborador' : 'avulso'}</span>
            </div>
            {product.discountTiers?.length > 0 && (
              <p className="text-xs text-muted-foreground">{product.discountTiers.length} faixa(s) de desconto</p>
            )}
            <div className="flex gap-2 mt-1">
              <button className="btn btn-outline btn-sm flex-1 gap-1" onClick={() => startEdit(product)}>
                <Pencil className="w-3 h-3" />Editar
              </button>
              <button
                className="btn btn-ghost btn-sm text-destructive"
                onClick={() => { if (confirm('Remover produto?')) deleteMutation.mutate(product.id) }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
