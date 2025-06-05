require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(
  process.env.MONGODB_URI ||
    'mongodb+srv://josphatmaron:wera2025@cluster0.8n4u6dl.mongodb.net/airpawa?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.error('MongoDB connection error:', err));
