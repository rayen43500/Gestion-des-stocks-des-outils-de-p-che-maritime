const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export type ProductDto = {
  _id: string
  id: string
  name: string
  description: string
  price: number
  quantity: number
  category: string
  qrCode: string
  updatedAt: string
}

export type StockMovementDto = {
  _id: string
  productId: string
  type: 'IN' | 'OUT'
  quantity: number
  note: string
  createdAt: string
}

export type SupplierDto = {
  _id: string
  id: string
  name: string
  email: string
  phone: string
  address: string
  productIds: string[]
  updatedAt: string
}

export type ClientDto = {
  _id: string
  id: string
  name: string
  email: string
  phone: string
  address: string
  updatedAt: string
}

export type OrderItemDto = {
  productId: string
  quantity: number
  unitPrice: number
}

export type OrderDto = {
  _id: string
  id: string
  clientId: string
  items: OrderItemDto[]
  status: 'Draft' | 'Confirmed' | 'Delivered'
  note: string
  totalAmount: number
  updatedAt: string
}

export type DeliveryItemDto = {
  productId: string
  quantityDelivered: number
}

export type DeliveryDto = {
  _id: string
  id: string
  orderId: string
  items: DeliveryItemDto[]
  status: 'InTransit' | 'Delivered'
  note: string
  createdAt: string
  updatedAt: string
}

export type InvoiceDto = {
  _id: string
  id: string
  orderId: string
  clientId: string
  totalAmount: number
  paidAmount: number
  status: 'Unpaid' | 'Partial' | 'Paid'
  description: string
  note: string
  createdAt: string
  updatedAt: string
}

export type PaymentDto = {
  _id: string
  id: string
  invoiceId: string
  amount: number
  method: string
  note: string
  paidAt: string
  createdAt: string
  updatedAt: string
}

export type StatisticsDto = {
  totalSales: number
  totalStock: number
  totalOrders: number
  totalProducts: number
  popularProducts: Array<{ productId: string; name: string; soldQty: number }>
  salesByStatus: Array<{ key: 'Draft' | 'Confirmed' | 'Delivered'; value: number }>
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  token?: string | null
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed')
  }

  return payload as T
}

