const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  category: { type: String, required: true },
  action: { type: String, required: true },
  label: { type: String, default: '' },
  value: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
