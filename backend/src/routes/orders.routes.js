const express = require('express');
const Client = require('../models/Client');
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

function computeTotal(items) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

router.get('/', async (req, res) => {
  try {
    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || '').trim();

    const query = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            $or: [
              { id: { $regex: search, $options: 'i' } },
              { clientId: { $regex: search, $options: 'i' } },
            ],
          }
        : {}),
    };

    const orders = await Order.find(query).sort({ updatedAt: -1 });
    return res.json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch orders.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const deliveries = await Delivery.find({ orderId: order.id }).sort({ createdAt: -1 });
    return res.json({ order, deliveries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch order detail.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, clientId, items, status = 'Draft', note = '' } = req.body;

    if (!id || !clientId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'ID, clientId and items are required.' });
    }

    const existing = await Order.findOne({ id: id.trim() });
    if (existing) {
      return res.status(409).json({ message: 'Order ID already exists.' });
    }

    const client = await Client.findOne({ id: clientId });
    if (!client) {
      return res.status(400).json({ message: 'Client does not exist.' });
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'Some order products are invalid.' });
    }

    const productById = new Map(products.map((product) => [product.id, product]));
    const normalizedItems = items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice) || Number(productById.get(item.productId).price),
    }));

    if (normalizedItems.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      return res.status(400).json({ message: 'Each ordered quantity must be greater than zero.' });
    }

    const totalAmount = computeTotal(normalizedItems);

    const order = await Order.create({
      id: id.trim(),
      clientId,
      items: normalizedItems,
      status,
      note,
      totalAmount,
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot create order.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { clientId, items, status, note } = req.body;

    const order = await Order.findOne({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (clientId !== undefined) {
      const client = await Client.findOne({ id: clientId });
      if (!client) {
        return res.status(400).json({ message: 'Client does not exist.' });
      }
      order.clientId = clientId;
    }

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items must contain at least one line.' });
      }

      const productIds = items.map((item) => item.productId);
      const products = await Product.find({ id: { $in: productIds } });
      if (products.length !== productIds.length) {
        return res.status(400).json({ message: 'Some order products are invalid.' });
      }

      const productById = new Map(products.map((product) => [product.id, product]));
      const normalizedItems = items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice) || Number(productById.get(item.productId).price),
      }));

      if (normalizedItems.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
        return res.status(400).json({ message: 'Each ordered quantity must be greater than zero.' });
      }

      order.items = normalizedItems;
      order.totalAmount = computeTotal(normalizedItems);
    }

    if (status !== undefined) {
      order.status = status;
    }

    if (note !== undefined) {
      order.note = note;
    }

    await order.save();
    return res.json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot update order.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const deliveries = await Delivery.countDocuments({ orderId: order.id });
    if (deliveries > 0) {
      return res.status(400).json({ message: 'Cannot delete order with deliveries.' });
    }

    await Order.deleteOne({ id: req.params.id });
    return res.json({ message: 'Order deleted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot delete order.' });
  }
});

module.exports = router;
