const User     = require('../models/User');
const Progress = require('../models/Progress');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

// ── Helper: send token response ───────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id:      user._id,
      name:    user.name,
      email:   user.email,
      role:    user.role,
      college: user.college,
      branch:  user.branch,
      year:    user.year,
      avatar:  user.avatar,
    },
  });
};

// ── @route   POST /api/auth/register
// ── @desc    Register new student
// ── @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, college, branch, year } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, college, branch, year });

    // Create empty progress document for new student
    await Progress.create({ user: user._id });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 201, res, 'Registration successful! Welcome aboard 🎉');
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/auth/login
// ── @desc    Login student or admin
// ── @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Login successful!');
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/auth/admin-login
// ── @desc    Admin-only login
// ── @access  Public
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Admin login successful!');
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/auth/me
// ── @desc    Get current logged-in user
// ── @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/auth/logout
// ── @desc    Logout (client-side token removal, server-side acknowledgment)
// ── @access  Private
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};
