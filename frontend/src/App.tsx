import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Boxes,
  Building2,
  Fish,
  LayoutDashboard,
  LogIn,
  LogOut,
  PackagePlus,
  QrCode,
  Search,
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
  const [orders, setOrders] = useState<DashboardOrder[]>(INITIAL_ORDERS)
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
    const [productsData, movementsData, dashboardData, suppliersData, clientsData] =
      await Promise.all([
        api.getProducts(authToken),
        api.getMovements(authToken, 100),
        api.getDashboard(authToken),
        api.getSuppliers(authToken),
        api.getClients(authToken),
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
    setOrders(dashboardData.recentOrders)
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
    setMonthlyFlows([])
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
                orders={orders}
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
