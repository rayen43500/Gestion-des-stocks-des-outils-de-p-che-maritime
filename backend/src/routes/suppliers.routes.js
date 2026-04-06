const express = require('express');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const search = String(req.query.search || '').trim();

    const query = search
      ? {
          $or: [
            { id: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const suppliers = await Supplier.find(query).sort({ updatedAt: -1 });
    return res.json(suppliers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch suppliers.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ id: req.params.id });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }
    return res.json(supplier);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch supplier.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, name, email = '', phone = '', address = '', productIds = [] } = req.body;

    if (!id || !name) {
      return res.status(400).json({ message: 'ID and name are required.' });
    }

    const exists = await Supplier.findOne({ id: id.trim() });
    if (exists) {
      return res.status(409).json({ message: 'Supplier ID already exists.' });
    }

    if (Array.isArray(productIds) && productIds.length > 0) {
      const count = await Product.countDocuments({ id: { $in: productIds } });
      if (count !== productIds.length) {
        return res.status(400).json({ message: 'Some linked product IDs are invalid.' });
      }
    }

    const supplier = await Supplier.create({
      id: id.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      productIds,
    });

    return res.status(201).json(supplier);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot create supplier.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address, productIds } = req.body;

    const supplier = await Supplier.findOne({ id: req.params.id });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }

    if (Array.isArray(productIds) && productIds.length > 0) {
      const count = await Product.countDocuments({ id: { $in: productIds } });
      if (count !== productIds.length) {
        return res.status(400).json({ message: 'Some linked product IDs are invalid.' });
      }
    }

    supplier.name = name ?? supplier.name;
    supplier.email = email !== undefined ? String(email).trim().toLowerCase() : supplier.email;
    supplier.phone = phone !== undefined ? String(phone).trim() : supplier.phone;
    supplier.address = address !== undefined ? String(address).trim() : supplier.address;
    supplier.productIds = Array.isArray(productIds) ? productIds : supplier.productIds;

    await supplier.save();
    return res.json(supplier);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot update supplier.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Supplier.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }
    return res.json({ message: 'Supplier deleted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot delete supplier.' });
  }
});

module.exports = router;
