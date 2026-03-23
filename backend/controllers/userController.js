const User = require('../models/User');
const path = require('path');
const fs   = require('fs');

// ── @route   GET /api/user/profile
// ── @desc    Get logged-in user's full profile
// ── @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/user/profile
// ── @desc    Update profile
// ── @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'college', 'branch', 'year', 'cgpa', 'rollNo',
      'bio', 'phone', 'linkedin', 'github', 'skills',
      'targetCompanies', 'targetRole',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Profile updated successfully.', user });
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/user/change-password
// ── @desc    Change password
// ── @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/user/upload-resume
// ── @desc    Upload resume PDF
// ── @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { resumeUrl } },
      { new: true }
    );

    res.json({ success: true, message: 'Resume uploaded successfully.', resumeUrl, user });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/user/leaderboard
// ── @desc    Get top students by average score
// ── @access  Private
exports.getLeaderboard = async (req, res, next) => {
  try {
    const Progress = require('../models/Progress');
    const leaderboard = await Progress.find()
      .populate('user', 'name college branch year avatar')
      .sort({ averageScore: -1, totalTestsAttempted: -1 })
      .limit(20);

    const result = leaderboard
      .filter((p) => p.user)
      .map((p, i) => ({
        rank:          i + 1,
        name:          p.user.name,
        college:       p.user.college,
        branch:        p.user.branch,
        year:          p.user.year,
        avatar:        p.user.avatar,
        averageScore:  p.averageScore,
        testsAttempted:p.totalTestsAttempted,
        badges:        p.badges.length,
      }));

    res.json({ success: true, leaderboard: result });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/user/all
// ── @desc    Get all students (admin use via user route)
// ── @access  Private/Admin
exports.getAllStudents = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const query = { role: 'student' };
    if (req.query.search) {
      query.$or = [
        { name:    { $regex: req.query.search, $options: 'i' } },
        { email:   { $regex: req.query.search, $options: 'i' } },
        { college: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.branch)  query.branch   = req.query.branch;
    if (req.query.year)    query.year      = req.query.year;
    if (req.query.placed)  query.isPlaced  = req.query.placed === 'true';

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    next(err);
  }
};
