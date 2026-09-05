const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const { redirectUrl } = require('./controllers/urlController');

const helmet = require('helmet');
const { authRateLimiter, apiRateLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Ensure models are registered with Mongoose
require('./models/User');
require('./models/URL');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & basic middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'URLForge API is running'
  });
});

// Authentication API routes (protected with auth rate limiter)
app.use('/api/auth', authRateLimiter, authRoutes);

// URL Shortener API routes (protected with API rate limiter)
app.use('/api/urls', apiRateLimiter, urlRoutes);

// Public redirection route (must be mounted after /api routes to avoid route conflicts)
app.get('/:shortCode', redirectUrl);

// Unknown route fallback (404) & Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

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
