const express = require('express');
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const router = express.Router();

function aggregateDelivered(orderId, deliveries) {
  const deliveredByProduct = new Map();
  deliveries.forEach((delivery) => {
    delivery.items.forEach((item) => {
      deliveredByProduct.set(
        item.productId,
        (deliveredByProduct.get(item.productId) || 0) + item.quantityDelivered,
      );
    });
  });
  return deliveredByProduct;
}

router.get('/', async (req, res) => {
  try {
    const search = String(req.query.search || '').trim();
    const query = search
      ? {
          $or: [
            { id: { $regex: search, $options: 'i' } },
            { orderId: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const deliveries = await Delivery.find(query).sort({ createdAt: -1 });
    return res.json(deliveries);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch deliveries.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ id: req.params.id });
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found.' });
    }

    const order = await Order.findOne({ id: delivery.orderId });
    return res.json({ delivery, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch delivery detail.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, orderId, items, status = 'InTransit', note = '' } = req.body;

    if (!id || !orderId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'ID, orderId and items are required.' });
    }

    const exists = await Delivery.findOne({ id: id.trim() });
    if (exists) {
      return res.status(409).json({ message: 'Delivery ID already exists.' });
    }

    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const previousDeliveries = await Delivery.find({ orderId: order.id });
    const deliveredByProduct = aggregateDelivered(order.id, previousDeliveries);

    const orderQuantityByProduct = new Map();
    order.items.forEach((item) => {
      orderQuantityByProduct.set(item.productId, item.quantity);
    });

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'Some delivery products are invalid.' });
    }

    const productById = new Map(products.map((product) => [product.id, product]));

    const normalizedItems = items.map((item) => ({
      productId: item.productId,
      quantityDelivered: Number(item.quantityDelivered),
    }));

    for (const item of normalizedItems) {
      if (!Number.isFinite(item.quantityDelivered) || item.quantityDelivered <= 0) {
        return res.status(400).json({ message: 'Delivered quantity must be greater than zero.' });
      }

      const orderedQty = orderQuantityByProduct.get(item.productId);
      if (!orderedQty) {
        return res.status(400).json({ message: `Product ${item.productId} is not in the order.` });
      }

      const alreadyDelivered = deliveredByProduct.get(item.productId) || 0;
      if (alreadyDelivered + item.quantityDelivered > orderedQty) {
        return res.status(400).json({ message: `Delivered quantity exceeds ordered for ${item.productId}.` });
      }

      const product = productById.get(item.productId);
      if (!product || product.quantity < item.quantityDelivered) {
        return res.status(400).json({ message: `Insufficient stock for ${item.productId}.` });
      }
    }

    for (const item of normalizedItems) {
      const product = productById.get(item.productId);
      product.quantity -= item.quantityDelivered;
      await product.save();

      await StockMovement.create({
        productId: item.productId,
        type: 'OUT',
        quantity: item.quantityDelivered,
        note: `Delivery ${id.trim()} - Order ${order.id}`,
      });
    }

    const delivery = await Delivery.create({
      id: id.trim(),
      orderId,
      items: normalizedItems,
      status,
      note,
    });

    const updatedDeliveries = await Delivery.find({ orderId: order.id });
    const totalDeliveredByProduct = aggregateDelivered(order.id, updatedDeliveries);

    const allDelivered = order.items.every((orderItem) => {
      const delivered = totalDeliveredByProduct.get(orderItem.productId) || 0;
      return delivered >= orderItem.quantity;
    });

    order.status = allDelivered ? 'Delivered' : 'Confirmed';
    await order.save();

    return res.status(201).json({ delivery, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot create delivery.' });
  }
});

module.exports = router;
