const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:    { type: Number, required: true },
  placedAt:  { type: Date, default: Date.now },
  cashoutMultiplier: Number,
  cashoutAmount: Number,
  status:   { type: String, enum: ['won', 'lost', 'pending'], default: 'pending' }
});

const gameSessionSchema = new mongoose.Schema({
  startedAt:         { type: Date, default: Date.now },
  endedAt:           { type: Date },
  crashMultiplier:   { type: Number },
  outcome:           { type: String, enum: ['crashed', 'cashed_out'] },
  bets:              [betSchema]
});

module.exports = mongoose.model('GameSession', gameSessionSchema);