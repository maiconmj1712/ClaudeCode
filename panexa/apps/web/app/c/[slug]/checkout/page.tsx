'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ordersApi, cnpjApi } from '@/lib/api'
import { formatCurrency, formatCNPJ, calculatePrice } from '@panexa/shared-types'
import type { ProductDto } from '@panexa/shared-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, ChevronRight, Building2, CreditCard, Users, ShieldCheck } from 'lucide-react'
import Cookies from 'js-cookie'

// ── Stepper ──────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Produto', icon: <Users className="h-4 w-4" /> },
  { id: 2, label: 'Empresa', icon: <Building2 className="h-4 w-4" /> },
  { id: 3, label: 'Pagamento', icon: <CreditCard className="h-4 w-4" /> },
  { id: 4, label: 'Confirmação', icon: <Check className="h-4 w-4" /> },
]

// ── Validation schemas ────────────────────────────────────────────────────────

const companySchema = z.object({
  cnpj:         z.string().min(14, 'CNPJ inválido'),
  razaoSocial:  z.string().min(3, 'Razão social obrigatória'),
  nomeFantasia: z.string().optional(),
  email:        z.string().email('E-mail inválido'),
  phone:        z.string().min(10, 'Telefone inválido'),
  contactName:  z.string().min(3, 'Nome obrigatório'),
  street:       z.string().min(3),
  number:       z.string().min(1),
  neighborhood: z.string().min(2),
  city:         z.string().min(2),
  state:        z.string().length(2, 'Use a sigla do estado (ex: SP)'),
  zipCode:      z.string().min(8),
})
type CompanyForm = z.infer<typeof companySchema>

const paymentSchema = z.object({
  method: z.enum(['CREDIT_CARD', 'BOLETO', 'PIX']),
  cardHolder: z.string().optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
})
type PaymentForm = z.infer<typeof paymentSchema>

