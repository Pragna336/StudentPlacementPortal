const Progress = require('../models/Progress');
const User     = require('../models/User');

// ── @route   GET /api/progress
// ── @desc    Get current user's full progress
// ── @access  Private
exports.getMyProgress = async (req, res, next) => {
  try {
    let progress = await Progress.findOne({ user: req.user._id })
      .populate('testAttempts.test', 'title category difficulty');

    if (!progress) {
      progress = await Progress.create({ user: req.user._id });
    }

    res.json({ success: true, progress });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/progress/summary
// ── @desc    Get lightweight summary stats for dashboard
// ── @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ user: req.user._id });

    if (!progress) {
      return res.json({
        success: true,
        summary: {
          totalTestsAttempted: 0,
          totalTestsPassed:    0,
          averageScore:        0,
          currentStreak:       0,
          longestStreak:       0,
          badges:              0,
          categoryStats:       {},
        },
      });
    }

    res.json({
      success: true,
      summary: {
        totalTestsAttempted: progress.totalTestsAttempted,
        totalTestsPassed:    progress.totalTestsPassed,
        averageScore:        progress.averageScore,
        currentStreak:       progress.currentStreak,
        longestStreak:       progress.longestStreak,
        badges:              progress.badges.length,
        categoryStats:       progress.categoryStats,
        recentAttempts:      progress.testAttempts.slice(-5).reverse(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/progress/history
// ── @desc    Get paginated test attempt history
// ── @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;

    const progress = await Progress.findOne({ user: req.user._id });
    if (!progress) {
      return res.json({ success: true, history: [], total: 0 });
    }

    let attempts = [...progress.testAttempts].reverse();

    if (req.query.category) {
      attempts = attempts.filter((a) => a.category === req.query.category);
    }

    const total   = attempts.length;
    const history = attempts.slice((page - 1) * limit, page * limit);

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), history });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/progress/badges
// ── @desc    Get all badges for current user
// ── @access  Private
exports.getBadges = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ user: req.user._id }).select('badges');
    res.json({ success: true, badges: progress ? progress.badges : [] });
  } catch (err) {
    next(err);
  }
};
