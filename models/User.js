const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  fullName: String,
  dateOfBirth: Date,
  address: String,
  documents: [String], // URLs or file references
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store the hashed password!
  registrationAt: { type: Date, default: Date.now },
  lastLoginAt:    { type: Date },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  kyc: kycSchema
});

module.exports = mongoose.model('User', userSchema);