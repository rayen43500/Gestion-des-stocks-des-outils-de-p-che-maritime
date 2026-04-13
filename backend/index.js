require('dotenv').config();
const cors = require('cors');
const express = require('express');
const connectDatabase = require('./src/config/db');
const authMiddleware = require('./src/middleware/auth');
const seedData = require('./src/utils/seed');

const authRoutes = require('./src/routes/auth.routes');
const clientsRoutes = require('./src/routes/clients.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const deliveriesRoutes = require('./src/routes/deliveries.routes');
const invoicesRoutes = require('./src/routes/invoices.routes');
const ordersRoutes = require('./src/routes/orders.routes');
const paymentsRoutes = require('./src/routes/payments.routes');
const productRoutes = require('./src/routes/products.routes');
const settingsRoutes = require('./src/routes/settings.routes');
const statisticsRoutes = require('./src/routes/statistics.routes');
const suppliersRoutes = require('./src/routes/suppliers.routes');
const stockRoutes = require('./src/routes/stock.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  }),
);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/suppliers', authMiddleware, suppliersRoutes);
app.use('/api/clients', authMiddleware, clientsRoutes);
app.use('/api/orders', authMiddleware, ordersRoutes);
app.use('/api/deliveries', authMiddleware, deliveriesRoutes);
app.use('/api/invoices', authMiddleware, invoicesRoutes);
app.use('/api/payments', authMiddleware, paymentsRoutes);
app.use('/api/statistics', authMiddleware, statisticsRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/stock', authMiddleware, stockRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

async function start() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing in environment variables.');
    }

    await connectDatabase();
    await seedData();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

start();