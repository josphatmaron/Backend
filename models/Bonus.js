const mongoose = require('mongoose');

const bonusSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:       { type: String, enum: ['welcome', 'promotion', 'other'], required: true },
  amount:     { type: Number, required: true },
  wageringRequirement: Number,
  expiresAt:  Date,
  status:     { type: String, enum: ['active', 'expired', 'used'], default: 'active' }
});

module.exports = mongoose.model('Bonus', bonusSchema);