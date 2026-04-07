const express = require('express');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const router = express.Router();

const DEMO_ORDERS = [
  { id: 'CMD-410', client: 'Blue Coast SARL', total: 850, status: 'Delivered' },
  { id: 'CMD-411', client: 'Ocean Nord', total: 540, status: 'Pending' },
  { id: 'CMD-412', client: 'Marina Atlas', total: 290, status: 'Delivered' },
];

function getLastSixMonths() {
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: date.toLocaleString('en', { month: 'short' }),
    });
  }

  return months;
}

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    const totalProducts = products.length;
    const stockAvailable = products.reduce((sum, product) => sum + product.quantity, 0);
    const lowStockCount = products.filter((product) => product.quantity < 8).length;

    const latestMovements = await StockMovement.find().sort({ createdAt: -1 }).limit(5);

    const lastSixMonths = getLastSixMonths();
    const firstMonth = lastSixMonths[0];
    const fromDate = new Date(firstMonth.year, firstMonth.month - 1, 1);

    const flowAggregation = await StockMovement.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalQty: { $sum: '$quantity' },
        },
      },
    ]);

    const flowMap = new Map(
      flowAggregation.map((item) => [
        `${item._id.year}-${item._id.month}`,
        Number(item.totalQty || 0),
      ]),
    );

    const monthlyFlows = lastSixMonths.map((item) => ({
      month: item.label,
      value: flowMap.get(`${item.year}-${item.month}`) || 0,
    }));

    return res.json({
      totalProducts,
      stockAvailable,
      lowStockCount,
      recentOrders: DEMO_ORDERS,
      monthlyFlows,
      latestMovements,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch dashboard data.' });
  }
});

module.exports = router;
