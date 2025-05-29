require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors({
  origin: 'https://josphatmaron.github.io'
}));

// MongoDB connection
mongoose.connect(
  process.env.MONGODB_URI ||
    'mongodb+srv://josphatmaron:wera2025@cluster0.8n4u6dl.mongodb.net/airpawa?retryWrites=true&w=majority&appName=Cluster0'
)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import your models
const User = require('./models/User');
const GameSession = require('./models/GameSession');
const GameHistory = require('./models/GameHistory');
const Wallet = require('./models/Wallet');
const Transaction = require('./models/Transaction');
const Bonus = require('./models/Bonus');

app.use(express.json());

// ========================
// ROUTES
// ========================

// Example route
app.get('/', (req, res) => res.send('Hello from Express and MongoDB!'));

// User registration
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
    res.status(201).json({ message: "User registered!", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Show all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// WALLET
// ========================

// Create a wallet for a user
app.post('/wallet', async (req, res) => {
  try {
    const { userId, currency } = req.body;
    const wallet = await Wallet.create({ user: userId, currency });
    res.status(201).json({ message: 'Wallet created!', wallet });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Show a user’s wallet
app.get('/wallet/:userId', async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.params.userId });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// GAME SESSIONS
// ========================

// Create a game session
app.post('/gamesession', async (req, res) => {
  try {
    const { startedAt, endedAt, crashMultiplier, outcome, bets } = req.body;
    const session = await GameSession.create({ startedAt, endedAt, crashMultiplier, outcome, bets });
    res.status(201).json({ message: 'Game session created!', session });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Show all game sessions
app.get('/gamesessions', async (req, res) => {
  try {
    const sessions = await GameSession.find();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// TRANSACTIONS
// ========================

// Create a transaction
app.post('/transaction', async (req, res) => {
  try {
    const { user, type, amount, paymentMethod, status } = req.body;
    const transaction = await Transaction.create({ user, type, amount, paymentMethod, status });
    res.status(201).json({ message: 'Transaction created!', transaction });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Show all transactions for a user
app.get('/transactions/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.params.userId });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// BONUSES
// ========================

// Add bonus for a user
app.post('/bonus', async (req, res) => {
  try {
    const { user, type, amount, wageringRequirement, expiresAt, status } = req.body;
    const bonus = await Bonus.create({ user, type, amount, wageringRequirement, expiresAt, status });
    res.status(201).json({ message: 'Bonus added!', bonus });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Show all bonuses for a user
app.get('/bonuses/:userId', async (req, res) => {
  try {
    const bonuses = await Bonus.find({ user: req.params.userId });
    res.json(bonuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
