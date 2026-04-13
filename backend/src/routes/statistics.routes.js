const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    const products = await Product.find();

    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);

    const popularityMap = new Map();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        popularityMap.set(item.productId, (popularityMap.get(item.productId) || 0) + item.quantity);
      });
    });

    const productNameById = new Map(products.map((product) => [product.id, product.name]));
    const popularProducts = Array.from(popularityMap.entries())
      .map(([productId, soldQty]) => ({
        productId,
        name: productNameById.get(productId) || productId,
        soldQty,
      }))
      .sort((a, b) => b.soldQty - a.soldQty)
      .slice(0, 6);

    const salesByStatus = [
      { key: 'Draft', value: orders.filter((order) => order.status === 'Draft').length },
      { key: 'Confirmed', value: orders.filter((order) => order.status === 'Confirmed').length },
      { key: 'Delivered', value: orders.filter((order) => order.status === 'Delivered').length },
    ];

    return res.json({
      totalSales,
      totalStock,
      totalOrders: orders.length,
      totalProducts: products.length,
      popularProducts,
      salesByStatus,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch statistics.' });
  }
});

module.exports = router;