export async function login(email: string, password: string) {
  return request<{ token: string; user: { email: string; name: string } }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export async function getDashboard(token: string) {
  return request<{
    totalProducts: number
    stockAvailable: number
    lowStockCount: number
    recentOrders: Array<{ id: string; client: string; total: number; status: 'Pending' | 'Delivered' }>
    monthlyFlows: Array<{ month: string; value: number }>
    latestMovements: StockMovementDto[]
  }>('/dashboard', { token })
}

export async function getProducts(token: string) {
  return request<ProductDto[]>('/products', { token })
}

export async function createProduct(
  token: string,
  payload: {
    id: string
    name: string
    description: string
    price: number
    quantity: number
    category: string
    qrCode: string
  },
) {
  return request('/products', { method: 'POST', token, body: payload })
}

export async function updateProduct(
  token: string,
  id: string,
  payload: {
    name: string
    description: string
    price: number
    quantity: number
    category: string
    qrCode: string
  },
) {
  return request(`/products/${id}`, { method: 'PUT', token, body: payload })
}

export async function deleteProduct(token: string, id: string) {
  return request(`/products/${id}`, { method: 'DELETE', token })
}

export async function getMovements(token: string, limit = 100) {
  return request<StockMovementDto[]>(`/stock/movements?limit=${limit}`, { token })
}

export async function createMovement(
  token: string,
  payload: { productId: string; type: 'IN' | 'OUT'; quantity: number; note: string },
) {
  return request<{
    movement: StockMovementDto
  }>('/stock/movements', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function getSuppliers(token: string, search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return request<SupplierDto[]>(`/suppliers${query}`, { token })
}

export async function createSupplier(
  token: string,
  payload: {
    id: string
    name: string
    email: string
    phone: string
    address: string
    productIds: string[]
  },
) {
  return request('/suppliers', { method: 'POST', token, body: payload })
}

export async function updateSupplier(
  token: string,
  id: string,
  payload: {
    name: string
    email: string
    phone: string
    address: string
    productIds: string[]
  },
) {
  return request(`/suppliers/${id}`, { method: 'PUT', token, body: payload })
}

export async function deleteSupplier(token: string, id: string) {
  return request(`/suppliers/${id}`, { method: 'DELETE', token })
}

export async function getClients(token: string, search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return request<ClientDto[]>(`/clients${query}`, { token })
}

export async function createClient(
  token: string,
  payload: {
    id: string
    name: string
    email: string
    phone: string
    address: string
  },
) {
  return request('/clients', { method: 'POST', token, body: payload })
}

export async function updateClient(
  token: string,
  id: string,
  payload: {
    name: string
    email: string
    phone: string
    address: string
  },
) {
  return request(`/clients/${id}`, { method: 'PUT', token, body: payload })
}

export async function deleteClient(token: string, id: string) {
  return request(`/clients/${id}`, { method: 'DELETE', token })
}

export async function getOrders(token: string, search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return request<OrderDto[]>(`/orders${query}`, { token })
}

export async function getOrderDetail(token: string, id: string) {
  return request<{ order: OrderDto; deliveries: DeliveryDto[] }>(`/orders/${id}`, { token })
}

export async function createOrder(
  token: string,
  payload: {
    id: string
    clientId: string
    items: Array<{ productId: string; quantity: number; unitPrice: number }>
    status: 'Draft' | 'Confirmed' | 'Delivered'
    note: string
  },
) {
  return request('/orders', { method: 'POST', token, body: payload })
}

export async function updateOrder(
  token: string,
  id: string,
  payload: {
    clientId: string
    items: Array<{ productId: string; quantity: number; unitPrice: number }>
    status: 'Draft' | 'Confirmed' | 'Delivered'
    note: string
  },
) {
  return request(`/orders/${id}`, { method: 'PUT', token, body: payload })
}

export async function deleteOrder(token: string, id: string) {
  return request(`/orders/${id}`, { method: 'DELETE', token })
}

export async function getDeliveries(token: string, search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return request<DeliveryDto[]>(`/deliveries${query}`, { token })
}

export async function getDeliveryDetail(token: string, id: string) {
  return request<{ delivery: DeliveryDto; order: OrderDto }>(`/deliveries/${id}`, { token })
}

export async function createDelivery(
  token: string,
  payload: {
    id: string
    orderId: string
    items: Array<{ productId: string; quantityDelivered: number }>
    status: 'InTransit' | 'Delivered'
    note: string
  },
) {
  return request('/deliveries', { method: 'POST', token, body: payload })
}

export async function getInvoices(token: string, search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return request<InvoiceDto[]>(`/invoices${query}`, { token })
}

export async function getInvoiceDetail(token: string, id: string) {
  return request<{ invoice: InvoiceDto; order: OrderDto; payments: PaymentDto[] }>(`/invoices/${id}`, {
    token,
  })
}

export async function generateInvoice(
  token: string,
  payload: { id: string; orderId: string; description: string },
) {
  return request('/invoices', { method: 'POST', token, body: payload })
}

export async function exportInvoiceXml(token: string, id: string) {
  const response = await fetch(`${API_BASE}/invoices/${id}/xml`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message || 'XML export failed')
  }

  return response.text()
}

export async function getPayments(token: string, search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return request<PaymentDto[]>(`/payments${query}`, { token })
}

export async function createPayment(
  token: string,
  payload: { id: string; invoiceId: string; amount: number; method: string; note: string },
) {
  return request('/payments', { method: 'POST', token, body: payload })
}

export async function getStatistics(token: string) {
  return request<StatisticsDto>('/statistics', { token })
}

export async function getProfile(token: string) {
  return request<{ email: string; name: string }>('/settings/profile', { token })
}

export async function updateProfile(
  token: string,
  payload: { name: string; email: string },
) {
  return request<{ email: string; name: string }>('/settings/profile', {
    method: 'PUT',
    token,
    body: payload,
  })
}

export async function updatePassword(
  token: string,
  payload: { currentPassword: string; newPassword: string },
) {
  return request<{ message: string }>('/settings/password', {
    method: 'PUT',
    token,
    body: payload,
  })
}
