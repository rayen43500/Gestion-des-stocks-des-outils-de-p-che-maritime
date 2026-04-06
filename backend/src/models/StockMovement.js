const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true },
    type: { type: String, enum: ['IN', 'OUT'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: '', trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);
