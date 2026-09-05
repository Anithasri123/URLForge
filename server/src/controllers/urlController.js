const mongoose = require('mongoose');
const URLModel = require('../models/URL');
const generateShortCode = require('../utils/generateShortCode');
const { getCachedUrl, setCachedUrl, deleteCachedUrl } = require('../services/cacheService');

// Helper URL validator regex
const URL_REGEX = /^(https?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/i;

// @desc    Create a new shortened URL
// @route   POST /api/urls
// @access  Private (Requires Authentication)
const createUrl = async (req, res) => {
  try {
    const { originalUrl, expiresAt } = req.body;

    // 1. Validate originalUrl
    if (!originalUrl || typeof originalUrl !== 'string') {
      return res.status(400).json({ message: 'Please provide a valid originalUrl string' });
    }

    const trimmedUrl = originalUrl.trim();
    if (!URL_REGEX.test(trimmedUrl)) {
      return res.status(400).json({ message: 'Original URL must be a valid HTTP or HTTPS URL' });
    }

    // 2. Validate expiresAt if provided
    let expirationDate = null;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        return res.status(400).json({ message: 'Invalid expiration date format' });
      }
      if (expirationDate <= new Date()) {
        return res.status(400).json({ message: 'Expiration date must be in the future' });
      }
    }

    // 3. Short code generation & collision checking
    let shortCode = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      shortCode = generateShortCode(6);
      const existing = await URLModel.findOne({ shortCode });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ message: 'Failed to generate unique short code. Please try again.' });
    }

    // 4. Save URL document to database
    const urlDoc = await URLModel.create({
      originalUrl: trimmedUrl,
      shortCode,
      userId: req.user._id,
      expiresAt: expirationDate
    });

    const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;

    return res.status(201).json({
      message: 'URL created successfully',
      url: {
        id: urlDoc._id,
        originalUrl: urlDoc.originalUrl,
        shortCode: urlDoc.shortCode,
        shortUrl,
        clickCount: urlDoc.clickCount,
        createdAt: urlDoc.createdAt,
        expiresAt: urlDoc.expiresAt
      }
    });
  } catch (error) {
    console.error(`Create URL Error: ${error.message}`);
    return res.status(500).json({ message: 'Server error creating shortened URL' });
  }
};

// @desc    Get all URLs created by current user
// @route   GET /api/urls
// @access  Private (Requires Authentication)
const getUserUrls = async (req, res) => {
  try {
    const urls = await URLModel.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const formattedUrls = urls.map((u) => ({
      id: u._id,
      originalUrl: u.originalUrl,
      shortCode: u.shortCode,
      shortUrl: `${req.protocol}://${req.get('host')}/${u.shortCode}`,
      clickCount: u.clickCount,
      createdAt: u.createdAt,
      expiresAt: u.expiresAt
    }));

    return res.status(200).json({
      count: formattedUrls.length,
      urls: formattedUrls
    });
  } catch (error) {
    console.error(`Get User URLs Error: ${error.message}`);
    return res.status(500).json({ message: 'Server error fetching URLs' });
  }
};

// @desc    Get details of a specific URL by ID
// @route   GET /api/urls/:id
// @access  Private (Requires Authentication & Ownership)
const getUrlById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid URL ID format' });
    }

    const urlDoc = await URLModel.findById(id);

    if (!urlDoc) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Ownership check: Ensure authenticated user owns this URL
    if (urlDoc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this URL' });
    }

    return res.status(200).json({
      url: {
        id: urlDoc._id,
        originalUrl: urlDoc.originalUrl,
        shortCode: urlDoc.shortCode,
        shortUrl: `${req.protocol}://${req.get('host')}/${urlDoc.shortCode}`,
        clickCount: urlDoc.clickCount,
        createdAt: urlDoc.createdAt,
        expiresAt: urlDoc.expiresAt
      }
    });
  } catch (error) {
    console.error(`Get URL By ID Error: ${error.message}`);
    return res.status(500).json({ message: 'Server error fetching URL details' });
  }
};

// @desc    Delete a URL by ID and invalidate Redis cache
// @route   DELETE /api/urls/:id
// @access  Private (Requires Authentication & Ownership)
const deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid URL ID format' });
    }

    const urlDoc = await URLModel.findById(id);

    if (!urlDoc) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Ownership check: Prevent unauthorized deletion
    if (urlDoc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You cannot delete another user\'s URL' });
    }

    const shortCode = urlDoc.shortCode;

    // Delete document from MongoDB (source of truth)
    await urlDoc.deleteOne();

    // Cache Invalidation: Delete cached key from Redis to prevent stale redirects
    await deleteCachedUrl(shortCode);

    return res.status(200).json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error(`Delete URL Error: ${error.message}`);
    return res.status(500).json({ message: 'Server error deleting URL' });
  }
};

// @desc    Redirect short code to original URL (Cache-Aside pattern with Redis)
// @route   GET /:shortCode
// @access  Public (No Authentication Required)
const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // 1. Check Redis cache first (Cache HIT scenario)
    const cached = await getCachedUrl(shortCode);

    if (cached) {
      // Expiration check on cached payload (URL expiration rules remain authoritative!)
      if (cached.expiresAt && new Date() > new Date(cached.expiresAt)) {
        return res.status(410).json({ message: 'Short URL has expired' });
      }

      // Atomic increment of clickCount in MongoDB (MongoDB remains authoritative for analytics)
      await URLModel.findOneAndUpdate({ shortCode }, { $inc: { clickCount: 1 } });

      // Perform 302 Temporary Redirect using cached originalUrl
      return res.redirect(302, cached.originalUrl);
    }

    // 2. Cache MISS or Redis offline -> Query MongoDB source of truth
    const urlDoc = await URLModel.findOne({ shortCode });

    if (!urlDoc) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    // Expiration check on MongoDB document
    if (urlDoc.expiresAt && new Date() > new Date(urlDoc.expiresAt)) {
      return res.status(410).json({ message: 'Short URL has expired' });
    }

    // Populate Redis cache for future requests (TTL: 300s)
    await setCachedUrl(
      shortCode,
      {
        originalUrl: urlDoc.originalUrl,
        expiresAt: urlDoc.expiresAt
      },
      300
    );

    // Atomic increment of clickCount in MongoDB
    await URLModel.findByIdAndUpdate(urlDoc._id, { $inc: { clickCount: 1 } });

    // Perform 302 Temporary Redirect to original URL
    return res.redirect(302, urlDoc.originalUrl);
  } catch (error) {
    console.error(`Redirect Error: ${error.message}`);
    return res.status(500).json({ message: 'Server error during URL redirection' });
  }
};

module.exports = {
  createUrl,
  getUserUrls,
  getUrlById,
  deleteUrl,
  redirectUrl
};
