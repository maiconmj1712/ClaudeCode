'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Copy, Check, QrCode, ExternalLink, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'qrcode.react'

export default function MinhaUrlPage() {
  const { data: session } = useSession()
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const slug = (session?.user as any)?.clinicSlug ?? 'sua-clinica'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.panexa.com.br'
  const clinicUrl = `${baseUrl}/c/${slug}`

  function copy() {
    navigator.clipboard.writeText(clinicUrl)
    setCopied(true)
    toast.success('URL copiada!')
    setTimeout(() => setCopied(false), 2000)
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: 'Minha URL Panexa', url: clinicUrl })
    } else {
      copy()
    }
  }

  const utmUrl = `${clinicUrl}?utm_source=whatsapp&utm_medium=direto&utm_campaign=captacao`

  return (
    <div className="page-container max-w-2xl">
      <PageHeader
        title="Minha URL Exclusiva"
        subtitle="Compartilhe com empresas para rastrear suas vendas automaticamente."
      />

      {/* URL display */}
      <div className="card p-6 mb-6">
        <label className="label mb-2">Sua URL personalizada</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 input bg-muted font-mono text-sm truncate py-2.5 px-3 rounded-lg border">
            {clinicUrl}
          </div>
          <button className="btn btn-primary btn-sm gap-1" onClick={copy}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <a href={clinicUrl} target="_blank" className="btn btn-outline btn-sm gap-1">
            <ExternalLink className="w-4 h-4" />
            Abrir vitrine
          </a>
          <button className="btn btn-outline btn-sm gap-1" onClick={() => setShowQR(!showQR)}>
            <QrCode className="w-4 h-4" />
            QR Code
          </button>
          <button className="btn btn-outline btn-sm gap-1" onClick={share}>
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
        </div>
      </div>

      {/* QR Code panel */}
      {showQR && (
        <div className="card p-6 mb-6 flex flex-col items-center gap-4">
          <h3 className="font-semibold">QR Code da sua vitrine</h3>
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <QRCode value={clinicUrl} size={180} includeMargin />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Imprima e cole em materiais, banners ou envie por WhatsApp
          </p>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              const canvas = document.querySelector('canvas') as HTMLCanvasElement
              if (canvas) {
                const link = document.createElement('a')
                link.download = `qr-${slug}.png`
                link.href = canvas.toDataURL()
                link.click()
              }
            }}
          >
            Baixar PNG
          </button>
        </div>
      )}

      {/* UTM links */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold mb-3">Links rastreados por canal</h3>
        <div className="space-y-3">
          {[
            { label: 'WhatsApp', utm: 'utm_source=whatsapp&utm_medium=direto' },
            { label: 'Instagram', utm: 'utm_source=instagram&utm_medium=bio' },
            { label: 'E-mail', utm: 'utm_source=email&utm_medium=newsletter' },
            { label: 'LinkedIn', utm: 'utm_source=linkedin&utm_medium=post' },
          ].map(({ label, utm }) => {
            const url = `${clinicUrl}?${utm}&utm_campaign=captacao`
            return (
              <div key={label} className="flex items-center gap-3">
                <span className="w-20 text-sm font-medium shrink-0">{label}</span>
                <div className="flex-1 font-mono text-xs text-muted-foreground truncate bg-muted rounded px-2 py-1">
                  {url}
                </div>
                <button
                  className="btn btn-ghost btn-sm shrink-0"
                  onClick={() => { navigator.clipboard.writeText(url); toast.success(`Link ${label} copiado!`) }}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Attribution explained */}
      <div className="card p-6 bg-primary/5 border-primary/20">
        <h3 className="font-semibold mb-2">Como funciona o rastreamento?</h3>
        <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal list-inside">
          <li>Empresa acessa sua URL única ou linka com UTM</li>
          <li>Cookie de 30 dias é gravado no navegador</li>
          <li>Empresa preenche o checkout com o CNPJ</li>
          <li>Pedido é associado à sua clínica automaticamente</li>
          <li>Comissão de 30% é creditada após pagamento confirmado</li>
        </ol>
      </div>
    </div>
  )
}
