const express = require('express');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const router = express.Router();

const DEMO_ORDERS = [
  { id: 'CMD-410', client: 'Blue Coast SARL', total: 850, status: 'Delivered' },
  { id: 'CMD-411', client: 'Ocean Nord', total: 540, status: 'Pending' },
  { id: 'CMD-412', client: 'Marina Atlas', total: 290, status: 'Delivered' },
];

const MONTHLY_FLOWS = [
  { month: 'Jan', value: 42 },
  { month: 'Feb', value: 50 },
  { month: 'Mar', value: 38 },
  { month: 'Apr', value: 61 },
  { month: 'May', value: 56 },
  { month: 'Jun', value: 67 },
];

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    const totalProducts = products.length;
    const stockAvailable = products.reduce((sum, product) => sum + product.quantity, 0);
    const lowStockCount = products.filter((product) => product.quantity < 8).length;

    const latestMovements = await StockMovement.find().sort({ createdAt: -1 }).limit(5);

    return res.json({
      totalProducts,
      stockAvailable,
      lowStockCount,
      recentOrders: DEMO_ORDERS,
      monthlyFlows: MONTHLY_FLOWS,
      latestMovements,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch dashboard data.' });
  }
});

module.exports = router;
