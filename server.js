require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const twilio = require('twilio');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'https://josphatmaron.github.io'
}));
app.use(express.json());

// --- Twilio config (use your real credentials in .env) ---
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioFrom = process.env.TWILIO_PHONE;

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

// In-memory OTP store (replace this with a DB collection for production)
const otpStore = {}; // { phone: { code, expiresAt, data } }

// ========================
// ROUTES
// ========================

// Example route
app.get('/', (req, res) => res.send('Hello from Express and MongoDB!'));

// User registration: step 1 (send code)
app.post('/register', async (req, res) => {
  try {
    const { phone, password, username, email } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password required.' });

    // Password validation: at least 8 chars, at least one letter and one number
    const validPassword = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
    if (!validPassword) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters, include at least one letter and one number.'
      });
    }

    // Check if phone or email already exists
    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ error: 'Phone already registered.' });

    // Generate code and hash password
    const code = Math.floor(100000 + Math.random() * 900000);
    const passwordHash = await bcrypt.hash(password, 10);
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore[phone] = { code, expiresAt, data: { username, email, phone, passwordHash } };

    // Send SMS
    await twilioClient.messages.create({
      body: `Your Airpawa verification code is: ${code}`,
      from: twilioFrom,
      to: phone
    });

    res.json({ message: 'Verification code sent!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send code. Please try again.' });
  }
});

// User verification: step 2 (verify code and create user)
app.post('/verify', async (req, res) => {
  try {
    const { phone, code } = req.body;
    const entry = otpStore[phone];
    if (!entry) return res.status(400).json({ error: 'No pending signup for this phone.' });
    if (Date.now() > entry.expiresAt) {
      delete otpStore[phone];
      return res.status(400).json({ error: 'Code expired.' });
    }
    if (parseInt(code) !== entry.code) return res.status(400).json({ error: 'Incorrect code.' });

    // Create user
    const { username, email, passwordHash } = entry.data;
    const user = await User.create({ username, email, phone, password: passwordHash, verified: true });
    delete otpStore[phone];
    res.status(201).json({ message: 'Account verified! You can now log in.', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login with error handling
app.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    if (!user.verified) return res.status(403).json({ error: 'Account not verified. Please verify your phone.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Wrong password.' });
    res.json({ message: 'Login successful!', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Resend OTP
app.post('/resend-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const entry = otpStore[phone];
    if (!entry) return res.status(400).json({ error: 'No pending signup for this phone.' });

    const code = Math.floor(100000 + Math.random() * 900000);
    entry.code = code;
    entry.expiresAt = Date.now() + 5 * 60 * 1000;

    await twilioClient.messages.create({
      body: `Your Airpawa verification code is: ${code}`,
      from: twilioFrom,
      to: phone
    });

    res.json({ message: 'Verification code resent!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resend code. Try again.' });
  }
});

// OTHER ROUTES (unchanged, for wallet, game sessions, etc.)
// ... (your previous routes for wallet, games, transactions, bonuses, etc. remain here) ...

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
