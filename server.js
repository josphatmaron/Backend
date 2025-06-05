require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'https://josphatmaron.github.io'
}));
app.use(express.json());

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

// ========================
// ROUTES
// ========================

// Example route
app.get('/', (req, res) => res.send('Hello from Express and MongoDB!'));

// User registration: immediate account creation, no verification code
app.post('/register', async (req, res) => {
  try {
    const { phone, password, username, email } = req.body;
    if (!phone || !password || !username || !email) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Password validation: at least 8 chars, at least one letter and one number
    const validPassword = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
    if (!validPassword) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters, include at least one letter and one number.'
      });
    }

    // Check if phone or email already exists
    const exists = await User.findOne({ $or: [ { phone }, { email } ] });
    if (exists) return res.status(400).json({ error: 'Phone or email already registered.' });

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user immediately and mark as verified
    const user = await User.create({
      username,
      email,
      phone,
      password: passwordHash,
      verified: true
    });

    res.status(201).json({ message: 'Registration successful!', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register. Please try again.' });
  }
});

// Login with error handling
app.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    // No verification step needed anymore
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Wrong password.' });
    res.json({ message: 'Login successful!', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user balance
app.patch('/users/:id/balance', async (req, res) => {
  try {
    const { balance } = req.body;
    if (typeof balance !== 'number') {
      return res.status(400).json({ error: 'Balance must be a number.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { balance } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'Balance updated.', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example: Show all users (for admin/debug only)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ... other routes unchanged ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
