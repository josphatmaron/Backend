require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();

// --------- CORS MUST BE FIRST! ---------
app.use(cors({
  origin: 'https://josphatmaron.github.io',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// --------- THEN JSON BODY PARSER ---------
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
    // Debug logging: see exactly what is received
    console.log('Register request body:', req.body);

    const { phone, password, username, email } = req.body;
    // Log each field for deeper debugging
    console.log('Fields:', { phone, password, username, email });

    if (!phone || !password || !username || !email) {
      console.log('Missing field:', { phone, password, username, email });
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Password validation: at least 8 chars, at least one letter and one number
    const validPassword = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
    if (!validPassword) {
      console.log('Invalid password:', password);
      return res.status(400).json({
        error: 'Password must be at least 8 characters, include at least one letter and one number.'
      });
    }

    // Check if phone or email already exists
    const exists = await User.findOne({ $or: [ { phone }, { email } ] });
    if (exists) {
      console.log('Duplicate phone/email:', { phone, email });
      return res.status(400).json({ error: 'Phone or email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user immediately and mark as verified
    const user = await User.create({
      username,
      email,
      phone,
      password: passwordHash,
      verified: true
    });

    console.log('User created:', user);

    res.status(201).json({ message: 'Registration successful!', user });
  } catch (err) {
    console.error('Register error:', err);
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
