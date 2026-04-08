import { PrismaClient, Role, ClinicPlan, PlanStatus, ProductType, ProductCategory, ProductVisibility } from './generated/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed da base de dados Panexa...')

  // ── Admin Master Panexa ──────────────────────────────────
  const adminPanexa = await prisma.user.upsert({
    where: { email: 'admin@panexa.com.br' },
    update: {},
    create: {
      email: 'admin@panexa.com.br',
      passwordHash: await bcrypt.hash('Panexa@2024', 12),
      role: Role.ADMIN_PANEXA,
      name: 'Admin Master Panexa',
      isActive: true,
    },
  })
  console.log('✅ Admin Panexa criado:', adminPanexa.email)

  // ── Platform Settings ────────────────────────────────────
  const settings = [
    { key: 'platform_name', value: 'Panexa', type: 'string' },
    { key: 'platform_logo_url', value: '/logo.svg', type: 'string' },
    { key: 'platform_primary_color', value: '#0EA5E9', type: 'string' },
    { key: 'platform_secondary_color', value: '#10B981', type: 'string' },
    { key: 'platform_accent_color', value: '#F59E0B', type: 'string' },
    { key: 'platform_headline', value: 'A plataforma de saúde ocupacional que trabalha por você', type: 'string' },
    { key: 'platform_subheadline', value: 'Distribua benefícios de saúde para empresas da sua carteira e ganhe 30% de comissão automática.', type: 'string' },
    { key: 'split_panexa_pct', value: '0.70', type: 'number' },
    { key: 'split_clinic_pct', value: '0.30', type: 'number' },
    { key: 'trial_days', value: '14', type: 'number' },
  ]

  for (const setting of settings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }
  console.log('✅ Platform settings configurados')

  // ── Produtos ─────────────────────────────────────────────
  const products = [
    {
      name: 'Telemedicina Ilimitada',
      description: 'Consultas médicas online 24h por dia, 7 dias por semana. Clínico geral, pediatra, ginecologista e mais de 20 especialidades disponíveis. Sem filas, sem espera.',
      shortDesc: 'Consultas médicas online 24/7 em mais de 20 especialidades',
      type: ProductType.RECORRENTE,
      category: ProductCategory.TELEMEDICINA,
      pricePerUnit: 39.90,
      features: ['Consultas ilimitadas', '+20 especialidades', 'Atendimento 24/7', 'Receita digital', 'Prontuário eletrônico'],
      isVisibleTo: ProductVisibility.AMBOS,
      displayOrder: 1,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 100, discountPct: 0, label: 'Até 100 colaboradores' },
        { minQuantity: 101, maxQuantity: 200, discountPct: 0.05, label: '101 a 200 colaboradores' },
        { minQuantity: 201, maxQuantity: 300, discountPct: 0.08, label: '201 a 300 colaboradores' },
        { minQuantity: 301, maxQuantity: 400, discountPct: 0.12, label: '301 a 400 colaboradores' },
        { minQuantity: 401, maxQuantity: 500, discountPct: 0.15, label: '401 a 500 colaboradores' },
        { minQuantity: 501, maxQuantity: 600, discountPct: 0.18, label: '501 a 600 colaboradores' },
        { minQuantity: 601, maxQuantity: 700, discountPct: 0.21, label: '601 a 700 colaboradores' },
        { minQuantity: 701, maxQuantity: 800, discountPct: 0.23, label: '701 a 800 colaboradores' },
        { minQuantity: 801, maxQuantity: 900, discountPct: 0.25, label: '801 a 900 colaboradores' },
        { minQuantity: 901, maxQuantity: 999, discountPct: 0.27, label: '901 a 999 colaboradores' },
        { minQuantity: 1000, maxQuantity: null, discountPct: 0.30, label: '1.000+ colaboradores' },
      ]
    },
    {
      name: 'Saúde Mental NR-1',
      description: 'Programa completo de saúde mental para conformidade com a NR-1. Psicólogos online, plataforma de bem-estar e relatórios de compliance para o RH.',
      shortDesc: 'Psicólogos online + compliance NR-1',
      type: ProductType.RECORRENTE,
      category: ProductCategory.NR1_SAUDE_MENTAL,
      pricePerUnit: 29.90,
      features: ['Sessões com psicólogos', 'Plataforma de bem-estar', 'Relatório NR-1', 'Meditação guiada', 'SOS Emocional 24h'],
      isVisibleTo: ProductVisibility.AMBOS,
      displayOrder: 2,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 100, discountPct: 0, label: 'Até 100 colaboradores' },
        { minQuantity: 101, maxQuantity: 200, discountPct: 0.05, label: '101 a 200 colaboradores' },
        { minQuantity: 201, maxQuantity: 500, discountPct: 0.10, label: '201 a 500 colaboradores' },
        { minQuantity: 501, maxQuantity: 1000, discountPct: 0.20, label: '501 a 1.000 colaboradores' },
        { minQuantity: 1001, maxQuantity: null, discountPct: 0.30, label: '1.001+ colaboradores' },
      ]
    },
    {
      name: 'Odontologia Digital',
      description: 'Plano odontológico com rede credenciada nacional e teleconsulta odontológica. Cobertura para procedimentos de urgência, preventivos e restaurações.',
      shortDesc: 'Plano odonto com rede nacional e teleconsulta',
      type: ProductType.RECORRENTE,
      category: ProductCategory.ODONTO,
      pricePerUnit: 24.90,
      features: ['Rede credenciada nacional', 'Urgência odonto 24h', 'Prevenção inclusa', 'Teleconsulta odonto', 'App para localizar dentistas'],
      isVisibleTo: ProductVisibility.AMBOS,
      displayOrder: 3,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 100, discountPct: 0, label: 'Até 100' },
        { minQuantity: 101, maxQuantity: 500, discountPct: 0.08, label: '101-500' },
        { minQuantity: 501, maxQuantity: null, discountPct: 0.18, label: '500+' },
      ]
    },
    {
      name: 'Clube de Vantagens',
      description: 'Plataforma de descontos e benefícios com mais de 30.000 parceiros. Farmácias, academias, restaurantes, cursos, viagens e muito mais.',
      shortDesc: '+30.000 descontos em farmácias, academias e restaurantes',
      type: ProductType.RECORRENTE,
      category: ProductCategory.CLUBE_VANTAGENS,
      pricePerUnit: 9.90,
      features: ['+30k parceiros', 'Farmácias até 60% off', 'Academias desconto', 'Cashback nas compras', 'App exclusivo'],
      isVisibleTo: ProductVisibility.AMBOS,
      displayOrder: 4,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 200, discountPct: 0, label: 'Até 200' },
        { minQuantity: 201, maxQuantity: null, discountPct: 0.15, label: '201+' },
      ]
    },
    {
      name: 'Perícia Médica Online',
      description: 'Laudos periciais médicos realizados por teleperícia. Para benefícios do INSS, contestações e documentação médico-legal. Disponível por créditos.',
      shortDesc: 'Laudos periciais por teleperícia — uso por crédito',
      type: ProductType.PONTUAL_CREDITO,
      category: ProductCategory.PERICIA_MEDICA,
      pricePerUnit: 0,
      creditValue: 189.90,
      features: ['Teleperícia com laudo digital', 'Médicos peritos certificados', 'Laudo em até 48h', 'Válido para INSS', 'Assinatura digital ICP-Brasil'],
      isVisibleTo: ProductVisibility.CLINICA,
      displayOrder: 5,
      discountTiers: []
    },
    {
      name: 'Laudos a Distância',
      description: 'Laudos médicos de especialidades para empresas e clínicas. Eletrocardiograma, espirometria, audiometria interpretada e outros exames com laudo digital.',
      shortDesc: 'Laudos de exames ocupacionais com médico a distância',
      type: ProductType.PONTUAL_CREDITO,
      category: ProductCategory.LAUDO_DISTANCIA,
      pricePerUnit: 0,
      creditValue: 89.90,
      features: ['ECG, espirometria, audiometria', 'Laudo em até 24h', 'Médico especialista', 'Integra com sistemas de clínica', 'Assinatura digital'],
      isVisibleTo: ProductVisibility.CLINICA,
      displayOrder: 6,
      discountTiers: []
    },
    {
      name: 'ASO Digital',
      description: 'Emissão de Atestado de Saúde Ocupacional (ASO) digital com assinatura ICP-Brasil. Conformidade com NR-7 e integração com e-Social.',
      shortDesc: 'ASO digital com assinatura ICP-Brasil e integração e-Social',
      type: ProductType.RECORRENTE,
      category: ProductCategory.ASO_EXAME_OCUPACIONAL,
      pricePerUnit: 14.90,
      features: ['ASO ICP-Brasil', 'Integração e-Social', 'Conformidade NR-7', 'Prontuário digital', 'Relatórios BI'],
      isVisibleTo: ProductVisibility.AMBOS,
      displayOrder: 7,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 100, discountPct: 0, label: 'Até 100' },
        { minQuantity: 101, maxQuantity: null, discountPct: 0.10, label: '101+' },
      ]
    },
  ]

  for (const { discountTiers, ...productData } of products) {
    const product = await prisma.product.upsert({
      where: { id: productData.name },
      update: {},
      create: {
        ...productData,
        discountTiers: { create: discountTiers },
      },
    })
    console.log(`✅ Produto criado: ${product.name}`)
  }

  // ── Badges de Gamificação ─────────────────────────────
  const badges = [
    { name: 'Primeira Venda', description: 'Realizou a primeira venda via URL exclusiva', iconUrl: '/badges/first-sale.svg', condition: { metric: 'total_sales', operator: 'gte', value: 1 } },
    { name: '10 Empresas', description: 'Tem 10 empresas-clientes ativas', iconUrl: '/badges/10-companies.svg', condition: { metric: 'active_companies', operator: 'gte', value: 10 } },
    { name: 'MRR R$5k', description: 'Atingiu R$5.000 de MRR', iconUrl: '/badges/mrr-5k.svg', condition: { metric: 'mrr', operator: 'gte', value: 5000 } },
    { name: 'Top 10', description: 'Entrou no Top 10 do ranking mensal', iconUrl: '/badges/top10.svg', condition: { metric: 'ranking_position', operator: 'lte', value: 10 } },
    { name: 'Indicação Ouro', description: 'Indicou 3 clínicas que se tornaram parceiras', iconUrl: '/badges/referral-gold.svg', condition: { metric: 'referrals_active', operator: 'gte', value: 3 } },
  ]

  for (const badge of badges) {
    await prisma.gamificationBadge.upsert({
      where: { id: badge.name },
      update: {},
      create: badge,
    })
  }
  console.log('✅ Badges de gamificação criados')

  // ── Templates de Automação ────────────────────────────
  const templates = [
    {
      name: 'Boas-vindas à Clínica',
      trigger: 'CLINIC_SIGNUP',
      channel: 'EMAIL',
      subject: '🎉 Bem-vinda à Panexa, {{clinic_name}}!',
      body: '<h1>Olá, {{clinic_name}}!</h1><p>Sua conta Panexa está ativa. Acesse seu painel e comece a distribuir benefícios para as empresas da sua carteira.</p><p><a href="{{dashboard_url}}">Acessar Painel</a></p>',
      delayHours: 0,
    },
    {
      name: 'URL Exclusiva Ativa',
      trigger: 'CLINIC_SIGNUP',
      channel: 'WHATSAPP',
      subject: null,
      body: '👋 Olá, *{{clinic_name}}*! Sua URL exclusiva Panexa já está ativa: {{clinic_url}} Compartilhe com suas empresas e comece a ganhar 30% de comissão! 🚀',
      delayHours: 1,
    },
    {
      name: 'Confirmação de Compra - Empresa',
      trigger: 'COMPANY_PURCHASE',
      channel: 'EMAIL',
      subject: 'Compra confirmada — {{product_name}} para {{company_name}}',
      body: '<h1>Pagamento confirmado! ✅</h1><p>Olá, {{contact_name}}. Sua contratação de <strong>{{product_name}}</strong> para {{employee_count}} colaboradores foi confirmada.</p><p>Acesse o painel para gerenciar licenças: <a href="{{dashboard_url}}">Painel da Empresa</a></p>',
      delayHours: 0,
    },
    {
      name: 'Convite de Onboarding - Colaborador',
      trigger: 'EMPLOYEE_INVITE',
      channel: 'EMAIL',
      subject: '{{company_name}} liberou seu benefício de saúde!',
      body: '<h1>Seu benefício está te esperando 🎁</h1><p>Olá, {{employee_name}}! A empresa {{company_name}} contratou <strong>{{product_name}}</strong> para você.</p><p><a href="{{activation_url}}">Ativar minha conta</a></p><p>Link válido por 7 dias.</p>',
      delayHours: 0,
    },
    {
      name: 'Alerta de Pagamento Recusado',
      trigger: 'PAYMENT_FAILED',
      channel: 'BOTH',
      subject: '⚠️ Problema no pagamento — {{company_name}}',
      body: '<p>Olá, {{contact_name}}. Identificamos uma falha no pagamento de {{amount}} para {{product_name}}. <a href="{{retry_url}}">Clique aqui para tentar novamente</a></p>',
      delayHours: 0,
    },
    {
      name: 'Inadimplência D+7',
      trigger: 'PAYMENT_OVERDUE_D7',
      channel: 'BOTH',
      subject: '🔴 Pagamento em atraso — ação necessária',
      body: '<p>Atenção, {{contact_name}}! O pagamento de {{amount}} está há 7 dias em atraso. Para evitar a suspensão do serviço, regularize agora: <a href="{{payment_url}}">Pagar agora</a></p>',
      delayHours: 0,
    },
    {
      name: 'Reativação após Pagamento',
      trigger: 'SUBSCRIPTION_REACTIVATED',
      channel: 'EMAIL',
      subject: '✅ Serviço reativado — {{product_name}}',
      body: '<h1>Tudo certo! 🎉</h1><p>Olá, {{contact_name}}. Seu pagamento foi confirmado e o acesso ao {{product_name}} foi reativado para todos os colaboradores.</p>',
      delayHours: 0,
    },
  ]

  for (const template of templates) {
    await prisma.automationTemplate.upsert({
      where: { trigger_channel: { trigger: template.trigger as any, channel: template.channel as any } },
      update: {},
      create: template as any,
    })
  }
  console.log('✅ Templates de automação criados')

  console.log('\n🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
