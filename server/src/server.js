const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

// Start server
app.listen(PORT, () => {
  console.log(`URLForge server listening on port ${PORT}`);
});
