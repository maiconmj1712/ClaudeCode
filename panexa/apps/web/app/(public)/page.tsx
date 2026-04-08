import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Stethoscope, Brain, Smile, Shield, Gift, FileText,
  ArrowRight, Check, ChevronDown, Star, Zap, BarChart3,
  Building2, Users, DollarSign, Sparkles,
} from 'lucide-react'

// ── Data ────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  { icon: <Stethoscope className="h-6 w-6" />, name: 'Telemedicina', desc: 'Consultas online 24/7 em +20 especialidades', price: 'R$ 39,90', color: 'bg-blue-100 text-blue-600' },
  { icon: <Brain className="h-6 w-6" />, name: 'Saúde Mental NR-1', desc: 'Psicólogos online + compliance NR-1', price: 'R$ 29,90', color: 'bg-purple-100 text-purple-600' },
  { icon: <Smile className="h-6 w-6" />, name: 'Odontologia', desc: 'Rede credenciada nacional + teleconsulta', price: 'R$ 24,90', color: 'bg-emerald-100 text-emerald-600' },
  { icon: <Gift className="h-6 w-6" />, name: 'Clube de Vantagens', desc: '+30.000 descontos em farmácias e mais', price: 'R$ 9,90', color: 'bg-amber-100 text-amber-600' },
  { icon: <Shield className="h-6 w-6" />, name: 'Seguro de Vida', desc: 'Cobertura completa para colaboradores', price: 'R$ 19,90', color: 'bg-red-100 text-red-600' },
  { icon: <FileText className="h-6 w-6" />, name: 'ASO Digital', desc: 'Atestado ocupacional ICP-Brasil + e-Social', price: 'R$ 14,90', color: 'bg-indigo-100 text-indigo-600' },
]

const PLANS = [
  {
    name: 'Gratuito',
    price: 0,
    desc: 'Para conhecer a plataforma',
    color: 'bg-card border-border',
    features: ['URL exclusiva rastreável', 'Até 3 produtos no portfólio', 'Dashboard básico', 'Suporte por e-mail'],
    cta: 'Começar grátis',
    highlight: false,
  },
  {
    name: 'Essencial',
    price: 149,
    desc: 'Para clínicas em crescimento',
    color: 'bg-card border-primary',
    features: ['Tudo do Gratuito', 'Portfólio completo (7 produtos)', 'Automação de WhatsApp', 'Relatório mensal automático', 'Suporte prioritário'],
    cta: 'Assinar Essencial',
    highlight: true,
  },
  {
    name: 'Profissional',
    price: 299,
    desc: 'Para clínicas estabelecidas',
    color: 'bg-card border-border',
    features: ['Tudo do Essencial', 'Layout white-label', 'Perícia Médica Online', 'Laudos a Distância', 'API de integração', 'Gerente de conta dedicado'],
    cta: 'Assinar Profissional',
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: 699,
    desc: 'Para redes de clínicas',
    color: 'bg-card border-border',
    features: ['Tudo do Profissional', 'Multi-unidades', 'SLA 99,9% garantido', 'Onboarding personalizado', 'Treinamento da equipe', 'Relatórios BI avançados'],
    cta: 'Falar com vendas',
    highlight: false,
  },
]

const STEPS = [
  { num: '01', title: 'Cadastre-se e ative seu plano', desc: 'Em menos de 5 minutos sua clínica já está no ar com uma URL exclusiva e portfólio de produtos.' },
  { num: '02', title: 'Compartilhe com suas empresas', desc: 'Envie seu link exclusivo pelo WhatsApp, e-mail ou deixe a automação trabalhar por você.' },
  { num: '03', title: 'Receba 30% automático', desc: 'Cada vez que uma empresa contrata, o split de 30% cai direto na sua conta — sem burocracia.' },
]

const FAQS = [
  { q: 'Como funciona o repasse da comissão?', a: 'O gateway processa o pagamento da empresa e divide automaticamente: 70% para a Panexa e 30% para a sua clínica. O repasse acontece em até 2 dias úteis após a confirmação.' },
  { q: 'As empresas sabem que estão comprando via minha clínica?', a: 'Sim. Elas acessam uma página com sua identidade visual (logo, cores, nome). A Panexa aparece como tecnologia parceira.' },
  { q: 'Preciso assinar contrato?', a: 'Apenas um contrato digital simples (DocuSign). Sem fidelidade — você pode cancelar a qualquer momento.' },
  { q: 'Posso personalizar o portfólio de produtos?', a: 'Sim! No plano Essencial e acima você escolhe quais produtos oferecer e pode configurar preços customizados por produto.' },
  { q: 'Como funciona o rastreamento das vendas?', a: 'Usamos 6 camadas de rastreamento: URL exclusiva, UTM, cookie 30 dias, token no checkout, campo no banco de dados e webhook do gateway. Impossível perder uma comissão.' },
]

// ── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-black text-sm">P</div>
            <span className="font-bold text-foreground text-lg">Panexa</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#produtos" className="hover:text-foreground transition-colors">Produtos</a>
            <a href="#planos" className="hover:text-foreground transition-colors">Planos</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/login">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-panexa-50 via-background to-emerald-50 dark:from-panexa-950/20 dark:via-background dark:to-emerald-950/20" />
        <div className="absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-semibold text-primary mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            30% de comissão automática em cada venda
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-foreground tracking-tight leading-tight">
            A plataforma de saúde<br />
            <span className="gradient-brand-text">ocupacional que</span><br />
            trabalha por você
          </h1>

          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Distribua benefícios de saúde para as empresas da sua carteira via URL exclusiva rastreável e ganhe <strong className="text-foreground">30% de comissão automática</strong> — sem nenhum esforço adicional.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" className="shadow-lg shadow-primary/25" asChild>
              <Link href="/login">
                Quero ser parceira <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <a href="#como-funciona">Ver como funciona</a>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            {[
              { icon: <Building2 className="h-4 w-4" />, text: '200+ clínicas parceiras' },
              { icon: <Users className="h-4 w-4" />, text: '45.000+ colaboradores' },
              { icon: <DollarSign className="h-4 w-4" />, text: 'R$ 2M+ em comissões pagas' },
              { icon: <Star className="h-4 w-4" />, text: '4.9 / 5 de satisfação' },
            ].map(s => (
              <div key={s.text} className="flex items-center gap-2">
                <span className="text-primary">{s.icon}</span>
                {s.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="como-funciona" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground">Como funciona</h2>
            <p className="mt-4 text-lg text-muted-foreground">3 passos para começar a gerar receita extra</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-primary/40 to-transparent z-10" />
                )}
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-5xl font-black gradient-brand-text mb-4">{step.num}</div>
                  <h3 className="text-lg font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Produtos ── */}
      <section id="produtos" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground">Portfólio de produtos</h2>
            <p className="mt-4 text-lg text-muted-foreground">Revenda benefícios de saúde de alta demanda para as empresas da sua carteira</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.map((p, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${p.color} mb-4`}>
                  {p.icon}
                </div>
                <h3 className="font-bold text-foreground text-lg">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-4 leading-relaxed">{p.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{p.price}<span className="text-muted-foreground font-normal">/colab/mês</span></span>
                  <span className="text-xs bg-secondary/15 text-secondary-foreground px-2.5 py-1 rounded-full font-semibold">30% comissão</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Diferenciais ── */}
      <section className="py-24 bg-sidebar text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar to-panexa-900/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold leading-tight">Por que escolher a Panexa?</h2>
              <p className="mt-4 text-sidebar-foreground/60 text-lg leading-relaxed">
                Desenvolvida especificamente para clínicas ocupacionais, com tudo que você precisa para gerar receita recorrente sem complicações.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  { icon: <Zap className="h-5 w-5" />, title: 'Ativação em 5 minutos', desc: 'URL exclusiva pronta, portfólio configurado, automações rodando.' },
                  { icon: <BarChart3 className="h-5 w-5" />, title: 'Rastreabilidade 100%', desc: '6 camadas de atribuição — cada comissão é registrada com precisão cirúrgica.' },
                  { icon: <DollarSign className="h-5 w-5" />, title: 'Pagamento automático', desc: 'Split de 30% processado pelo gateway, sem necessidade de emitir NF ou cobrar.' },
                  { icon: <Users className="h-5 w-5" />, title: 'Gamificação e ranking', desc: 'Compete com outras clínicas e ganhe bônus adicionais por performance.' },
                ].map((d, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary flex-shrink-0 mt-0.5">
                      {d.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{d.title}</p>
                      <p className="text-sm text-sidebar-foreground/60 mt-0.5">{d.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-sidebar-accent rounded-2xl p-8 border border-sidebar-border">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-6">Simulação de receita</p>
              <div className="space-y-4">
                {[
                  { label: '10 empresas × 50 colab. × R$39,90', value: 'R$ 5.985/mês' },
                  { label: '20 empresas × 100 colab. × R$39,90', value: 'R$ 23.940/mês' },
                  { label: '50 empresas × 200 colab. × R$39,90', value: 'R$ 113.715/mês' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-sidebar-border last:border-0">
                    <span className="text-sm text-sidebar-foreground/60">{s.label}</span>
                    <span className="font-bold text-primary">{s.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-sidebar-foreground/40 mt-4">* 30% da receita bruta repassa automaticamente para a clínica parceira.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Planos ── */}
      <section id="planos" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground">Planos e preços</h2>
            <p className="mt-4 text-lg text-muted-foreground">Comece grátis e escale conforme seu portfólio cresce</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl border-2 p-6 flex flex-col ${plan.color} ${plan.highlight ? 'ring-2 ring-primary shadow-xl shadow-primary/15 scale-105' : 'shadow-sm'}`}
              >
                {plan.highlight && (
                  <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">⭐ Mais popular</div>
                )}
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                <div className="my-6">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-black text-foreground">Grátis</span>
                  ) : (
                    <>
                      <span className="text-lg text-muted-foreground">R$</span>
                      <span className="text-4xl font-black text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlight ? 'default' : 'outline'}
                  className="w-full"
                  asChild
                >
                  <Link href="/login">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground">Perguntas frequentes</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group bg-card rounded-2xl border border-border p-6">
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-foreground">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-black text-foreground">
            Pronto para começar?
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Cadastre sua clínica agora e receba sua URL exclusiva em minutos.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" className="shadow-lg shadow-primary/25" asChild>
              <Link href="/login">
                Criar conta grátis <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <a href="mailto:parceiros@panexa.com.br">Falar com a equipe</a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-sidebar border-t border-sidebar-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-black text-sm">P</div>
                <span className="font-bold text-white">Panexa</span>
              </div>
              <p className="text-sm text-sidebar-foreground/50 leading-relaxed">
                A plataforma de saúde ocupacional que gera receita para clínicas e benefícios para empresas.
              </p>
            </div>
            {[
              { title: 'Produto', links: ['Como funciona', 'Produtos', 'Planos', 'Segurança'] },
              { title: 'Empresa', links: ['Sobre nós', 'Blog', 'Carreiras', 'Imprensa'] },
              { title: 'Suporte', links: ['Central de ajuda', 'Contato', 'Status', 'LGPD'] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-white mb-4">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-sidebar-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-sidebar-foreground/30">
            <p>© 2026 Panexa. Todos os direitos reservados. CNPJ 00.000.000/0001-00</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-sidebar-foreground transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-sidebar-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-sidebar-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
