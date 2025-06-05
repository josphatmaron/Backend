const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String }, // for email verification
  // Add other fields as needed
});

module.exports = mongoose.model('User', userSchema);