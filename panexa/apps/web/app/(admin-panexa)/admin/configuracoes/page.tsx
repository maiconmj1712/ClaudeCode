'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Upload, Eye, Save, Palette } from 'lucide-react'

export default function ConfiguracoesPage() {
  const qc = useQueryClient()
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getAll,
  })

  const [form, setForm] = useState({
    platform_name:       '',
    platform_headline:   '',
    platform_subheadline:'',
    platform_primary_color:   '#0EA5E9',
    platform_secondary_color: '#10B981',
    platform_accent_color:    '#F59E0B',
  })

  // Populate form from settings once loaded
  useState(() => {
    if (settings) {
      const s = settings as Record<string, string>
      setForm(prev => ({ ...prev, ...s }))
    }
  })

  const mutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        Object.entries(form).map(([key, value]) => settingsApi.update(key, value))
      )
    },
    onSuccess: () => {
      toast.success('Configurações salvas com sucesso!')
      qc.invalidateQueries({ queryKey: ['settings'] })
      // Apply CSS custom properties immediately
      document.documentElement.style.setProperty('--primary-hex', form.platform_primary_color)
    },
    onError: () => toast.error('Erro ao salvar configurações'),
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await settingsApi.uploadLogo(file)
      toast.success('Logo atualizado!')
    } catch {
      toast.error('Erro ao fazer upload do logo')
    }
  }

  return (
    <div>
      <PageHeader
        title="Configurações da Plataforma"
        subtitle="Personalize a identidade visual e textos de marketing"
      >
        <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
          <Save className="h-4 w-4" /> Salvar alterações
        </Button>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — forms */}
        <div className="lg:col-span-2 space-y-6">

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Logo da plataforma</CardTitle>
              <CardDescription>Usado no header, e-mails e splash screen</CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Clique para fazer upload (PNG, SVG — max 2MB)</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </CardContent>
          </Card>

          {/* Brand colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" /> Cores da marca
              </CardTitle>
              <CardDescription>Aplicadas via CSS custom properties em toda a plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'platform_primary_color',   label: 'Cor Primária',   desc: 'Botões, links, destaques' },
                { key: 'platform_secondary_color', label: 'Cor Secundária', desc: 'Badges de sucesso, ícones de confirmação' },
                { key: 'platform_accent_color',    label: 'Cor de Destaque', desc: 'Alertas, badges especiais' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <input
                      type="color"
                      value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="h-12 w-12 rounded-xl cursor-pointer border-0 p-0.5 bg-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground">{(form as any)[key]}</code>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Marketing texts */}
          <Card>
            <CardHeader>
              <CardTitle>Textos de marketing</CardTitle>
              <CardDescription>Exibidos na landing page e na vitrine das clínicas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Nome da plataforma</label>
                <Input
                  value={form.platform_name}
                  onChange={e => setForm(f => ({ ...f, platform_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Headline principal</label>
                <Input
                  value={form.platform_headline}
                  onChange={e => setForm(f => ({ ...f, platform_headline: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Subheadline / descrição</label>
                <textarea
                  rows={3}
                  value={form.platform_subheadline}
                  onChange={e => setForm(f => ({ ...f, platform_subheadline: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Preview */}
        <div className="sticky top-24">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" /> Preview
              </CardTitle>
              <CardDescription>Visualização em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-hidden text-sm">
                {/* Mini header preview */}
                <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: form.platform_primary_color }}>
                  <div className="h-5 w-5 rounded bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                    {form.platform_name?.charAt(0) || 'P'}
                  </div>
                  <span className="text-white font-semibold text-xs">{form.platform_name || 'Panexa'}</span>
                </div>
                {/* Mini content preview */}
                <div className="p-3 bg-gray-50">
                  <p className="font-bold text-gray-900 text-xs leading-tight mb-1">{form.platform_headline || 'Headline da plataforma'}</p>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3">{form.platform_subheadline || 'Descrição da plataforma...'}</p>
                  <button
                    className="text-xs text-white px-3 py-1.5 rounded-lg font-semibold"
                    style={{ backgroundColor: form.platform_primary_color }}
                  >
                    Começar grátis →
                  </button>
                </div>
                {/* Color dots */}
                <div className="px-3 py-2 border-t border-gray-100 flex gap-2">
                  {[form.platform_primary_color, form.platform_secondary_color, form.platform_accent_color].map((c, i) => (
                    <div key={i} className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">Paleta de cores</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
