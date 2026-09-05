const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
      match: [
        /^(https?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/i,
        'Please provide a valid HTTP or HTTPS URL'
      ]
    },
    shortCode: {
      type: String,
      required: [true, 'Short code is required'],
      unique: true,
      index: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    clickCount: {
      type: Number,
      default: 0,
      min: [0, 'Click count cannot be negative']
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const URLModel = mongoose.model('URL', urlSchema);

module.exports = URLModel;
