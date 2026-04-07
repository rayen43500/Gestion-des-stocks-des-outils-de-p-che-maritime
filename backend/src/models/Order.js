const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    clientId: { type: String, required: true, trim: true },
    items: { type: [orderItemSchema], required: true, default: [] },
    status: { type: String, enum: ['Draft', 'Confirmed', 'Delivered'], default: 'Draft' },
    note: { type: String, default: '', trim: true },
    totalAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Order', orderSchema);
