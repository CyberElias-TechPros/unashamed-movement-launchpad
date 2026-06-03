const mongoose = require('mongoose');

const backInStockSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  email: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

backInStockSchema.index({ product: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('BackInStock', backInStockSchema);
