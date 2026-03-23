const express = require('express');
const router  = express.Router();
const {
  getMyProgress,
  getSummary,
  getHistory,
  getBadges,
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// @GET /api/progress           — full progress data
router.get('/', protect, getMyProgress);

// @GET /api/progress/summary   — dashboard stats
router.get('/summary', protect, getSummary);

// @GET /api/progress/history   — paginated attempt history
router.get('/history', protect, getHistory);

// @GET /api/progress/badges    — earned badges
router.get('/badges', protect, getBadges);

module.exports = router;
