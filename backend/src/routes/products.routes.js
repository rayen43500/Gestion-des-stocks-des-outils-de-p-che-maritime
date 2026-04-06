const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search = '', category = 'all', qr = '' } = req.query;

    const query = {
      $and: [
        category !== 'all' ? { category } : {},
        qr ? { qrCode: { $regex: String(qr), $options: 'i' } } : {},
        search
          ? {
              $or: [
                { id: { $regex: String(search), $options: 'i' } },
                { name: { $regex: String(search), $options: 'i' } },
                { description: { $regex: String(search), $options: 'i' } },
              ],
            }
          : {},
      ],
    };

    const products = await Product.find(query).sort({ updatedAt: -1 });
    return res.json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch products.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch product.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, name, description, price, quantity, category, qrCode } = req.body;

    if (!id || !name || !description || !category || !qrCode) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const existing = await Product.findOne({ id: id.trim() });
    if (existing) {
      return res.status(409).json({ message: 'Product ID already exists.' });
    }

    const product = await Product.create({
      id: id.trim(),
      name: name.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      quantity: Number(quantity) || 0,
      category: category.trim(),
      qrCode: qrCode.trim(),
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot create product.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, quantity, category, qrCode } = req.body;

    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = Number.isFinite(Number(price)) ? Number(price) : product.price;
    product.quantity = Number.isFinite(Number(quantity)) ? Number(quantity) : product.quantity;
    product.category = category ?? product.category;
    product.qrCode = qrCode ?? product.qrCode;

    await product.save();
    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot update product.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json({ message: 'Product deleted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot delete product.' });
  }
});

module.exports = router;
