const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const { redirectUrl } = require('./controllers/urlController');

// Ensure models are registered with Mongoose
require('./models/User');
require('./models/URL');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'URLForge API is running'
  });
});

// Authentication API routes
app.use('/api/auth', authRoutes);

// URL Shortener API routes
app.use('/api/urls', urlRoutes);

// Public redirection route (must be mounted after /api routes to avoid route conflicts)
app.get('/:shortCode', redirectUrl);

// Start server after connecting to MongoDB & Redis
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis(); // Resilient connection (doesn't crash if Redis is down)
    app.listen(PORT, () => {
      console.log(`URLForge server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
