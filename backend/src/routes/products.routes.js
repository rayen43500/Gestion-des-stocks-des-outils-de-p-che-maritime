const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search = '', category = 'all', barcode = '' } = req.query;

    const query = {
      $and: [
        category !== 'all' ? { category } : {},
        barcode ? { barcode: { $regex: String(barcode), $options: 'i' } } : {},
        search
          ? {
              $or: [
                { id: { $regex: String(search), $options: 'i' } },
                { name: { $regex: String(search), $options: 'i' } },
                { description: { $regex: String(search), $options: 'i' } },
                { productType: { $regex: String(search), $options: 'i' } },
                { size: { $regex: String(search), $options: 'i' } },
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
    const { id, name, description, price, quantity, category, productType, size, lengthCm, barcode } = req.body;

    if (!id || !name || !description || !category || !productType || !size || lengthCm === undefined || !barcode) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    if (!String(barcode).trim()) {
      return res.status(400).json({ message: 'Barcode is required.' });
    }

    if (!Number.isFinite(Number(lengthCm)) || Number(lengthCm) < 0) {
      return res.status(400).json({ message: 'lengthCm must be a valid positive number.' });
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
      productType: productType.trim(),
      size: size.trim(),
      lengthCm: Number(lengthCm),
      barcode: barcode.trim(),
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot create product.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, quantity, category, productType, size, lengthCm, barcode } = req.body;

    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = Number.isFinite(Number(price)) ? Number(price) : product.price;
    product.quantity = Number.isFinite(Number(quantity)) ? Number(quantity) : product.quantity;
    product.category = category ?? product.category;
    product.productType = productType ?? product.productType;
    product.size = size ?? product.size;
    product.lengthCm = Number.isFinite(Number(lengthCm)) ? Number(lengthCm) : product.lengthCm;

    if (barcode !== undefined) {
      if (!String(barcode).trim()) {
        return res.status(400).json({ message: 'Barcode cannot be empty.' });
      }
      product.barcode = String(barcode).trim();
    }

    if (!product.name || !product.description || !product.category || !product.productType || !product.size) {
      return res.status(400).json({ message: 'Missing required product fields.' });
    }

    if (!Number.isFinite(Number(product.lengthCm)) || Number(product.lengthCm) < 0) {
      return res.status(400).json({ message: 'lengthCm must be a valid positive number.' });
    }

    if (!String(product.barcode || '').trim()) {
      return res.status(400).json({ message: 'Barcode is required.' });
    }

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
