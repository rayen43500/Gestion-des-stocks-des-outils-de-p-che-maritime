import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Boxes,
  Building2,
  CreditCard,
  FileText,
  Fish,
  LayoutDashboard,
  LogIn,
  LogOut,
  PackagePlus,
  QrCode,
  Search,
  Settings,
  Truck,
  Users,
} from 'lucide-react'
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import fishingToolsImg from './assets/fishing-tools.svg'
import marineHeroImg from './assets/marine-hero.svg'
import * as api from './lib/api'
import './App.css'

type Product = {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  category: string
  qrCode: string
  updatedAt: string
}

type StockMovement = {
  id: string
  productId: string
  type: 'IN' | 'OUT'
  quantity: number
  note: string
  createdAt: string
}

type DashboardOrder = {
  id: string
  client: string
  total: number
  status: 'Pending' | 'Delivered'
}

type Supplier = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  productIds: string[]
}

type Client = {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

type OrderItem = {
  productId: string
  quantity: number
  unitPrice: number
}

type Order = {
  id: string
  clientId: string
  items: OrderItem[]
  status: 'Draft' | 'Confirmed' | 'Delivered'
  note: string
  totalAmount: number
}

type DeliveryItem = {
  productId: string
  quantityDelivered: number
}

type Delivery = {
  id: string
  orderId: string
  items: DeliveryItem[]
  status: 'InTransit' | 'Delivered'
  note: string
  createdAt: string
}

type Invoice = {
  id: string
  orderId: string
  clientId: string
  totalAmount: number
  paidAmount: number
  status: 'Unpaid' | 'Partial' | 'Paid'
  note: string
}

type Payment = {
  id: string
  invoiceId: string
  amount: number
  method: string
  note: string
  paidAt: string
}

type StatisticsData = {
  totalSales: number
  totalStock: number
  totalOrders: number
  totalProducts: number
  popularProducts: Array<{ productId: string; name: string; soldQty: number }>
  salesByStatus: Array<{ key: 'Draft' | 'Confirmed' | 'Delivered'; value: number }>
}

type ToastData = {
  type: 'success' | 'error'
  message: string
}

const INITIAL_ORDERS: DashboardOrder[] = []
const INITIAL_MONTHLY_FLOWS: Array<{ month: string; value: number }> = []

function numberToCurrency(value: number) {
  return `${value.toFixed(2)} MAD`
}

function appToken() {
  return localStorage.getItem('auth_token')
}

function PublicHome({ authenticated }: { authenticated: boolean }) {
  return (
    <div className="public-home">
      <header className="hero-header">
        <div className="nav-surface">
          <div className="brand-pill">
            <Fish size={18} />
            <span>MarineStock Pro</span>
          </div>

          <nav className="home-nav-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#gallery">Gallery</a>
          </nav>

          <div className="home-nav-actions">
            <Link to="/login" className="ghost-btn">
              Login
            </Link>
            <Link to={authenticated ? '/dashboard' : '/login'} className="solid-btn">
              {authenticated ? 'Open Platform' : 'Start Now'}
            </Link>
          </div>
        </div>
      </header>

      <main id="home" className="hero-content">
        <section className="hero-copy">
          <p className="badge">Stock Management for Maritime Fishing</p>
          <h1>Control your fishing tools stock in real time.</h1>
          <p>
            A single-user workflow to manage products, suppliers, clients, stock
            entries and exits, with clear visibility and full traceability.
          </p>
          <div className="hero-actions">
            <Link to={authenticated ? '/dashboard' : '/login'} className="solid-btn large">
              Go to Dashboard
            </Link>
            <a href="#features" className="ghost-btn large">
              Explore Features
            </a>
          </div>
        </section>

        <section className="hero-visual" aria-label="Fishing logistics visual">
          <img src={marineHeroImg} alt="Fishing boat on modern maritime dashboard background" />
        </section>
      </main>

      <section className="hero-panel-wrap">
        <section className="hero-panel">
          <div className="metric-card">
            <PackagePlus size={20} />
            <strong>Instant Product CRUD</strong>
            <p>Create, edit, search and filter stock items in one place.</p>
          </div>
          <div className="metric-card">
            <Building2 size={20} />
            <strong>Supplier Management</strong>
            <p>Link suppliers to products and keep your sourcing clean.</p>
          </div>
          <div className="metric-card">
            <Users size={20} />
            <strong>Client Management</strong>
            <p>Track clients and keep customer records always available.</p>
          </div>
        </section>
      </section>

      <section id="features" className="feature-grid">
        <article>
          <LayoutDashboard size={22} />
          <h3>Dashboard</h3>
          <p>Global view with KPIs, stock alerts and recent operations.</p>
        </article>
        <article>
          <Boxes size={22} />
          <h3>Products</h3>
          <p>Manage fishing tools with details, pricing and QR code support.</p>
        </article>
        <article>
          <Truck size={22} />
          <h3>Stock Flow</h3>
          <p>Register incoming and outgoing quantities with history tracking.</p>
        </article>
      </section>

      <section id="gallery" className="gallery-block">
        <div className="gallery-copy">
          <h3>Operational Visual Board</h3>
          <p>
            Visual snapshots help teams identify stock pressure, category balance,
            and supply planning for fishing operations.
          </p>
        </div>
        <div className="gallery-image-wrap">
          <img src={fishingToolsImg} alt="Fishing tools inventory cards and analytics layout" />
        </div>
      </section>
    </div>
  )
}

function LoginPage({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<void>
}) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@marine.local')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      await onLogin(email, password)
      navigate('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand-pill center">
          <Fish size={18} />
          <span>MarineStock Pro</span>
        </div>
        <h1>Login</h1>
        <p className="muted">Single user secure access with token session.</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@marine.local"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="********"
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button className="solid-btn full" type="submit" disabled={submitting}>
          <LogIn size={16} />
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

function AppLayout({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-pill center">
          <Fish size={18} />
          <span>MarineStock Pro</span>
        </div>

        <nav className="nav-links">
          <NavLink to="/dashboard">
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink to="/products">
            <Boxes size={16} /> Products
          </NavLink>
          <NavLink to="/suppliers">
            <Building2 size={16} /> Suppliers
          </NavLink>
          <NavLink to="/clients">
            <Users size={16} /> Clients
          </NavLink>
          <NavLink to="/orders">
            <PackagePlus size={16} /> Orders
          </NavLink>
          <NavLink to="/deliveries">
            <Truck size={16} /> Deliveries
          </NavLink>
          <NavLink to="/invoices">
            <FileText size={16} /> Invoices
          </NavLink>
          <NavLink to="/payments">
            <CreditCard size={16} /> Payments
          </NavLink>
          <NavLink to="/statistics">
            <BarChart3 size={16} /> Statistics
          </NavLink>
          <NavLink to="/settings">
            <Settings size={16} /> Settings
          </NavLink>
          <NavLink to="/stock">
            <Truck size={16} /> Stock
          </NavLink>
        </nav>

        <button className="ghost-btn full" onClick={onLogout}>
          <LogOut size={16} /> Logout
        </button>
      </aside>

      <div className="page-wrap">
        <Outlet />
      </div>
    </div>
  )
}

function DashboardPage({
  products,
  movements,
  orders,
  monthlyFlows,
}: {
  products: Product[]
  movements: StockMovement[]
  orders: DashboardOrder[]
  monthlyFlows: Array<{ month: string; value: number }>
}) {
  const totalProducts = products.length
  const stockAvailable = products.reduce((sum, product) => sum + product.quantity, 0)
  const lowStock = products.filter((product) => product.quantity < 8).length

  return (
    <div className="page-grid">
      <header className="section-header">
        <h2>Dashboard</h2>
        <p>Global monitoring and smart alerts for your maritime stock.</p>
      </header>

      <section className="kpi-grid">
        <article className="kpi-card">
          <span>Total products</span>
          <strong>{totalProducts}</strong>
        </article>
        <article className="kpi-card">
          <span>Stock available</span>
          <strong>{stockAvailable}</strong>
        </article>
        <article className="kpi-card warning">
          <span>Low stock items</span>
          <strong>{lowStock}</strong>
        </article>
      </section>

      <section className="chart-card">
        <h3>Stock Flow Trend</h3>
        <div className="bar-chart" role="img" aria-label="Monthly stock trend">
          {monthlyFlows.map((item) => (
            <div key={item.month} className="bar-col">
              <div className="bar" style={{ height: `${item.value}%` }} />
              <span>{item.month}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="split-grid">
        <article className="panel-card">
          <h3>Recent orders</h3>
          <ul className="clean-list">
            {orders.map((order) => (
              <li key={order.id}>
                <div>
                  <strong>{order.id}</strong>
                  <small>{order.client}</small>
                </div>
                <div className="align-right">
                  <span>{numberToCurrency(order.total)}</span>
                  <small>{order.status}</small>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel-card">
          <h3>Latest movements</h3>
          <ul className="clean-list">
            {movements.slice(0, 5).map((movement) => (
              <li key={movement.id}>
                <div>
                  <strong>{movement.type}</strong>
                  <small>{movement.productId}</small>
                </div>
                <div className="align-right">
                  <span>{movement.quantity}</span>
                  <small>{new Date(movement.createdAt).toLocaleDateString()}</small>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}

function ProductsListPage({
  products,
  onDelete,
}: {
  products: Product[]
  onDelete: (id: string) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [scanCode, setScanCode] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerError, setScannerError] = useState('')

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!scannerOpen) {
      return
    }

    let isCancelled = false

    const stopScanner = () => {
      if (scanTimerRef.current !== null) {
        window.clearInterval(scanTimerRef.current)
        scanTimerRef.current = null
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }

    const startScanner = async () => {
      try {
        setScannerError('')

        const BarcodeDetectorCtor = (window as Window & { BarcodeDetector?: any }).BarcodeDetector
        if (!BarcodeDetectorCtor) {
          setScannerError('QR scanner is not supported by this browser. Use Chrome/Edge.')
          return
        }

        const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] })

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        scanTimerRef.current = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) {
            return
          }

          try {
            const codes = await detector.detect(videoRef.current)
            if (codes && codes.length > 0 && codes[0]?.rawValue) {
              const value = String(codes[0].rawValue).trim()
              if (value) {
                setScanCode(value)
                setScannerOpen(false)
              }
            }
          } catch {
            // Ignore detection frame errors and keep scanning
          }
        }, 350)
      } catch {
        setScannerError('Camera access refused or unavailable.')
      }
    }

    void startScanner()

    return () => {
      isCancelled = true
      stopScanner()
    }
  }, [scannerOpen])

  const categories = useMemo(
    () => ['all', ...new Set(products.map((product) => product.category))],
    [products],
  )

  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase()
    const matchesText =
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.id.toLowerCase().includes(term)
    const matchesCategory = category === 'all' || product.category === category
    const matchesQr = !scanCode || product.qrCode.toLowerCase().includes(scanCode.toLowerCase())
    return matchesText && matchesCategory && matchesQr
  })

  return (
    <div className="page-grid">
      <header className="section-header inline">
        <div>
          <h2>Products</h2>
          <p>List, search, filter, and manage all fishing tools.</p>
        </div>
        <Link to="/products/new" className="solid-btn">
          <PackagePlus size={16} /> Add product
        </Link>
      </header>

      <section className="filters-grid">
        <label>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, id, description..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label>
          <Boxes size={16} />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          <QrCode size={16} />
          <input
            type="text"
            placeholder="QR scan code"
            value={scanCode}
            onChange={(event) => setScanCode(event.target.value)}
          />
        </label>
      </section>

      <section className="scanner-bar">
        <button className="ghost-btn" type="button" onClick={() => setScannerOpen(true)}>
          <QrCode size={16} /> Scan QR code
        </button>
      </section>

      {scannerOpen ? (
        <section className="scanner-modal" role="dialog" aria-modal="true">
          <div className="scanner-card">
            <div className="section-header inline small">
              <h3>QR Scanner</h3>
              <button className="ghost-btn" type="button" onClick={() => setScannerOpen(false)}>
                Close
              </button>
            </div>

            <video ref={videoRef} className="scanner-video" muted playsInline />
            <p className="muted">Place the QR code inside camera view.</p>
            {scannerError ? <p className="error-text">{scannerError}</p> : null}
          </div>
        </section>
      ) : null}

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{numberToCurrency(product.price)}</td>
                <td>
                  <span className={product.quantity < 8 ? 'tag danger' : 'tag ok'}>
                    {product.quantity}
                  </span>
                </td>
                <td className="actions-cell">
                  <Link to={`/products/${product.id}`}>Detail</Link>
                  <Link to={`/products/${product.id}/edit`}>Edit</Link>
                  <button onClick={() => void onDelete(product.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function ProductFormPage({
  products,
  onSubmit,
}: {
  products: Product[]
  onSubmit: (payload: Omit<Product, 'updatedAt'>) => Promise<void>
}) {
  const navigate = useNavigate()
  const { id } = useParams()
  const product = id ? products.find((item) => item.id === id) : undefined

  const [form, setForm] = useState<Omit<Product, 'updatedAt'>>(
    product ?? {
      id: `P-${String(Math.floor(Math.random() * 900 + 100))}`,
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      category: 'Filets',
      qrCode: '',
    },
  )

  const [error, setError] = useState('')
  const isEdit = Boolean(product)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name || !form.description || !form.category || !form.qrCode) {
      setError('Please fill all fields.')
      return
    }

    try {
      setError('')
      await onSubmit(form)
      navigate('/products')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot save product.'
      setError(message)
    }
  }

  return (
    <div className="page-grid">
      <header className="section-header">
        <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
        <p>Manage product information and stock baseline values.</p>
      </header>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Product ID
            <input
              value={form.id}
              onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
              disabled={isEdit}
            />
          </label>

          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>

          <label>
            Category
            <input
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            />
          </label>

          <label>
            Price
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, price: Number(event.target.value) }))
              }
            />
          </label>

          <label>
            Quantity
            <input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))
              }
            />
          </label>

          <label>
            QR code
            <input
              value={form.qrCode}
              onChange={(event) => setForm((prev) => ({ ...prev, qrCode: event.target.value }))}
            />
          </label>
        </div>

        <label>
          Description
          <textarea
            rows={4}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="action-row">
          <button className="solid-btn" type="submit">
            {isEdit ? 'Save changes' : 'Create product'}
          </button>
          <button className="ghost-btn" type="button" onClick={() => navigate('/products')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function ProductDetailPage({ products }: { products: Product[] }) {
  const { id } = useParams()
  const product = products.find((item) => item.id === id)

  if (!product) {
    return (
      <div className="panel-card">
        <h3>Product not found</h3>
        <Link to="/products">Back to products</Link>
      </div>
    )
  }

  return (
    <div className="page-grid">
      <header className="section-header inline">
        <div>
          <h2>Product detail</h2>
          <p>Complete information for this stock item.</p>
        </div>
        <Link className="solid-btn" to={`/products/${product.id}/edit`}>
          Edit product
        </Link>
      </header>

      <article className="detail-card">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <ul>
          <li>
            <strong>ID:</strong> {product.id}
          </li>
          <li>
            <strong>Category:</strong> {product.category}
          </li>
          <li>
            <strong>Price:</strong> {numberToCurrency(product.price)}
          </li>
          <li>
            <strong>Quantity:</strong> {product.quantity}
          </li>
          <li>
            <strong>QR:</strong> {product.qrCode}
          </li>
        </ul>
      </article>
    </div>
  )
}

function SuppliersListPage({
  suppliers,
  products,
  onDelete,
}: {
  suppliers: Supplier[]
  products: Product[]
  onDelete: (id: string) => Promise<void>
}) {
  const [search, setSearch] = useState('')

  const filtered = suppliers.filter((supplier) => {
    const term = search.toLowerCase()
    return (
      supplier.id.toLowerCase().includes(term) ||
      supplier.name.toLowerCase().includes(term) ||
      supplier.email.toLowerCase().includes(term) ||
      supplier.phone.toLowerCase().includes(term)
    )
  })

  const productNameById = useMemo(() => {
    const map = new Map<string, string>()
    products.forEach((product) => map.set(product.id, product.name))
    return map
  }, [products])

  return (
    <div className="page-grid">
      <header className="section-header inline">
        <div>
          <h2>Suppliers</h2>
          <p>Manage suppliers and link supplied products.</p>
        </div>
        <Link to="/suppliers/new" className="solid-btn">
          <PackagePlus size={16} /> Add supplier
        </Link>
      </header>

      <section className="filters-grid single">
        <label>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search supplier by id, name, email, phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </section>

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Linked products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.id}</td>
                <td>{supplier.name}</td>
                <td>
                  {supplier.email || '-'} <br /> {supplier.phone || '-'}
                </td>
                <td>
                  <div className="inline-tags">
                    {supplier.productIds.length === 0 ? (
                      <span className="tag">No products</span>
                    ) : (
                      supplier.productIds.map((productId) => (
                        <span className="tag" key={productId}>
                          {productNameById.get(productId) || productId}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="actions-cell">
                  <Link to={`/suppliers/${supplier.id}/edit`}>Edit</Link>
                  <button onClick={() => void onDelete(supplier.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function SupplierFormPage({
  suppliers,
  products,
  onSubmit,
}: {
  suppliers: Supplier[]
  products: Product[]
  onSubmit: (payload: Supplier) => Promise<void>
}) {
  const navigate = useNavigate()
  const { id } = useParams()
  const supplier = id ? suppliers.find((item) => item.id === id) : undefined

  const [form, setForm] = useState<Supplier>(
    supplier ?? {
      id: `F-${String(Math.floor(Math.random() * 900 + 100))}`,
      name: '',
      email: '',
      phone: '',
      address: '',
      productIds: [],
    },
  )

  const [error, setError] = useState('')
  const isEdit = Boolean(supplier)

  const toggleProduct = (productId: string) => {
    setForm((prev) => {
      const exists = prev.productIds.includes(productId)
      return {
        ...prev,
        productIds: exists
          ? prev.productIds.filter((item) => item !== productId)
          : [...prev.productIds, productId],
      }
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.id || !form.name) {
      setError('Supplier ID and name are required.')
      return
    }

    try {
      setError('')
      await onSubmit(form)
      navigate('/suppliers')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot save supplier.'
      setError(message)
    }
  }

  return (
    <div className="page-grid">
      <header className="section-header">
        <h2>{isEdit ? 'Edit Supplier' : 'Add Supplier'}</h2>
        <p>Manage supplier profile and linked products.</p>
      </header>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Supplier ID
            <input
              value={form.id}
              disabled={isEdit}
              onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
            />
          </label>

          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>

          <label>
            Email
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>

          <label>
            Phone
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </label>
        </div>

        <label>
          Address
          <textarea
            rows={3}
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          />
        </label>

        <section className="panel-card">
          <h3>Link products</h3>
          <div className="checkbox-grid">
            {products.map((product) => (
              <label key={product.id} className="check-item">
                <input
                  type="checkbox"
                  checked={form.productIds.includes(product.id)}
                  onChange={() => toggleProduct(product.id)}
                />
                <span>
                  {product.id} - {product.name}
                </span>
              </label>
            ))}
          </div>
        </section>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="action-row">
          <button className="solid-btn" type="submit">
            {isEdit ? 'Save changes' : 'Create supplier'}
          </button>
          <button className="ghost-btn" type="button" onClick={() => navigate('/suppliers')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function ClientsListPage({
  clients,
  onDelete,
}: {
  clients: Client[]
  onDelete: (id: string) => Promise<void>
}) {
  const [search, setSearch] = useState('')

  const filtered = clients.filter((client) => {
    const term = search.toLowerCase()
    return (
      client.id.toLowerCase().includes(term) ||
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.phone.toLowerCase().includes(term)
    )
  })

  return (
    <div className="page-grid">
      <header className="section-header inline">
        <div>
          <h2>Clients</h2>
          <p>Manage client records and contact information.</p>
        </div>
        <Link to="/clients/new" className="solid-btn">
          <PackagePlus size={16} /> Add client
        </Link>
      </header>

      <section className="filters-grid single">
        <label>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search client by id, name, email, phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </section>

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.name}</td>
                <td>{client.email || '-'}</td>
                <td>{client.phone || '-'}</td>
                <td>{client.address || '-'}</td>
                <td className="actions-cell">
                  <Link to={`/clients/${client.id}/edit`}>Edit</Link>
                  <button onClick={() => void onDelete(client.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function ClientFormPage({
  clients,
  onSubmit,
}: {
  clients: Client[]
  onSubmit: (payload: Client) => Promise<void>
}) {
  const navigate = useNavigate()
  const { id } = useParams()
  const client = id ? clients.find((item) => item.id === id) : undefined

  const [form, setForm] = useState<Client>(
    client ?? {
      id: `C-${String(Math.floor(Math.random() * 900 + 100))}`,
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  )

  const [error, setError] = useState('')
  const isEdit = Boolean(client)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.id || !form.name) {
      setError('Client ID and name are required.')
      return
    }

    try {
      setError('')
      await onSubmit(form)
      navigate('/clients')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot save client.'
      setError(message)
    }
  }

  return (
    <div className="page-grid">
      <header className="section-header">
        <h2>{isEdit ? 'Edit Client' : 'Add Client'}</h2>
        <p>Keep client identity and contact details updated.</p>
      </header>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Client ID
            <input
              value={form.id}
              disabled={isEdit}
              onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
            />
          </label>

          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>

          <label>
            Email
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>

          <label>
            Phone
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </label>
        </div>

        <label>
          Address
          <textarea
            rows={3}
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="action-row">
          <button className="solid-btn" type="submit">
            {isEdit ? 'Save changes' : 'Create client'}
          </button>
          <button className="ghost-btn" type="button" onClick={() => navigate('/clients')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function OrdersListPage({
  orders,
  clients,
  onDelete,
}: {
  orders: Order[]
  clients: Client[]
  onDelete: (id: string) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const clientNameById = useMemo(() => {
    const map = new Map<string, string>()
    clients.forEach((client) => map.set(client.id, client.name))
    return map
  }, [clients])

  const filtered = orders.filter((order) => {
    const term = search.toLowerCase()
    return (
      order.id.toLowerCase().includes(term) ||
      order.clientId.toLowerCase().includes(term) ||
      (clientNameById.get(order.clientId) || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="page-grid">
      <header className="section-header inline">
        <div>
          <h2>Orders</h2>
          <p>Associate clients, add products and manage order lifecycle.</p>
        </div>
        <Link to="/orders/new" className="solid-btn">
          <PackagePlus size={16} /> Add order
        </Link>
      </header>

      <section className="filters-grid single">
        <label>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search order by id, client..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </section>

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Items</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{clientNameById.get(order.clientId) || order.clientId}</td>
                <td>{order.items.length}</td>
                <td>{order.status}</td>
                <td>{numberToCurrency(order.totalAmount)}</td>
                <td className="actions-cell">
                  <Link to={`/orders/${order.id}`}>Detail</Link>
                  <Link to={`/orders/${order.id}/edit`}>Edit</Link>
                  <button onClick={() => void onDelete(order.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function OrderFormPage({
  orders,
  clients,
  products,
  onSubmit,
}: {
  orders: Order[]
  clients: Client[]
  products: Product[]
  onSubmit: (payload: Omit<Order, 'totalAmount'>) => Promise<void>
}) {
  const navigate = useNavigate()
  const { id } = useParams()
  const order = id ? orders.find((item) => item.id === id) : undefined
  const isEdit = Boolean(order)

  const [form, setForm] = useState<Omit<Order, 'totalAmount'>>(
    order ?? {
      id: `CMD-${String(Math.floor(Math.random() * 900 + 100))}`,
      clientId: clients[0]?.id || '',
      items: products[0]
        ? [{ productId: products[0].id, quantity: 1, unitPrice: products[0].price }]
        : [],
      status: 'Draft',
      note: '',
    },
  )
  const [error, setError] = useState('')

  const addLine = () => {
    if (!products[0]) {
      return
    }
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: products[0].id, quantity: 1, unitPrice: products[0].price }],
    }))
  }

  const updateLine = (index: number, patch: Partial<OrderItem>) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    }))
  }

  const removeLine = (index: number) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== index) }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.id || !form.clientId || form.items.length === 0) {
      setError('Order id, client and at least one line are required.')
      return
    }
    if (form.items.some((item) => item.quantity <= 0)) {
      setError('Line quantities must be greater than zero.')
      return
    }

    try {
      setError('')
      await onSubmit(form)
      navigate('/orders')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot save order.'
      setError(message)
    }
  }

  return (
    <div className="page-grid">
      <header className="section-header">
        <h2>{isEdit ? 'Edit Order' : 'Add Order'}</h2>
        <p>Create order lines and assign client.</p>
      </header>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Order ID
            <input
              value={form.id}
              disabled={isEdit}
              onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
            />
          </label>
          <label>
            Client
            <select
              value={form.clientId}
              onChange={(event) => setForm((prev) => ({ ...prev, clientId: event.target.value }))}
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.id} - {client.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as Order['status'] }))
              }
            >
              <option value="Draft">Draft</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Delivered">Delivered</option>
            </select>
          </label>
        </div>

        <section className="table-card compact">
          <div className="section-header inline small">
            <h3>Order lines</h3>
            <button type="button" className="ghost-btn" onClick={addLine}>
              Add line
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((line, index) => (
                <tr key={`${line.productId}-${index}`}>
                  <td>
                    <select
                      value={line.productId}
                      onChange={(event) => {
                        const selected = products.find((p) => p.id === event.target.value)
                        updateLine(index, {
                          productId: event.target.value,
                          unitPrice: selected ? selected.price : line.unitPrice,
                        })
                      }}
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.id} - {product.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={line.unitPrice}
                      onChange={(event) => updateLine(index, { unitPrice: Number(event.target.value) })}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeLine(index)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <label>
          Note
          <textarea
            rows={3}
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="action-row">
          <button className="solid-btn" type="submit">
            {isEdit ? 'Save changes' : 'Create order'}
          </button>
          <button className="ghost-btn" type="button" onClick={() => navigate('/orders')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function OrderDetailPage({
  orders,
  clients,
  products,
  deliveries,
}: {
  orders: Order[]
  clients: Client[]
  products: Product[]
  deliveries: Delivery[]
}) {
  const { id } = useParams()
  const order = orders.find((item) => item.id === id)
  const clientNameById = useMemo(() => new Map(clients.map((c) => [c.id, c.name])), [clients])
  const productNameById = useMemo(() => new Map(products.map((p) => [p.id, p.name])), [products])
  const relatedDeliveries = deliveries.filter((delivery) => delivery.orderId === id)

  if (!order) {
    return (
      <div className="panel-card">
        <h3>Order not found</h3>
        <Link to="/orders">Back to orders</Link>
      </div>
    )
  }

  return (
    <div className="page-grid">
      <header className="section-header inline">
        <div>
          <h2>Order detail</h2>
          <p>{order.id}</p>
        </div>
        <Link className="solid-btn" to={`/orders/${order.id}/edit`}>
          Edit order
        </Link>
      </header>

      <article className="panel-card">
        <p>
          <strong>Client:</strong> {clientNameById.get(order.clientId) || order.clientId}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Total:</strong> {numberToCurrency(order.totalAmount)}
        </p>
      </article>

      <section className="table-card">
        <h3>Ordered items</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit price</th>
              <th>Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={`${item.productId}-${index}`}>
                <td>{productNameById.get(item.productId) || item.productId}</td>
                <td>{item.quantity}</td>
                <td>{numberToCurrency(item.unitPrice)}</td>
                <td>{numberToCurrency(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="table-card">
        <h3>Delivery history</h3>
        <table>
          <thead>
            <tr>
              <th>Delivery ID</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {relatedDeliveries.map((delivery) => (
              <tr key={delivery.id}>
                <td>{delivery.id}</td>
                <td>{delivery.status}</td>
                <td>{new Date(delivery.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function DeliveriesListPage({
  deliveries,
  orders,
}: {
  deliveries: Delivery[]
  orders: Order[]
}) {
  const [search, setSearch] = useState('')
  const orderIdSet = useMemo(() => new Set(orders.map((order) => order.id)), [orders])

  const filtered = deliveries.filter((delivery) => {
    const term = search.toLowerCase()
    return (
      delivery.id.toLowerCase().includes(term) ||
      delivery.orderId.toLowerCase().includes(term) ||
      delivery.status.toLowerCase().includes(term)
    )
  })

  return (
    <div className="page-grid">
      <header className="section-header inline">
        <div>
          <h2>Deliveries</h2>
          <p>Create delivery note and track delivery history.</p>
        </div>
        <Link to="/deliveries/new" className="solid-btn">
          <PackagePlus size={16} /> Create delivery note
        </Link>
      </header>

      <section className="filters-grid single">
        <label>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search delivery by id/order/status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </section>

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Order</th>
              <th>Status</th>
              <th>Items</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((delivery) => (
              <tr key={delivery.id}>
                <td>{delivery.id}</td>
                <td>{orderIdSet.has(delivery.orderId) ? delivery.orderId : `${delivery.orderId} (missing)`}</td>
                <td>{delivery.status}</td>
                <td>{delivery.items.length}</td>
                <td>{new Date(delivery.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function DeliveryFormPage({
  orders,
  products,
  onSubmit,
}: {
  orders: Order[]
  products: Product[]
  onSubmit: (payload: Omit<Delivery, 'createdAt'>) => Promise<void>
}) {
  const navigate = useNavigate()
  const [form, setForm] = useState<Omit<Delivery, 'createdAt'>>({
    id: `BL-${String(Math.floor(Math.random() * 900 + 100))}`,
    orderId: orders[0]?.id || '',
    items: [],
    status: 'InTransit',
    note: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const order = orders.find((item) => item.id === form.orderId)
    if (!order) {
      return
    }
    setForm((prev) => ({
      ...prev,
      items:
        prev.items.length > 0
          ? prev.items
          : order.items.map((item) => ({ productId: item.productId, quantityDelivered: 1 })),
    }))
  }, [form.orderId, orders])

  const updateItemQty = (productId: string, qty: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.productId === productId ? { ...item, quantityDelivered: qty } : item,
      ),
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.id || !form.orderId || form.items.length === 0) {
      setError('Delivery id, order and at least one line are required.')
      return
    }
    if (form.items.some((item) => item.quantityDelivered <= 0)) {
      setError('Delivered quantity must be greater than zero.')
      return
    }

    try {
      setError('')
      await onSubmit(form)
      navigate('/deliveries')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot create delivery.'
      setError(message)
    }
  }

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p.name])), [products])

  return (
    <div className="page-grid">
      <header className="section-header">
        <h2>Create delivery note</h2>
        <p>Create and register delivered quantities.</p>
      </header>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Delivery ID
            <input
              value={form.id}
              onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
            />
          </label>
          <label>
            Order
            <select
              value={form.orderId}
              onChange={(event) => setForm((prev) => ({ ...prev, orderId: event.target.value, items: [] }))}
            >
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id} - {order.status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as Delivery['status'] }))
              }
            >
              <option value="InTransit">InTransit</option>
              <option value="Delivered">Delivered</option>
            </select>
          </label>
        </div>

        <section className="table-card compact">
          <h3>Delivered quantities</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Delivered Qty</th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((item) => (
                <tr key={item.productId}>
                  <td>{productById.get(item.productId) || item.productId}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantityDelivered}
                      onChange={(event) => updateItemQty(item.productId, Number(event.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <label>
          Note
          <textarea
            rows={3}
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="action-row">
          <button className="solid-btn" type="submit">
            Create delivery
          </button>
          <button className="ghost-btn" type="button" onClick={() => navigate('/deliveries')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function InvoicesListPage({
  invoices,
  orders,
  clients,
  onGenerate,
  onExportXml,
}: {
  invoices: Invoice[]
  orders: Order[]
  clients: Client[]
  onGenerate: (payload: { id: string; orderId: string; note: string }) => Promise<void>
  onExportXml: (invoiceId: string) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [newInvoiceId, setNewInvoiceId] = useState(`FAC-${String(Math.floor(Math.random() * 900 + 100))}`)
  const [orderId, setOrderId] = useState(orders[0]?.id || '')
  const [note, setNote] = useState('')

  const orderMap = useMemo(() => new Map(orders.map((order) => [order.id, order])), [orders])
  const clientMap = useMemo(() => new Map(clients.map((client) => [client.id, client.name])), [clients])

  const filtered = invoices.filter((invoice) => {
    const term = search.toLowerCase()
    return (
      invoice.id.toLowerCase().includes(term) ||
      invoice.orderId.toLowerCase().includes(term) ||
      invoice.clientId.toLowerCase().includes(term) ||
      invoice.status.toLowerCase().includes(term)
    )
  })

  const handleGenerate = async () => {
    await onGenerate({ id: newInvoiceId, orderId, note })
    setNewInvoiceId(`FAC-${String(Math.floor(Math.random() * 900 + 100))}`)
    setNote('')
  }

  return (
    <div className="page-grid">
      <header className="section-header">
        <h2>Invoices</h2>
        <p>Generate invoices from orders, export XML and print.</p>
      </header>

      <section className="form-card">
        <div className="form-grid">
          <label>
            Invoice ID
            <input value={newInvoiceId} onChange={(event) => setNewInvoiceId(event.target.value)} />
          </label>
          <label>
            Order
            <select value={orderId} onChange={(event) => setOrderId(event.target.value)}>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id} - {clientMap.get(order.clientId) || order.clientId}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Note
          <input value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <div className="action-row">
          <button className="solid-btn" type="button" onClick={() => void handleGenerate()}>
            Generate invoice
          </button>
        </div>
      </section>

      <section className="filters-grid single">
        <label>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search invoice by id/order/client/status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </section>

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Order</th>
              <th>Client</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.orderId}</td>
                <td>{clientMap.get(invoice.clientId) || invoice.clientId}</td>
                <td>{numberToCurrency(invoice.totalAmount)}</td>
                <td>{numberToCurrency(invoice.paidAmount)}</td>
                <td>{invoice.status}</td>
                <td className="actions-cell">
                  <button type="button" onClick={() => void onExportXml(invoice.id)}>
                    XML
                  </button>
                  <button type="button" onClick={() => window.print()}>
                    Print/PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function PaymentsPage({
  payments,
  invoices,
  onAdd,
}: {
  payments: Payment[]
  invoices: Invoice[]
  onAdd: (payload: { id: string; invoiceId: string; amount: number; method: string; note: string }) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [id, setId] = useState(`PAY-${String(Math.floor(Math.random() * 900 + 100))}`)
  const [invoiceId, setInvoiceId] = useState(invoices[0]?.id || '')
  const [amount, setAmount] = useState(0)
  const [method, setMethod] = useState('cash')
  const [note, setNote] = useState('')

  const filtered = payments.filter((payment) => {
    const term = search.toLowerCase()
    return (
      payment.id.toLowerCase().includes(term) ||
      payment.invoiceId.toLowerCase().includes(term) ||
      payment.method.toLowerCase().includes(term)
    )
  })

  const handleAdd = async () => {
    await onAdd({ id, invoiceId, amount, method, note })
    setId(`PAY-${String(Math.floor(Math.random() * 900 + 100))}`)
    setAmount(0)
    setNote('')
  }

  return (
    <div className="page-grid">
      <header className="section-header">
        <h2>Payments</h2>
        <p>Register payment methods, link to invoices and keep history.</p>
      </header>

      <section className="form-card">
        <div className="form-grid">
          <label>
            Payment ID
            <input value={id} onChange={(event) => setId(event.target.value)} />
          </label>
          <label>
            Invoice
            <select value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)}>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.id} - {invoice.status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Amount
            <input type="number" min="0" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
          </label>
          <label>
            Method
            <select value={method} onChange={(event) => setMethod(event.target.value)}>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="transfer">Transfer</option>
            </select>
          </label>
        </div>
        <label>
          Note
          <input value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <div className="action-row">
          <button className="solid-btn" type="button" onClick={() => void handleAdd()}>
            Add payment
          </button>
        </div>
      </section>

      <section className="filters-grid single">
        <label>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search payment by id/invoice/method..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </section>

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Invoice</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>{payment.invoiceId}</td>
                <td>{numberToCurrency(payment.amount)}</td>
                <td>{payment.method}</td>
                <td>{new Date(payment.paidAt).toLocaleString()}</td>
                <td>{payment.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function StatisticsPage({
  statistics,
}: {
  statistics: StatisticsData
}) {
  const maxPopular = Math.max(1, ...statistics.popularProducts.map((item) => item.soldQty))

  return (
    <div className="page-grid">
      <header className="section-header">
        <h2>Statistics</h2>
        <p>Sales, stock and product popularity analytics.</p>
      </header>

      <section className="kpi-grid">
        <article className="kpi-card">
          <span>Total sales</span>
          <strong>{numberToCurrency(statistics.totalSales)}</strong>
        </article>
        <article className="kpi-card">
          <span>Total stock</span>
          <strong>{statistics.totalStock}</strong>
        </article>
        <article className="kpi-card">
          <span>Total orders</span>
          <strong>{statistics.totalOrders}</strong>
        </article>
      </section>

      <section className="table-card">
        <h3>Popular products</h3>
        <div className="bar-chart" role="img" aria-label="Popular products chart">
          {statistics.popularProducts.map((item) => (
            <div key={item.productId} className="bar-col">
              <div className="bar" style={{ height: `${Math.max(8, (item.soldQty / maxPopular) * 100)}%` }} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SettingsPage({
  profile,
  onSaveProfile,
  onChangePassword,
}: {
  profile: { name: string; email: string }
  onSaveProfile: (payload: { name: string; email: string }) => Promise<void>
  onChangePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>
}) {
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    setName(profile.name)
    setEmail(profile.email)
  }, [profile])

  return (
    <div className="page-grid">
      <header className="section-header">
        <h2>Settings</h2>
        <p>Update profile information and change password.</p>
      </header>

      <section className="form-card">
        <h3>Profile</h3>
        <div className="form-grid">
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
        </div>
        <div className="action-row">
          <button className="solid-btn" type="button" onClick={() => void onSaveProfile({ name, email })}>
            Save profile
          </button>
        </div>
      </section>

      <section className="form-card">
        <h3>Password</h3>
        <div className="form-grid">
          <label>
            Current password
            <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          </label>
          <label>
            New password
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          </label>
        </div>
        <div className="action-row">
          <button
            className="solid-btn"
            type="button"
            onClick={async () => {
              await onChangePassword({ currentPassword, newPassword })
              setCurrentPassword('')
              setNewPassword('')
            }}
          >
            Change password
          </button>
        </div>
      </section>
    </div>
  )
}

function StockPage({
  products,
  movements,
  onMovement,
}: {
  products: Product[]
  movements: StockMovement[]
  onMovement: (payload: {
    productId: string
    type: 'IN' | 'OUT'
    quantity: number
    note: string
  }) => Promise<void>
}) {
  const navigate = useNavigate()
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!productId && products[0]) {
      setProductId(products[0].id)
    }
  }, [productId, products])

  const createMovement = async (type: 'IN' | 'OUT') => {
    if (!productId || quantity <= 0) {
      setError('Select product and quantity.')
      return
    }

    try {
      await onMovement({ productId, type, quantity, note })
      setNote('')
      setError('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot create stock movement.'
      setError(message)
    }
  }

  const lowStock = products.filter((product) => product.quantity < 8)

  return (
    <div className="page-grid">
      <header className="section-header inline">
        <div>
          <h2>Stock management</h2>
          <p>Real-time stock entries, exits and monitoring.</p>
        </div>
        <button className="ghost-btn" onClick={() => navigate('/stock/history')}>
          View history
        </button>
      </header>

      <section className="split-grid">
        <article className="form-card">
          <h3>Stock operations</h3>
          <label>
            Product
            <select value={productId} onChange={(event) => setProductId(event.target.value)}>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.id} - {product.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Quantity
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </label>

          <label>
            Note
            <input value={note} onChange={(event) => setNote(event.target.value)} />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="action-row">
            <button className="solid-btn" onClick={() => void createMovement('IN')}>
              <ArrowUpCircle size={16} /> Entry
            </button>
            <button className="warn-btn" onClick={() => void createMovement('OUT')}>
              <ArrowDownCircle size={16} /> Exit
            </button>
          </div>
        </article>

        <article className="panel-card">
          <h3>Low stock alerts</h3>
          <ul className="clean-list">
            {lowStock.length === 0 ? (
              <li>
                <div>
                  <strong>Great</strong>
                  <small>No critical products for now.</small>
                </div>
              </li>
            ) : (
              lowStock.map((product) => (
                <li key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <small>{product.id}</small>
                  </div>
                  <div className="align-right">
                    <AlertTriangle size={14} />
                    <small>{product.quantity} left</small>
                  </div>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>

      <section className="table-card">
        <h3>Live stock status</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.quantity}</td>
                <td>{new Date(product.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel-card">
        <h3>Recent movement snapshot</h3>
        <ul className="clean-list">
          {movements.slice(0, 6).map((movement) => (
            <li key={movement.id}>
              <div>
                <strong>{movement.productId}</strong>
                <small>{movement.note || 'No note'}</small>
              </div>
              <div className="align-right">
                <span>{movement.type}</span>
                <small>
                  {movement.quantity} | {new Date(movement.createdAt).toLocaleDateString()}
                </small>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function StockHistoryPage({
  movements,
}: {
  movements: StockMovement[]
}) {
  return (
    <div className="page-grid">
      <header className="section-header">
        <h2>Stock history</h2>
        <p>Full traceability for every stock movement.</p>
      </header>

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id}>
                <td>{new Date(movement.createdAt).toLocaleString()}</td>
                <td>{movement.productId}</td>
                <td>{movement.type}</td>
                <td>{movement.quantity}</td>
                <td>{movement.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function ProtectedRoute({
  authenticated,
  children,
}: {
  authenticated: boolean
  children: ReactNode
}) {
  if (!authenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  const [token, setToken] = useState<string | null>(appToken())
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [statistics, setStatistics] = useState<StatisticsData>({
    totalSales: 0,
    totalStock: 0,
    totalOrders: 0,
    totalProducts: 0,
    popularProducts: [],
    salesByStatus: [],
  })
  const [profile, setProfile] = useState<{ name: string; email: string }>({ name: '', email: '' })
  const [dashboardOrders, setDashboardOrders] = useState<DashboardOrder[]>(INITIAL_ORDERS)
  const [monthlyFlows, setMonthlyFlows] = useState<Array<{ month: string; value: number }>>(
    INITIAL_MONTHLY_FLOWS,
  )
  const [toast, setToast] = useState<ToastData | null>(null)

  const authenticated = Boolean(token)

  useEffect(() => {
    if (!toast) {
      return
    }

    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const showSuccess = (message: string) => {
    setToast({ type: 'success', message })
  }

  const showError = (message: string) => {
    setToast({ type: 'error', message })
  }

  const mapMovement = (movement: {
    _id?: string
    id?: string
    productId: string
    type: 'IN' | 'OUT'
    quantity: number
    note: string
    createdAt: string
  }): StockMovement => ({
    id: movement._id || movement.id || `M-${Date.now()}`,
    productId: movement.productId,
    type: movement.type,
    quantity: movement.quantity,
    note: movement.note,
    createdAt: movement.createdAt,
  })

  const loadData = async (authToken: string) => {
    const [
      productsData,
      movementsData,
      dashboardData,
      suppliersData,
      clientsData,
      ordersData,
      deliveriesData,
      invoicesData,
      paymentsData,
      statisticsData,
      profileData,
    ] =
      await Promise.all([
        api.getProducts(authToken),
        api.getMovements(authToken, 100),
        api.getDashboard(authToken),
        api.getSuppliers(authToken),
        api.getClients(authToken),
        api.getOrders(authToken),
        api.getDeliveries(authToken),
        api.getInvoices(authToken),
        api.getPayments(authToken),
        api.getStatistics(authToken),
        api.getProfile(authToken),
      ])

    setProducts(
      productsData.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        category: product.category,
        qrCode: product.qrCode,
        updatedAt: product.updatedAt,
      })),
    )
    setMovements(movementsData.map(mapMovement))
    setDashboardOrders(dashboardData.recentOrders)
    setMonthlyFlows(dashboardData.monthlyFlows)
    setSuppliers(
      suppliersData.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        productIds: Array.isArray(supplier.productIds) ? supplier.productIds : [],
      })),
    )
    setClients(
      clientsData.map((client) => ({
        id: client.id,
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
      })),
    )
    setOrders(
      ordersData.map((order) => ({
        id: order.id,
        clientId: order.clientId,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        status: order.status,
        note: order.note || '',
        totalAmount: order.totalAmount,
      })),
    )
    setDeliveries(
      deliveriesData.map((delivery) => ({
        id: delivery.id,
        orderId: delivery.orderId,
        items: delivery.items.map((item) => ({
          productId: item.productId,
          quantityDelivered: item.quantityDelivered,
        })),
        status: delivery.status,
        note: delivery.note || '',
        createdAt: delivery.createdAt,
      })),
    )
    setInvoices(
      invoicesData.map((invoice) => ({
        id: invoice.id,
        orderId: invoice.orderId,
        clientId: invoice.clientId,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        status: invoice.status,
        note: invoice.note || '',
      })),
    )
    setPayments(
      paymentsData.map((payment) => ({
        id: payment.id,
        invoiceId: payment.invoiceId,
        amount: payment.amount,
        method: payment.method,
        note: payment.note || '',
        paidAt: payment.paidAt,
      })),
    )
    setStatistics(statisticsData)
    setProfile(profileData)
  }

  useEffect(() => {
    if (!token) {
      return
    }

    loadData(token).catch((err) => {
      const message = err instanceof Error ? err.message : 'Cannot load data from API.'
      showError(message)
    })
  }, [token])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password)
      localStorage.setItem('auth_token', response.token)
      setToken(response.token)
      showSuccess('Login successful.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.'
      showError(message)
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
    setProducts([])
    setMovements([])
    setSuppliers([])
    setClients([])
    setOrders([])
    setDeliveries([])
    setInvoices([])
    setPayments([])
    setDashboardOrders([])
    setMonthlyFlows([])
    setStatistics({
      totalSales: 0,
      totalStock: 0,
      totalOrders: 0,
      totalProducts: 0,
      popularProducts: [],
      salesByStatus: [],
    })
    setProfile({ name: '', email: '' })
    showSuccess('Session closed.')
  }

  const upsertProduct = async (payload: Omit<Product, 'updatedAt'>) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    const exists = products.some((item) => item.id === payload.id)

    try {
      if (exists) {
        await api.updateProduct(token, payload.id, {
          name: payload.name,
          description: payload.description,
          price: payload.price,
          quantity: payload.quantity,
          category: payload.category,
          qrCode: payload.qrCode,
        })
      } else {
        await api.createProduct(token, payload)
      }
      await loadData(token)
      showSuccess(exists ? 'Product updated successfully.' : 'Product added successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot save product.'
      showError(message)
      throw err
    }
  }

  const deleteProduct = async (id: string) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    try {
      await api.deleteProduct(token, id)
      await loadData(token)
      showSuccess('Product deleted successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot delete product.'
      showError(message)
      throw err
    }
  }

  const upsertSupplier = async (payload: Supplier) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    const exists = suppliers.some((item) => item.id === payload.id)

    try {
      if (exists) {
        await api.updateSupplier(token, payload.id, {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
          productIds: payload.productIds,
        })
      } else {
        await api.createSupplier(token, payload)
      }
      await loadData(token)
      showSuccess(exists ? 'Supplier updated successfully.' : 'Supplier added successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot save supplier.'
      showError(message)
      throw err
    }
  }

  const deleteSupplier = async (id: string) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    try {
      await api.deleteSupplier(token, id)
      await loadData(token)
      showSuccess('Supplier deleted successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot delete supplier.'
      showError(message)
      throw err
    }
  }

  const upsertClient = async (payload: Client) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    const exists = clients.some((item) => item.id === payload.id)

    try {
      if (exists) {
        await api.updateClient(token, payload.id, {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
        })
      } else {
        await api.createClient(token, payload)
      }
      await loadData(token)
      showSuccess(exists ? 'Client updated successfully.' : 'Client added successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot save client.'
      showError(message)
      throw err
    }
  }

  const deleteClient = async (id: string) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    try {
      await api.deleteClient(token, id)
      await loadData(token)
      showSuccess('Client deleted successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot delete client.'
      showError(message)
      throw err
    }
  }

  const addMovement = async (payload: {
    productId: string
    type: 'IN' | 'OUT'
    quantity: number
    note: string
  }) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    try {
      await api.createMovement(token, payload)
      await loadData(token)
      showSuccess(payload.type === 'IN' ? 'Stock entry saved.' : 'Stock exit saved.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot create stock movement.'
      showError(message)
      throw err
    }
  }

  const upsertOrder = async (payload: Omit<Order, 'totalAmount'>) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    const exists = orders.some((item) => item.id === payload.id)

    try {
      if (exists) {
        await api.updateOrder(token, payload.id, payload)
      } else {
        await api.createOrder(token, payload)
      }

      await loadData(token)
      showSuccess(exists ? 'Order updated successfully.' : 'Order added successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot save order.'
      showError(message)
      throw err
    }
  }

  const deleteOrder = async (id: string) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    try {
      await api.deleteOrder(token, id)
      await loadData(token)
      showSuccess('Order deleted successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot delete order.'
      showError(message)
      throw err
    }
  }

  const addDelivery = async (payload: Omit<Delivery, 'createdAt'>) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    try {
      await api.createDelivery(token, payload)
      await loadData(token)
      showSuccess('Delivery created successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot create delivery.'
      showError(message)
      throw err
    }
  }

  const generateInvoice = async (payload: { id: string; orderId: string; note: string }) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    try {
      await api.generateInvoice(token, payload)
      await loadData(token)
      showSuccess('Invoice generated successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot generate invoice.'
      showError(message)
      throw err
    }
  }

  const exportInvoiceXml = async (invoiceId: string) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    try {
      const xml = await api.exportInvoiceXml(token, invoiceId)
      const blob = new Blob([xml], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${invoiceId}.xml`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      showSuccess('Invoice XML exported.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot export XML.'
      showError(message)
      throw err
    }
  }

  const addPayment = async (payload: {
    id: string
    invoiceId: string
    amount: number
    method: string
    note: string
  }) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    try {
      await api.createPayment(token, payload)
      await loadData(token)
      showSuccess('Payment added successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot add payment.'
      showError(message)
      throw err
    }
  }

  const saveProfile = async (payload: { name: string; email: string }) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    try {
      await api.updateProfile(token, payload)
      await loadData(token)
      showSuccess('Profile updated successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot update profile.'
      showError(message)
      throw err
    }
  }

  const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
    if (!token) {
      throw new Error('Unauthorized')
    }

    try {
      await api.updatePassword(token, payload)
      showSuccess('Password changed successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cannot change password.'
      showError(message)
      throw err
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicHome authenticated={authenticated} />} />
        <Route
          path="/login"
          element={
            authenticated ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={login} />
          }
        />

        <Route
          element={
            <ProtectedRoute authenticated={authenticated}>
              <AppLayout onLogout={logout} />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                products={products}
                movements={movements}
                orders={dashboardOrders}
                monthlyFlows={monthlyFlows}
              />
            }
          />
          <Route path="/products" element={<ProductsListPage products={products} onDelete={deleteProduct} />} />
          <Route path="/products/new" element={<ProductFormPage products={products} onSubmit={upsertProduct} />} />
          <Route
            path="/products/:id/edit"
            element={<ProductFormPage products={products} onSubmit={upsertProduct} />}
          />
          <Route path="/products/:id" element={<ProductDetailPage products={products} />} />

          <Route
            path="/suppliers"
            element={<SuppliersListPage suppliers={suppliers} products={products} onDelete={deleteSupplier} />}
          />
          <Route
            path="/suppliers/new"
            element={<SupplierFormPage suppliers={suppliers} products={products} onSubmit={upsertSupplier} />}
          />
          <Route
            path="/suppliers/:id/edit"
            element={<SupplierFormPage suppliers={suppliers} products={products} onSubmit={upsertSupplier} />}
          />

          <Route path="/clients" element={<ClientsListPage clients={clients} onDelete={deleteClient} />} />
          <Route path="/clients/new" element={<ClientFormPage clients={clients} onSubmit={upsertClient} />} />
          <Route path="/clients/:id/edit" element={<ClientFormPage clients={clients} onSubmit={upsertClient} />} />

          <Route
            path="/orders"
            element={<OrdersListPage orders={orders} clients={clients} onDelete={deleteOrder} />}
          />
          <Route
            path="/orders/new"
            element={<OrderFormPage orders={orders} clients={clients} products={products} onSubmit={upsertOrder} />}
          />
          <Route
            path="/orders/:id/edit"
            element={<OrderFormPage orders={orders} clients={clients} products={products} onSubmit={upsertOrder} />}
          />
          <Route
            path="/orders/:id"
            element={<OrderDetailPage orders={orders} clients={clients} products={products} deliveries={deliveries} />}
          />

          <Route path="/deliveries" element={<DeliveriesListPage deliveries={deliveries} orders={orders} />} />
          <Route
            path="/deliveries/new"
            element={<DeliveryFormPage orders={orders} products={products} onSubmit={addDelivery} />}
          />

          <Route
            path="/invoices"
            element={
              <InvoicesListPage
                invoices={invoices}
                orders={orders}
                clients={clients}
                onGenerate={generateInvoice}
                onExportXml={exportInvoiceXml}
              />
            }
          />

          <Route
            path="/payments"
            element={<PaymentsPage payments={payments} invoices={invoices} onAdd={addPayment} />}
          />

          <Route path="/statistics" element={<StatisticsPage statistics={statistics} />} />

          <Route
            path="/settings"
            element={<SettingsPage profile={profile} onSaveProfile={saveProfile} onChangePassword={changePassword} />}
          />

          <Route
            path="/stock"
            element={<StockPage products={products} movements={movements} onMovement={addMovement} />}
          />
          <Route path="/stock/history" element={<StockHistoryPage movements={movements} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {toast ? (
        <div className={`toast ${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      ) : null}
    </BrowserRouter>
  )
}

export default App
