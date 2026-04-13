const express = require('express');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

const router = express.Router();

function computeInvoiceStatus(totalAmount, paidAmount) {
  if (paidAmount <= 0) {
    return 'Unpaid';
  }
  if (paidAmount >= totalAmount) {
    return 'Paid';
  }
  return 'Partial';
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

router.get('/', async (req, res) => {
  try {
    const search = String(req.query.search || '').trim();
    const query = search
      ? {
          $or: [
            { id: { $regex: search, $options: 'i' } },
            { orderId: { $regex: search, $options: 'i' } },
            { clientId: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { note: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const invoices = await Invoice.find(query).sort({ updatedAt: -1 });
    return res.json(invoices);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch invoices.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ id: req.params.id });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    const order = await Order.findOne({ id: invoice.orderId });
    const payments = await Payment.find({ invoiceId: invoice.id }).sort({ paidAt: -1 });

    return res.json({ invoice, order, payments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch invoice detail.' });
  }
});

router.get('/:id/xml', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ id: req.params.id });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    const order = await Order.findOne({ id: invoice.orderId });
    const itemsXml = (order?.items || [])
      .map(
        (item) =>
          `<item><productId>${escapeXml(item.productId)}</productId><quantity>${item.quantity}</quantity><unitPrice>${item.unitPrice}</unitPrice></item>`,
      )
      .join('');

    const xml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<invoice><id>${escapeXml(invoice.id)}</id><orderId>${escapeXml(invoice.orderId)}</orderId><clientId>${escapeXml(invoice.clientId)}</clientId><status>${escapeXml(invoice.status)}</status><description>${escapeXml(invoice.description || invoice.note || '')}</description><totalAmount>${invoice.totalAmount}</totalAmount><paidAmount>${invoice.paidAmount}</paidAmount><items>${itemsXml}</items></invoice>`;

    res.setHeader('Content-Type', 'application/xml');
    return res.send(xml);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot export XML.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, orderId, description = '', note = '' } = req.body;

    if (!id || !orderId) {
      return res.status(400).json({ message: 'Invoice id and orderId are required.' });
    }

    const exists = await Invoice.findOne({ id: id.trim() });
    if (exists) {
      return res.status(409).json({ message: 'Invoice ID already exists.' });
    }

    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const client = await Client.findOne({ id: order.clientId });
    if (!client) {
      return res.status(400).json({ message: 'Order client does not exist.' });
    }

    const invoice = await Invoice.create({
      id: id.trim(),
      orderId: order.id,
      clientId: order.clientId,
      totalAmount: order.totalAmount,
      paidAmount: 0,
      status: 'Unpaid',
      description: String(description || note || '').trim(),
      note: String(note || description || '').trim(),
    });

    return res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot generate invoice.' });
  }
});

router.put('/:id/recompute', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ id: req.params.id });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    const payments = await Payment.find({ invoiceId: invoice.id });
    const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

    invoice.paidAmount = paidAmount;
    invoice.status = computeInvoiceStatus(invoice.totalAmount, paidAmount);
    await invoice.save();

    return res.json(invoice);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot recompute invoice.' });
  }
});

module.exports = router;
