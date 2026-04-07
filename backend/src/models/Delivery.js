const mongoose = require('mongoose');

const deliveryItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true },
    quantityDelivered: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const deliverySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    orderId: { type: String, required: true, trim: true },
    items: { type: [deliveryItemSchema], required: true, default: [] },
    status: { type: String, enum: ['InTransit', 'Delivered'], default: 'InTransit' },
    note: { type: String, default: '', trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Delivery', deliverySchema);
