'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Upload, Eye, Save, Palette, Image } from 'lucide-react'

const DEFAULT_FORM = {
  platform_name:            'Panexa',
  platform_headline:        '',
  platform_subheadline:     '',
  platform_primary_color:   '#0cd5ef',
  platform_secondary_color: '#10b981',
  platform_accent_color:    '#f59e0b',
}

export default function ConfiguracoesPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getAll,
  })

  // Populate form when settings are loaded (useEffect, not useState)
  useEffect(() => {
    if (settings && typeof settings === 'object') {
      const s = settings as Record<string, string>
      setForm(prev => ({
        ...prev,
        ...(s.platform_name            && { platform_name: s.platform_name }),
        ...(s.platform_headline        && { platform_headline: s.platform_headline }),
        ...(s.platform_subheadline     && { platform_subheadline: s.platform_subheadline }),
        ...(s.platform_primary_color   && { platform_primary_color: s.platform_primary_color }),
        ...(s.platform_secondary_color && { platform_secondary_color: s.platform_secondary_color }),
        ...(s.platform_accent_color    && { platform_accent_color: s.platform_accent_color }),
      }))
      if (s.platform_logo_url) setLogoPreview(s.platform_logo_url)
    }
  }, [settings])

  const mutation = useMutation({
    mutationFn: () => settingsApi.updateBulk(form),
    onSuccess: () => {
      toast.success('Configurações salvas com sucesso!')
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Erro ao salvar configurações'
      toast.error(msg)
    },
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await settingsApi.uploadLogo(file)
      setLogoPreview(res.logoUrl)
      toast.success('Logo atualizado!')
      qc.invalidateQueries({ queryKey: ['settings'] })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao fazer upload do logo')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-64 rounded-lg" />
        <div className="skeleton h-48 w-full rounded-[1rem]" />
        <div className="skeleton h-48 w-full rounded-[1rem]" />
      </div>
    )
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
              <CardTitle className="flex items-center gap-2">
                <Image className="h-4 w-4" /> Logo da plataforma
              </CardTitle>
              <CardDescription>Usado no header, e-mails e splash screen (PNG, SVG — max 2MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-xl cursor-pointer transition-colors ${uploading ? 'opacity-60 pointer-events-none' : 'hover:bg-muted/30'}`}>
                {logoPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoPreview} alt="Logo" className="max-h-16 max-w-xs object-contain" />
                    <span className="text-xs text-muted-foreground">Clique para trocar</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground font-medium">
                      {uploading ? 'Enviando...' : 'Clique para fazer upload'}
                    </span>
                  </>
                )}
                <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
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
            <CardContent className="space-y-5">
              {([
                { key: 'platform_primary_color',   label: 'Cor Primária',    desc: 'Botões CTA, links, destaques' },
                { key: 'platform_secondary_color', label: 'Cor Secundária',  desc: 'Badges de sucesso, ícones de confirmação' },
                { key: 'platform_accent_color',    label: 'Cor de Destaque', desc: 'Alertas, badges especiais' },
              ] as const).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <input
                      type="color"
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="h-12 w-12 rounded-xl cursor-pointer border border-border p-0.5 bg-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    {form[key]}
                  </code>
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
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Nome da plataforma</label>
                <Input
                  value={form.platform_name}
                  onChange={e => setForm(f => ({ ...f, platform_name: e.target.value }))}
                  placeholder="Ex: Panexa"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Headline principal</label>
                <Input
                  value={form.platform_headline}
                  onChange={e => setForm(f => ({ ...f, platform_headline: e.target.value }))}
                  placeholder="Ex: Saúde Ocupacional que gera receita"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Subheadline / descrição</label>
                <textarea
                  rows={3}
                  value={form.platform_subheadline}
                  onChange={e => setForm(f => ({ ...f, platform_subheadline: e.target.value }))}
                  placeholder="Descrição breve da plataforma..."
                  className="w-full rounded-[10px] border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
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
                <Eye className="h-4 w-4" /> Preview em tempo real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-hidden text-sm shadow-card">
                {/* Mini header */}
                <div className="px-3 py-2.5 flex items-center gap-2" style={{ backgroundColor: form.platform_primary_color }}>
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreview} alt="logo" className="h-5 object-contain" />
                  ) : (
                    <div className="h-5 w-5 rounded bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                      {form.platform_name?.charAt(0) || 'P'}
                    </div>
                  )}
                  <span className="text-white font-semibold text-xs">{form.platform_name || 'Panexa'}</span>
                </div>

                {/* Mini content */}
                <div className="p-4 bg-[#ECE8E5]">
                  <p className="font-bold text-[#0E1F32] text-sm leading-tight mb-1.5">
                    {form.platform_headline || 'Headline da plataforma'}
                  </p>
                  <p className="text-[#6E5E60] text-xs leading-relaxed mb-4">
                    {form.platform_subheadline || 'Descrição da plataforma...'}
                  </p>
                  <button
                    className="text-xs text-[#0E1F32] px-4 py-2 rounded-full font-semibold transition-all"
                    style={{ backgroundColor: form.platform_primary_color }}
                  >
                    Começar grátis →
                  </button>
                </div>

                {/* Color dots */}
                <div className="px-3 py-2 border-t border-border flex items-center gap-2 bg-card">
                  {[form.platform_primary_color, form.platform_secondary_color, form.platform_accent_color].map((c, i) => (
                    <div key={i} className="h-4 w-4 rounded-full border border-border/50 shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">Paleta de cores</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3 text-center">
                Clique em &quot;Salvar alterações&quot; para aplicar
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
