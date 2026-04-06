const express = require('express');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const router = express.Router();

router.get('/movements', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 100);
    const movements = await StockMovement.find().sort({ createdAt: -1 }).limit(limit);
    return res.json(movements);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch stock movements.' });
  }
});

router.post('/movements', async (req, res) => {
  try {
    const { productId, type, quantity, note = '' } = req.body;

    if (!productId || !type || !quantity) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    if (!['IN', 'OUT'].includes(type)) {
      return res.status(400).json({ message: 'Invalid movement type.' });
    }

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    if (type === 'OUT' && product.quantity < qty) {
      return res.status(400).json({ message: 'Insufficient stock for OUT movement.' });
    }

    product.quantity = type === 'IN' ? product.quantity + qty : product.quantity - qty;
    await product.save();

    const movement = await StockMovement.create({ productId, type, quantity: qty, note });

    return res.status(201).json({ movement, product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot create movement.' });
  }
});

module.exports = router;
