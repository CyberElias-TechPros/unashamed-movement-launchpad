const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, default: '' },
  description: { type: String, required: true },
  type: { type: String, enum: ['book', 'devotional', 'guide', 'article', 'podcast'], required: true },
  category: { type: String, default: 'Other Inspiration' },
  fileUrl: { type: String, default: '' },
  externalUrl: { type: String, default: '' },
  downloadUrl: { type: String, default: '' },
  image: { type: String, default: '' },
  isFree: { type: Boolean, default: true },
  free: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

resourceSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.downloadUrl = ret.downloadUrl || ret.externalUrl || ret.fileUrl;
    ret.free = ret.free ?? ret.isFree;
    return ret;
  },
});

// Performance indexes for common queries
resourceSchema.index({ type: 1, isActive: 1 }); // Type filtering
resourceSchema.index({ category: 1, isActive: 1 }); // Category filtering
resourceSchema.index({ isFree: 1, isActive: 1 }); // Free resources
resourceSchema.index({ isActive: 1 }); // Active resources
resourceSchema.index({ downloadCount: -1 }); // Popular resources
resourceSchema.index({ createdAt: -1 }); // Newest resources
resourceSchema.index({ title: 'text', description: 'text', author: 'text' }); // Search
resourceSchema.index({ type: 1, category: 1, isActive: 1 }); // Combined filters

module.exports = mongoose.model('Resource', resourceSchema);