// ── Main Component ────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [product, setProduct] = useState<ProductDto | null>(null)
  const [clinicInfo, setClinicInfo] = useState<{ id: string; slug: string; referralToken: string } | null>(null)
  const [quantity, setQuantity] = useState(50)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [cnpjLoading, setCnpjLoading] = useState(false)

  const companyForm = useForm<CompanyForm>({ resolver: zodResolver(companySchema) })
  const paymentForm = useForm<PaymentForm>({ defaultValues: { method: 'CREDIT_CARD' } })
  const paymentMethod = paymentForm.watch('method')

  // Load from sessionStorage
  useEffect(() => {
    const p = sessionStorage.getItem('panexa_checkout_product')
    const c = sessionStorage.getItem('panexa_checkout_clinic')
    if (p) setProduct(JSON.parse(p))
    if (c) setClinicInfo(JSON.parse(c))
  }, [])

  const calc = product ? calculatePrice(product, quantity) : null

  // CNPJ auto-fill
  const handleCnpjBlur = async () => {
    const raw = companyForm.getValues('cnpj').replace(/\D/g, '')
    if (raw.length !== 14) return
    setCnpjLoading(true)
    try {
      const data = await cnpjApi.lookup(raw)
      companyForm.setValue('razaoSocial',  data.razaoSocial  || '')
      companyForm.setValue('nomeFantasia', data.nomeFantasia || '')
      companyForm.setValue('street',       data.logradouro   || '')
      companyForm.setValue('number',       data.numero       || '')
      companyForm.setValue('neighborhood', data.bairro       || '')
      companyForm.setValue('city',         data.municipio    || '')
      companyForm.setValue('state',        data.uf           || '')
      companyForm.setValue('zipCode',      data.cep?.replace(/\D/g, '') || '')
    } catch {
      // silently ignore
    } finally {
      setCnpjLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!product || !clinicInfo) return
    setIsSubmitting(true)
    try {
      const companyData = companyForm.getValues()
      const paymentData = paymentForm.getValues()

      const payload = {
        clinicSlug:    clinicInfo.slug,
        referralToken: clinicInfo.referralToken,
        utmSource:     sessionStorage.getItem('panexa_utm_source')   || undefined,
        utmMedium:     sessionStorage.getItem('panexa_utm_medium')   || undefined,
        utmCampaign:   sessionStorage.getItem('panexa_utm_campaign') || undefined,
        company: {
          cnpj:        companyData.cnpj.replace(/\D/g, ''),
          razaoSocial: companyData.razaoSocial,
          nomeFantasia:companyData.nomeFantasia,
          email:       companyData.email,
          phone:       companyData.phone.replace(/\D/g, ''),
          contactName: companyData.contactName,
          address: {
            street:       companyData.street,
            number:       companyData.number,
            neighborhood: companyData.neighborhood,
            city:         companyData.city,
            state:        companyData.state,
            zipCode:      companyData.zipCode.replace(/\D/g, ''),
          },
        },
        items: [{ productId: product.id, quantity }],
        paymentMethod: paymentData.method,
      }

      const res = await ordersApi.create(payload)
      setOrderId(res.id)
      setStep(4)
      sessionStorage.removeItem('panexa_checkout_product')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao processar pedido. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stepper header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 text-sm font-semibold transition-colors ${step >= s.id ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${step > s.id ? 'bg-primary text-white' : step === s.id ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-gray-100 text-gray-400'}`}>
                    {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
                  </div>
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${step > s.id ? 'bg-primary' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 grid lg:grid-cols-5 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">

          {/* STEP 1 — Product & Quantity */}
          {step === 1 && product && calc && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Confirme o produto</h2>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="font-bold text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500 mt-1">{product.shortDesc}</p>
              </div>
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Número de colaboradores
                </label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-lg font-bold h-12"
                />
              </div>
              {calc.discountPct > 0 && (
                <div className="mb-4 flex items-center gap-2 text-sm text-green-600 font-semibold bg-green-50 rounded-lg px-3 py-2">
                  <Check className="h-4 w-4" />
                  Desconto de {(calc.discountPct * 100).toFixed(0)}% aplicado ({calc.appliedTier?.label})
                </div>
              )}
              <Button className="w-full" size="lg" onClick={() => setStep(2)}>
                Continuar <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STEP 2 — Company Data */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Dados da empresa</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">CNPJ *</label>
                  <Input
                    placeholder="00.000.000/0001-00"
                    {...companyForm.register('cnpj')}
                    onBlur={handleCnpjBlur}
                    error={companyForm.formState.errors.cnpj?.message}
                  />
                  {cnpjLoading && <p className="text-xs text-primary mt-1">Buscando dados do CNPJ...</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Razão Social *</label>
                    <Input {...companyForm.register('razaoSocial')} error={companyForm.formState.errors.razaoSocial?.message} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nome Fantasia</label>
                    <Input {...companyForm.register('nomeFantasia')} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Nome do responsável *</label>
                  <Input {...companyForm.register('contactName')} error={companyForm.formState.errors.contactName?.message} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">E-mail *</label>
                    <Input type="email" {...companyForm.register('email')} error={companyForm.formState.errors.email?.message} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Telefone *</label>
                    <Input placeholder="(11) 99999-9999" {...companyForm.register('phone')} error={companyForm.formState.errors.phone?.message} />
                  </div>
                </div>
                <hr className="border-gray-100" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Rua *</label>
                    <Input {...companyForm.register('street')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Número *</label>
                    <Input {...companyForm.register('number')} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">CEP *</label>
                    <Input {...companyForm.register('zipCode')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Bairro *</label>
                    <Input {...companyForm.register('neighborhood')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Cidade *</label>
                    <Input {...companyForm.register('city')} />
                  </div>
                </div>
                <div className="w-24">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Estado *</label>
                  <Input placeholder="SP" {...companyForm.register('state')} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={companyForm.handleSubmit(() => setStep(3))}
                >
                  Continuar <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 — Payment */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Forma de pagamento</h2>

              {/* Method selector */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
                  { value: 'BOLETO',      label: 'Boleto Bancário' },
                  { value: 'PIX',         label: 'PIX' },
                ].map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => paymentForm.setValue('method', m.value as any)}
                    className={`rounded-xl border-2 p-3 text-sm font-semibold transition-all ${paymentMethod === m.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {paymentMethod === 'CREDIT_CARD' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nome no cartão</label>
                    <Input placeholder="JOÃO DA SILVA" {...paymentForm.register('cardHolder')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Número do cartão</label>
                    <Input placeholder="0000 0000 0000 0000" {...paymentForm.register('cardNumber')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Validade</label>
                      <Input placeholder="MM/AA" {...paymentForm.register('cardExpiry')} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">CVV</label>
                      <Input placeholder="123" {...paymentForm.register('cardCvv')} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                    Cobrança recorrente mensal. Cancele quando quiser.
                  </p>
                </div>
              )}

              {paymentMethod === 'BOLETO' && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800 mb-2">Pagamento por Boleto Bancário</p>
                  <p>Um boleto será gerado com vencimento em 3 dias úteis. O acesso é liberado após a compensação.</p>
                  <p className="mt-2 text-amber-600 font-medium">⚠ Compensação em até 2 dias úteis após o pagamento.</p>
                </div>
              )}

              {paymentMethod === 'PIX' && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800 mb-2">Pagamento por PIX</p>
                  <p>Um QR Code PIX será gerado após a confirmação. O acesso é liberado em minutos após o pagamento.</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
                <Button className="flex-1" size="lg" loading={isSubmitting} onClick={handlePlaceOrder}>
                  {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4 — Success */}
          {step === 4 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido confirmado!</h2>
              <p className="text-gray-500 mb-6">
                Em instantes você receberá um e-mail com os próximos passos para ativar os benefícios dos seus colaboradores.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
                <p className="text-sm text-gray-500 mb-1">Número do pedido</p>
                <p className="font-mono font-bold text-gray-800">{orderId}</p>
              </div>
              <p className="text-sm text-gray-400">
                Acesse o painel da empresa para gerenciar colaboradores e licenças.
              </p>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-2">
          {product && calc && step < 4 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Resumo do pedido</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{product.name}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Colaboradores</span>
                  <span className="font-semibold">{quantity}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Preço unitário</span>
                  <span>{formatCurrency(product.pricePerUnit)}/colab</span>
                </div>
                {calc.discountPct > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Desconto ({(calc.discountPct * 100).toFixed(0)}%)</span>
                    <span>−{formatCurrency(calc.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                  <span>Total / mês</span>
                  <span className="text-lg">{formatCurrency(calc.totalPrice)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                  Pagamento processado com segurança
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
