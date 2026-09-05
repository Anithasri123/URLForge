const express = require('express');
const {
  createUrl,
  getUserUrls,
  getUrlById,
  getUrlStats,
  deleteUrl
} = require('../controllers/urlController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All /api/urls routes require authentication
router.use(protect);

router.route('/')
  .post(createUrl)
  .get(getUserUrls);

router.get('/:id/stats', getUrlStats);

router.route('/:id')
  .get(getUrlById)
  .delete(deleteUrl);

module.exports = router;
