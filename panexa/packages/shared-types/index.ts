// ─────────────────────────────────────────────────────────────────────────────
//  @panexa/shared-types — Types compartilhados entre frontend e backend
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums ─────────────────────────────────────────────────────────────────────

export type Role = 'ADMIN_PANEXA' | 'ADMIN_CLINICA' | 'ADMIN_EMPRESA' | 'COLABORADOR'

export type ClinicPlan = 'FREE' | 'ESSENCIAL' | 'PROFISSIONAL' | 'ENTERPRISE'

export type PlanStatus = 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'SUSPENDED'

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'OVERDUE'

export type PaymentMethod = 'CREDIT_CARD' | 'BOLETO' | 'PIX'

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED' | 'CHARGEBACK'

export type CommissionStatus = 'PENDING' | 'PAID' | 'HELD' | 'CANCELLED'

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING_ACTIVATION'

export type ProductType = 'RECORRENTE' | 'PONTUAL_CREDITO'

export type ProductCategory =
  | 'TELEMEDICINA'
  | 'NR1_SAUDE_MENTAL'
  | 'ASO_EXAME_OCUPACIONAL'
  | 'ODONTO'
  | 'SEGURO_VIDA'
  | 'CLUBE_VANTAGENS'
  | 'PERICIA_MEDICA'
  | 'LAUDO_DISTANCIA'

export type ProductVisibility = 'EMPRESA' | 'CLINICA' | 'AMBOS'

