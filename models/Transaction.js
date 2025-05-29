const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:        { type: String, enum: ['deposit', 'withdrawal', 'bet', 'cashout'], required: true },
  amount:      { type: Number, required: true },
  createdAt:   { type: Date, default: Date.now },
  paymentMethod: String,
  status:      { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
});

module.exports = mongoose.model('Transaction', transactionSchema);