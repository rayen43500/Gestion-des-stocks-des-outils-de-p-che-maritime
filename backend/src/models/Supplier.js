const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    productIds: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Supplier', supplierSchema);
