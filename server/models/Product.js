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

// Performance indexes for common queries
productSchema.index({ category: 1, isActive: 1 }); // Shop filtering
productSchema.index({ createdAt: -1 }); // Sort by newest
productSchema.index({ name: 'text', description: 'text' }); // Search

// Additional performance indexes
productSchema.index({ isActive: 1 }); // Filter active products
productSchema.index({ category: 1 }); // Category filtering
productSchema.index({ price: 1 }); // Price sorting
productSchema.index({ stock: 1 }); // Inventory queries
productSchema.index({ tag: 1 }); // Tag filtering
productSchema.index({ category: 1, price: 1 }); // Category + price sorting
productSchema.index({ category: 1, createdAt: -1 }); // Category + newest

module.exports = mongoose.model('Product', productSchema);
