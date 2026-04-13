const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    invoiceId: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, required: true, trim: true },
    note: { type: String, default: '', trim: true },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Payment', paymentSchema);
