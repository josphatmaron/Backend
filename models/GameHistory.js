const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
  crashPoint:    { type: Number, required: true },
  roundAt:       { type: Date, default: Date.now },
  playerCount:   { type: Number },
  totalBets:     { type: Number }
});

module.exports = mongoose.model('GameHistory', gameHistorySchema);