const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, required: true, trim: true },
    qrCode: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Product', productSchema);
