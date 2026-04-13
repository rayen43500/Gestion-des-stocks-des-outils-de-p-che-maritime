const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    orderId: { type: String, required: true, trim: true },
    clientId: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid' },
    note: { type: String, default: '', trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Invoice', invoiceSchema);
