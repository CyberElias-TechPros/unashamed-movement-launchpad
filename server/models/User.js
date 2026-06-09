const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

// Performance indexes for common queries
userSchema.index({ createdAt: -1 }); // Sort by newest first
userSchema.index({ email: 1 }, { unique: true }); // Login queries (already unique but explicit)
userSchema.index({ role: 1 }); // Admin queries
userSchema.index({ role: 1, createdAt: -1 }); // Admin sorted lists
userSchema.index({ isActive: 1 }); // Filter active users
userSchema.index({ emailVerified: 1 }); // Find unverified users
userSchema.index({ name: 'text' }); // Search by name

// Token indexes for password reset and verification flows
userSchema.index({ resetPasswordToken: 1 }, { sparse: true }); // Token lookups
userSchema.index({ emailVerificationToken: 1 }, { sparse: true }); // Verification lookups

module.exports = mongoose.model('User', userSchema);
