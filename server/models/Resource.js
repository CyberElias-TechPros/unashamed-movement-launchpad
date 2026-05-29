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

module.exports = mongoose.model('Resource', resourceSchema);