export type LicenseStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED'

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface TokenPayload {
  sub: string           // userId
  email: string
  role: Role
  clinicId?: string
  companyId?: string
  employeeId?: string
  iat?: number
  exp?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterClinicDto {
  cnpj: string
  razaoSocial: string
  email: string
  phone: string
  contactName: string
  password: string
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface UserDto {
  id: string
  email: string
  name: string
  role: Role
  phone?: string
  isActive: boolean
  clinicId?: string
  companyId?: string
  employeeId?: string
  createdAt: string
}

// ── Clinic ────────────────────────────────────────────────────────────────────

export interface ClinicDto {
  id: string
  cnpj: string
  razaoSocial: string
  nomeFantasia?: string
  slug: string
  email: string
  phone: string
  address?: Address
  logoUrl?: string
  plan: ClinicPlan
  planStatus: PlanStatus
  commissionRate: number
  referralCode: string
  healthScore: number
  primaryColor?: string
  accentColor?: string
  marketingTitle?: string
  marketingSubtitle?: string
  bannerUrl?: string
  isActive: boolean
  createdAt: string
  stats?: ClinicStats
}

export interface ClinicStats {
  mrr: number
  totalSales: number
  activeCompanies: number
  totalEmployees: number
  commissionThisMonth: number
  conversionRate: number
  rankingPosition?: number
}

export interface ClinicPublicDto {
  id: string
  razaoSocial: string
  nomeFantasia?: string
  slug: string
  logoUrl?: string
  primaryColor: string
  accentColor: string
  marketingTitle: string
  marketingSubtitle: string
  bannerUrl?: string
  products: ProductDto[]
}

// ── Company ───────────────────────────────────────────────────────────────────

export interface CompanyDto {
  id: string
  cnpj: string
  razaoSocial: string
  nomeFantasia?: string
  email: string
  phone: string
  address?: Address
  contactName: string
  employeeCount?: number
  clinicId: string
  isActive: boolean
  createdAt: string
  stats?: CompanyStats
}

export interface CompanyStats {
  totalEmployees: number
  activeEmployees: number
  pendingEmployees: number
  activeLicenses: number
  nextBillingDate?: string
  nextBillingAmount?: number
  isOverdue: boolean
  overdueAmount?: number
}

// ── Employee ──────────────────────────────────────────────────────────────────

export interface EmployeeDto {
  id: string
  cpf: string
  name: string
  email: string
  phone?: string
  birthDate?: string
  department?: string
  position?: string
  companyId: string
  status: EmployeeStatus
  activatedAt?: string
  consentAt?: string
  createdAt: string
  licenses?: LicenseDto[]
}

// ── Product ───────────────────────────────────────────────────────────────────

export interface ProductDto {
  id: string
  name: string
  description: string
  shortDesc?: string
  type: ProductType
  category: ProductCategory
  pricePerUnit: number
  creditValue?: number
  minQuantity: number
  imageUrl?: string
  features: string[]
  isActive: boolean
  isVisibleTo: ProductVisibility
  displayOrder: number
  discountTiers: DiscountTierDto[]
}

export interface DiscountTierDto {
  id: string
  minQuantity: number
  maxQuantity?: number
  discountPct: number
  label?: string
}

// ── Order & Checkout ──────────────────────────────────────────────────────────

export interface CreateOrderDto {
  clinicSlug: string
  referralToken: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  company: {
    cnpj: string
    razaoSocial: string
    nomeFantasia?: string
    email: string
    phone: string
    contactName: string
    address: Address
  }
  items: Array<{
    productId: string
    quantity: number
  }>
  paymentMethod: PaymentMethod
  cardToken?: string  // Token do cartão via Asaas.js
  installments?: number
}

export interface OrderDto {
  id: string
  clinicId: string
  companyId: string
  status: OrderStatus
  totalAmount: number
  discountAmount: number
  finalAmount: number
  paymentMethod: PaymentMethod
  gatewayUrl?: string
  referralToken: string
  paidAt?: string
  createdAt: string
  items: OrderItemDto[]
  payment?: PaymentDto
  commission?: CommissionDto
}

export interface OrderItemDto {
  id: string
  productId: string
  product: ProductDto
  quantity: number
  unitPrice: number
  discountPct: number
  totalPrice: number
}

// ── Payment ───────────────────────────────────────────────────────────────────

export interface PaymentDto {
  id: string
  orderId: string
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  pixQrCode?: string
  boletoUrl?: string
  boletoBarCode?: string
  dueDate?: string
  confirmedAt?: string
  createdAt: string
}

// ── Commission ────────────────────────────────────────────────────────────────

export interface CommissionDto {
  id: string
  orderId: string
  clinicId: string
  grossAmount: number
  clinicPct: number
  clinicAmount: number
  panexaAmount: number
  status: CommissionStatus
  paidAt?: string
  createdAt: string
}

// ── License ───────────────────────────────────────────────────────────────────

export interface LicenseDto {
  id: string
  orderId: string
  companyId: string
  productId: string
  product?: ProductDto
  employeeId?: string
  employee?: EmployeeDto
  status: LicenseStatus
  token: string
  activatedAt?: string
  expiresAt?: string
  createdAt: string
}

// ── Dashboard KPIs ────────────────────────────────────────────────────────────

export interface PanexaDashboardDto {
  clinicsActive: number
  clinicsNew: number
  mrrTotal: number
  mrrGrowth: number
  gmvMonth: number
  gmvGrowth: number
  takeRate: number
  companiesActive: number
  employeesActive: number
  churnRate: number
  topClinics: ClinicRankingItem[]
  recentTransactions: OrderDto[]
  mrrChart: ChartDataPoint[]
  salesChart: ChartDataPoint[]
}

export interface ClinicDashboardDto {
  mrrGenerated: number
  mrrGrowth: number
  commissionThisMonth: number
  commissionGrowth: number
  activeCompanies: number
  totalEmployees: number
  conversionRate: number
  rankingPosition: number
  rankingTotal: number
  commissionChart: ChartDataPoint[]
  companiesList: CompanyDto[]
  recentSales: OrderDto[]
}

export interface CompanyDashboardDto {
  activeProducts: ProductDto[]
  totalLicenses: number
  usedLicenses: number
  availableLicenses: number
  nextBillingDate: string
  nextBillingAmount: number
  isOverdue: boolean
  overdueAmount?: number
  overduePaymentUrl?: string
  recentEmployees: EmployeeDto[]
  upsellSuggestions: ProductDto[]
}

// ── Shared DTOs ───────────────────────────────────────────────────────────────

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export interface ChartDataPoint {
  label: string  // "Jan", "Fev", etc.
  value: number
}

export interface ClinicRankingItem {
  clinicId: string
  clinicName: string
  logoUrl?: string
  position: number
  mrr: number
  salesCount: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

// ── Price Calculation ─────────────────────────────────────────────────────────

export interface PriceCalculation {
  productId: string
  quantity: number
  unitPrice: number
  discountPct: number
  discountAmount: number
  totalPrice: number
  appliedTier?: DiscountTierDto
}

export function calculatePrice(
  product: ProductDto,
  quantity: number
): PriceCalculation {
  const tier = product.discountTiers
    .sort((a, b) => b.minQuantity - a.minQuantity)
    .find(t => quantity >= t.minQuantity && (t.maxQuantity == null || quantity <= t.maxQuantity))

  const discountPct = tier?.discountPct ?? 0
  const unitPrice = product.pricePerUnit
  const discountAmount = unitPrice * quantity * discountPct
  const totalPrice = unitPrice * quantity - discountAmount

  return {
    productId: product.id,
    quantity,
    unitPrice,
    discountPct,
    discountAmount,
    totalPrice,
    appliedTier: tier,
  }
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '')
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '')
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  TELEMEDICINA: 'Telemedicina',
  NR1_SAUDE_MENTAL: 'Saúde Mental / NR-1',
  ASO_EXAME_OCUPACIONAL: 'ASO Ocupacional',
  ODONTO: 'Odontologia',
  SEGURO_VIDA: 'Seguro de Vida',
  CLUBE_VANTAGENS: 'Clube de Vantagens',
  PERICIA_MEDICA: 'Perícia Médica',
  LAUDO_DISTANCIA: 'Laudos a Distância',
}

export const PLAN_LABELS: Record<ClinicPlan, string> = {
  FREE: 'Gratuito',
  ESSENCIAL: 'Essencial',
  PROFISSIONAL: 'Profissional',
  ENTERPRISE: 'Enterprise',
}

export const PLAN_PRICES: Record<ClinicPlan, number> = {
  FREE: 0,
  ESSENCIAL: 149,
  PROFISSIONAL: 299,
  ENTERPRISE: 699,
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Aguardando Pagamento',
  PAID: 'Pago',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
  OVERDUE: 'Em Atraso',
}

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  BLOCKED: 'Bloqueado',
  PENDING_ACTIVATION: 'Aguardando Ativação',
}
