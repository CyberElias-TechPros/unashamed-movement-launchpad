const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ['merch', 'digital'], required: true },
  images: [{ type: String }],
  tag: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  downloadUrl: { type: String, default: '' },
  sizes: [{ type: String }],
  colors: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
