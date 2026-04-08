import axios, { AxiosError } from 'axios'
import { getSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

// Attach Bearer token from session
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const session = await getSession()
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }
  }
  return config
})

// Handle 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── API helpers ───────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then(r => r.data),

  logout: () => api.post('/auth/logout').then(r => r.data),

  registerClinic: (data: object) =>
    api.post('/auth/register-clinic', data).then(r => r.data),
}

export const clinicsApi = {
  findAll: (params?: object) =>
    api.get('/clinics', { params }).then(r => r.data),

  // alias
  getAll: (params?: object) =>
    api.get('/clinics', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get(`/clinics/${id}`).then(r => r.data),

  getBySlug: (slug: string) =>
    api.get(`/clinics/public/${slug}`).then(r => r.data),

  create: (data: object) =>
    api.post('/clinics', data).then(r => r.data),

  update: (id: string, data: object) =>
    api.put(`/clinics/${id}`, data).then(r => r.data),

  activate: (id: string) =>
    api.patch(`/clinics/${id}/activate`).then(r => r.data),

  suspend: (id: string, reason: string) =>
    api.patch(`/clinics/${id}/suspend`, { reason }).then(r => r.data),

  getHealthScore: (id: string) =>
    api.get(`/clinics/${id}/health-score`).then(r => r.data),

  getCommissions: (id: string, params?: object) =>
    api.get(`/clinics/${id}/commissions`, { params }).then(r => r.data),

  getMyProducts: () =>
    api.get('/clinics/me/products').then(r => r.data),

  updateMyProducts: (productIds: string[]) =>
    api.put('/clinics/me/products', { productIds }).then(r => r.data),
}

export const companiesApi = {
  findAll: (params?: object) =>
    api.get('/companies', { params }).then(r => r.data),

  getAll: (params?: object) =>
    api.get('/companies', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get(`/companies/${id}`).then(r => r.data),

  create: (data: object) =>
    api.post('/companies', data).then(r => r.data),

  update: (id: string, data: object) =>
    api.put(`/companies/${id}`, data).then(r => r.data),

  getEmployees: (companyId: string, params?: object) =>
    api.get(`/companies/${companyId}/employees`, { params }).then(r => r.data),

  createEmployee: (companyId: string, data: object) =>
    api.post(`/companies/${companyId}/employees`, data).then(r => r.data),

  blockEmployee: (companyId: string, employeeId: string) =>
    api.patch(`/companies/${companyId}/employees/${employeeId}/block`).then(r => r.data),

  importEmployees: (companyId: string, rows: object[]) =>
    api.post(`/companies/${companyId}/employees/import`, { rows }).then(r => r.data),
}

export const employeesApi = {
  getAll: (params?: object) =>
    api.get('/employees', { params }).then(r => r.data),

  create: (data: object) =>
    api.post('/employees', data).then(r => r.data),

  update: (id: string, data: object) =>
    api.patch(`/employees/${id}`, data).then(r => r.data),

  sendInvite: (id: string) =>
    api.post(`/employees/${id}/invite`).then(r => r.data),

  block: (id: string) =>
    api.patch(`/employees/${id}/block`).then(r => r.data),

  activate: (token: string, data: object) =>
    api.post(`/employees/activate/${token}`, data).then(r => r.data),
}

export const productsApi = {
  findAll: (params?: object) =>
    api.get('/products', { params }).then(r => r.data),

  getAll: (params?: object) =>
    api.get('/products', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get(`/products/${id}`).then(r => r.data),

  create: (data: object) =>
    api.post('/products', data).then(r => r.data),

  update: (id: string, data: object) =>
    api.put(`/products/${id}`, data).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/products/${id}`).then(r => r.data),

  calculatePrice: (productId: string, quantity: number) =>
    api.get(`/products/${productId}/price`, { params: { quantity } }).then(r => r.data),
}

export const ordersApi = {
  create: (data: object) =>
    api.post('/orders', data).then(r => r.data),

  findAll: (params?: object) =>
    api.get('/orders', { params }).then(r => r.data),

  getAll: (params?: object) =>
    api.get('/orders', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get(`/orders/${id}`).then(r => r.data),

  cancel: (id: string) =>
    api.patch(`/orders/${id}/cancel`).then(r => r.data),
}

export const paymentsApi = {
  retryPayment: (orderId: string) =>
    api.post(`/payments/retry/${orderId}`).then(r => r.data),

  getInvoices: (params?: object) =>
    api.get('/payments/invoices', { params }).then(r => r.data),
}

export const dashboardApi = {
  getPanexa: () =>
    api.get('/dashboard/panexa').then(r => r.data),

  getClinic: () =>
    api.get('/dashboard/clinic').then(r => r.data),

  getCompany: () =>
    api.get('/dashboard/company').then(r => r.data),
}

export const settingsApi = {
  getAll: () =>
    api.get('/settings').then(r => r.data),

  getTheme: () =>
    api.get('/settings/theme').then(r => r.data),

  update: (key: string, value: string) =>
    api.put(`/settings/${key}`, { value }).then(r => r.data),

  updateBulk: (entries: Record<string, string>) =>
    api.put('/settings', entries).then(r => r.data),

  uploadLogo: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/settings/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
}

export const cnpjApi = {
  lookup: (cnpj: string) =>
    api.get(`/utils/cnpj/${cnpj.replace(/\D/g, '')}`).then(r => r.data),
}
