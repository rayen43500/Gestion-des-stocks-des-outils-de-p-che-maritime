const express = require('express');
const Invoice = require('../models/Invoice');
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

router.get('/', async (req, res) => {
  try {
    const search = String(req.query.search || '').trim();
    const query = search
      ? {
          $or: [
            { id: { $regex: search, $options: 'i' } },
            { invoiceId: { $regex: search, $options: 'i' } },
            { method: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const payments = await Payment.find(query).sort({ paidAt: -1 });
    return res.json(payments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot fetch payments.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, invoiceId, amount, method, note = '' } = req.body;

    if (!id || !invoiceId || !amount || !method) {
      return res.status(400).json({ message: 'Payment id, invoiceId, amount and method are required.' });
    }

    const exists = await Payment.findOne({ id: id.trim() });
    if (exists) {
      return res.status(409).json({ message: 'Payment ID already exists.' });
    }

    const invoice = await Invoice.findOne({ id: invoiceId });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero.' });
    }

    await Payment.create({
      id: id.trim(),
      invoiceId,
      amount: value,
      method: String(method).trim(),
      note: String(note || '').trim(),
    });

    const payments = await Payment.find({ invoiceId: invoice.id });
    const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

    invoice.paidAmount = paidAmount;
    invoice.status = computeInvoiceStatus(invoice.totalAmount, paidAmount);
    await invoice.save();

    return res.status(201).json({ message: 'Payment created.', invoice });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cannot create payment.' });
  }
});

module.exports = router;
