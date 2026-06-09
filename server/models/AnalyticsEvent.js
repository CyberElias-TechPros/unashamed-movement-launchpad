const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  category: { type: String, required: true },
  action: { type: String, required: true },
  label: { type: String, default: '' },
  value: { type: Number, default: 0 },
}, { timestamps: true });

// Performance indexes for common queries
analyticsEventSchema.index({ category: 1, createdAt: -1 }); // Category events sorted
analyticsEventSchema.index({ action: 1, createdAt: -1 }); // Action events sorted
analyticsEventSchema.index({ createdAt: -1 }); // All events sorted
analyticsEventSchema.index({ category: 1, action: 1, createdAt: -1 }); // Combined filter

// TTL index for automatic data retention (optional - keeps data for 90 days)
// analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
