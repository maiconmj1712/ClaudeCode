import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Heart, Stethoscope, Brain, Smile, Gift, Shield, FileText, ArrowRight, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  TELEMEDICINA:          <Stethoscope className="h-6 w-6" />,
  NR1_SAUDE_MENTAL:      <Brain className="h-6 w-6" />,
  ASO_EXAME_OCUPACIONAL: <FileText className="h-6 w-6" />,
  ODONTO:                <Smile className="h-6 w-6" />,
  SEGURO_VIDA:           <Shield className="h-6 w-6" />,
  CLUBE_VANTAGENS:       <Gift className="h-6 w-6" />,
}

const CATEGORY_COLORS: Record<string, string> = {
  TELEMEDICINA:          'bg-blue-100 text-blue-600',
  NR1_SAUDE_MENTAL:      'bg-purple-100 text-purple-600',
  ASO_EXAME_OCUPACIONAL: 'bg-indigo-100 text-indigo-600',
  ODONTO:                'bg-emerald-100 text-emerald-600',
  SEGURO_VIDA:           'bg-red-100 text-red-600',
  CLUBE_VANTAGENS:       'bg-amber-100 text-amber-600',
}

const MOCK_BENEFITS = [
  { id: '1', name: 'Telemedicina Ilimitada', category: 'TELEMEDICINA', status: 'ACTIVE', deepLink: 'https://app.parceiro.com' },
  { id: '2', name: 'Saúde Mental NR-1', category: 'NR1_SAUDE_MENTAL', status: 'ACTIVE', deepLink: 'https://app.mental.com' },
  { id: '3', name: 'Clube de Vantagens', category: 'CLUBE_VANTAGENS', status: 'ACTIVE', deepLink: 'https://clube.parceiro.com' },
]

export default async function ColaboradorHome() {
  const session = await getServerSession(authOptions)
  const name = session?.user?.name?.split(' ')[0] || 'Colaborador'

  // In production: fetch from API based on session.user.employeeId
  const benefits = MOCK_BENEFITS
  const isOverdue = false // fetch from API

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div>
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-muted-foreground text-sm">{greeting},</p>
        <h1 className="text-2xl font-bold text-foreground">{name} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Você tem <strong>{benefits.length} benefício{benefits.length !== 1 ? 's' : ''}</strong> disponível{benefits.length !== 1 ? 'is' : ''}.
        </p>
      </div>

      {/* Overdue warning */}
      {isOverdue && (
        <div className="mb-6 rounded-2xl bg-destructive/10 border border-destructive p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-destructive text-sm">Acesso temporariamente suspenso</p>
            <p className="text-xs text-destructive/80 mt-0.5">Sua empresa possui um pagamento em atraso. Entre em contato com o RH.</p>
          </div>
        </div>
      )}

      {/* Benefits cards */}
      <div className="space-y-3">
        {benefits.map(benefit => (
          <a
            key={benefit.id}
            href={benefit.deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-all hover:-translate-y-0.5 block"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 ${CATEGORY_COLORS[benefit.category] ?? 'bg-primary/10 text-primary'}`}>
              {CATEGORY_ICONS[benefit.category] ?? <Heart className="h-6 w-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{benefit.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {benefit.status === 'ACTIVE' ? '✓ Ativo — clique para acessar' : 'Suspenso'}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </a>
        ))}
      </div>

      {/* Digital card */}
      <div className="mt-8 bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white">
        <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-3">Carteira Digital</p>
        <p className="text-lg font-bold">{name}</p>
        <p className="text-sm text-white/70 mt-1">Powered by Panexa</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60">Benefícios ativos</p>
            <p className="text-2xl font-black">{benefits.filter(b => b.status === 'ACTIVE').length}</p>
          </div>
          <Heart className="h-10 w-10 text-white/20" />
        </div>
      </div>
    </div>
  )
}
