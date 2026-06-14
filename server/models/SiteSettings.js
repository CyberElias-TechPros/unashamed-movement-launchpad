const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  siteName: { type: String, default: 'The Time Is Now' },
  tagline: { type: String, default: 'Bold faith for today\'s generation' },
  siteUrl: { type: String, default: 'https://thetimeisnow.org' },
  description: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  faviconUrl: { type: String, default: '' },
  themeMode: { type: String, default: 'default', enum: ['default', 'bw-purple', 'minimal'] },
  primaryColor: { type: String, default: '#7c3aed' },
  accentColor: { type: String, default: '#fbbf24' },
  allowNewsletter: { type: Boolean, default: true },
  allowRegistration: { type: Boolean, default: false },
  moderateReviews: { type: Boolean, default: true },
  moderateTestimonials: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  socialTwitter: { type: String, default: '' },
  socialInstagram: { type: String, default: '' },
  socialYoutube: { type: String, default: '' },
  socialTiktok: { type: String, default: '' },
  emailFrom: { type: String, default: '' },
  smtpHost: { type: String, default: '' },
  smtpPort: { type: String, default: '587' },
  paymentMethods: {
    type: {
      stripe: { type: Boolean, default: true },
      paypal: { type: Boolean, default: false },
      paystack: { type: Boolean, default: true },
      flutterwave: { type: Boolean, default: true },
    },
    default: () => ({ stripe: true, paypal: false, paystack: true, flutterwave: true }),
  },
}, { timestamps: true });

// Single document settings - no additional indexes needed
// Settings are fetched as a single document

module.exports = mongoose.model('SiteSettings', settingSchema);
