const express = require('express');
const Client = require('../models/Client');

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

    const clients = await Client.find(query).sort({ updatedAt: -1 });
    return res.json(clients);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch clients.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findOne({ id: req.params.id });
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }
    return res.json(client);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch client.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, name, email = '', phone = '', address = '' } = req.body;

    if (!id || !name) {
      return res.status(400).json({ message: 'ID and name are required.' });
    }

    const exists = await Client.findOne({ id: id.trim() });
    if (exists) {
      return res.status(409).json({ message: 'Client ID already exists.' });
    }

    const client = await Client.create({
      id: id.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
    });

    return res.status(201).json(client);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot create client.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const client = await Client.findOne({ id: req.params.id });
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    client.name = name ?? client.name;
    client.email = email !== undefined ? String(email).trim().toLowerCase() : client.email;
    client.phone = phone !== undefined ? String(phone).trim() : client.phone;
    client.address = address !== undefined ? String(address).trim() : client.address;

    await client.save();
    return res.json(client);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot update client.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Client.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Client not found.' });
    }
    return res.json({ message: 'Client deleted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot delete client.' });
  }
});

module.exports = router;
