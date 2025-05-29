const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance:  { type: Number, default: 0 },
  currency: { type: String, enum: ['USD', 'BTC'], default: 'USD' }
});

module.exports = mongoose.model('Wallet', walletSchema);