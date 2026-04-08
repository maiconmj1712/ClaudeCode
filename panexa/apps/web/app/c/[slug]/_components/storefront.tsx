'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, calculatePrice } from '@panexa/shared-types'
import type { ClinicPublicDto, ProductDto, DiscountTierDto } from '@panexa/shared-types'
import {
  Stethoscope, Brain, Smile, Gift, Shield, FileText,
  ChevronRight, Info, Check, Users,
} from 'lucide-react'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  TELEMEDICINA:         <Stethoscope className="h-5 w-5" />,
  NR1_SAUDE_MENTAL:     <Brain className="h-5 w-5" />,
  ASO_EXAME_OCUPACIONAL:<FileText className="h-5 w-5" />,
  ODONTO:               <Smile className="h-5 w-5" />,
  SEGURO_VIDA:          <Shield className="h-5 w-5" />,
  CLUBE_VANTAGENS:      <Gift className="h-5 w-5" />,
  PERICIA_MEDICA:       <FileText className="h-5 w-5" />,
  LAUDO_DISTANCIA:      <FileText className="h-5 w-5" />,
}

interface TrackingInfo {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  referralToken: string
  clinicSlug: string
}

interface Props {
  clinic: ClinicPublicDto
  tracking: TrackingInfo
}

// ── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onSelect,
  primaryColor,
}: {
  product: ProductDto
  onSelect: (p: ProductDto) => void
  primaryColor: string
}) {
  const [qty, setQty] = useState(50)
  const calc = calculatePrice(product, qty)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {CATEGORY_ICONS[product.category] ?? <Stethoscope className="h-5 w-5" />}
        </div>
        <Badge variant="success" className="text-xs">30% comissão clínica</Badge>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{product.shortDesc || product.description.slice(0, 100)}</p>

      <ul className="space-y-1.5 mb-5">
        {product.features.slice(0, 3).map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
            <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: primaryColor }} />
            {f}
          </li>
        ))}
      </ul>

      {/* Quantity + price calculator */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <label className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> Número de colaboradores
        </label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 mb-3"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">
              {formatCurrency(product.pricePerUnit)}/colab/mês
              {calc.discountPct > 0 && (
                <span className="ml-1 text-green-600 font-semibold">−{(calc.discountPct * 100).toFixed(0)}%</span>
              )}
            </p>
            <p className="text-xl font-black text-gray-900">{formatCurrency(calc.totalPrice)}<span className="text-sm font-normal text-gray-400">/mês</span></p>
          </div>
          {calc.appliedTier && (
            <Badge variant="warning" className="text-xs">{calc.appliedTier.label}</Badge>
          )}
        </div>
      </div>

      <Button
        className="w-full"
        style={{ backgroundColor: primaryColor }}
        onClick={() => onSelect(product)}
      >
        Contratar <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

// ── Main Storefront ──────────────────────────────────────────────────────────

export function ClinicStorefront({ clinic, tracking }: Props) {
  const router = useRouter()
  const primaryColor = clinic.primaryColor || '#0EA5E9'
  const accentColor  = clinic.accentColor  || '#10B981'

  // Plant tracking cookie on mount (30 days)
  useEffect(() => {
    Cookies.set('panexa_clinic_ref', tracking.referralToken, { expires: 30 })
    if (tracking.utmSource) sessionStorage.setItem('panexa_utm_source', tracking.utmSource)
    if (tracking.utmMedium) sessionStorage.setItem('panexa_utm_medium', tracking.utmMedium)
    if (tracking.utmCampaign) sessionStorage.setItem('panexa_utm_campaign', tracking.utmCampaign)
  }, [tracking])

  const handleSelectProduct = (product: ProductDto) => {
    // Persist selection and go to checkout
    sessionStorage.setItem('panexa_checkout_product', JSON.stringify(product))
    sessionStorage.setItem('panexa_checkout_clinic', JSON.stringify({
      id: clinic.id,
      slug: tracking.clinicSlug,
      referralToken: tracking.referralToken,
    }))
    router.push(`/c/${tracking.clinicSlug}/checkout?product=${product.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {clinic.logoUrl ? (
              <img src={clinic.logoUrl} alt={clinic.razaoSocial} className="h-9 w-auto" />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white font-black"
                style={{ backgroundColor: primaryColor }}
              >
                {clinic.razaoSocial.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900 text-sm">{clinic.nomeFantasia || clinic.razaoSocial}</p>
              <p className="text-xs text-gray-400">Powered by Panexa</p>
            </div>
          </div>
          <div className="text-xs text-gray-400 hidden sm:block">
            Pagamento 100% seguro · Split automático
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <section
        className="py-16 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-black leading-tight">
            {clinic.marketingTitle || `Benefícios de Saúde para sua Empresa`}
          </h1>
          <p className="mt-4 text-lg text-white/80 leading-relaxed">
            {clinic.marketingSubtitle || `Cuide dos seus colaboradores com planos de saúde a partir de R$ 9,90/mês por pessoa. Desconto progressivo para equipes maiores.`}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-semibold">
            <Info className="h-4 w-4" />
            Desconto progressivo: até 30% para equipes com 1.000+ colaboradores
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Portfólio de Benefícios</h2>
            <p className="text-sm text-gray-500 mt-1">Calcule o valor exato para o número de colaboradores da sua empresa</p>
          </div>
          <Badge variant="info">{clinic.products.length} produtos disponíveis</Badge>
        </div>

        {clinic.products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p>Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinic.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={handleSelectProduct}
                primaryColor={primaryColor}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trust badges */}
      <section className="border-t border-gray-100 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            {['Pagamento seguro SSL', 'Dados protegidos LGPD', 'Split automático garantido', 'Suporte especializado'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-gray-400">
        Powered by <span className="font-semibold text-gray-600">Panexa</span> · Plataforma de Saúde Ocupacional
      </footer>
    </div>
  )
}
