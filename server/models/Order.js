const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, default: '' },
  paymentId: { type: String, default: '' },
  idempotencyKey: { type: String, unique: true, sparse: true },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
}, { timestamps: true });

// Performance indexes for common queries
orderSchema.index({ status: 1, createdAt: -1 }); // Admin status filtering
orderSchema.index({ customerEmail: 1 }); // Lookup by email
orderSchema.index({ createdAt: -1 }); // Sort by newest

// Additional performance indexes
orderSchema.index({ user: 1 }); // User order history
orderSchema.index({ user: 1, createdAt: -1 }); // User orders sorted
orderSchema.index({ status: 1 }); // Status filtering
orderSchema.index({ paymentId: 1 }); // Payment lookup
orderSchema.index({ idempotencyKey: 1 }, { sparse: true }); // Idempotency checks
orderSchema.index({ 'items.product': 1 }); // Product order history
orderSchema.index({ totalAmount: 1 }); // Revenue sorting
orderSchema.index({ createdAt: 1, status: 1 }); // Date range + status

module.exports = mongoose.model('Order', orderSchema);
