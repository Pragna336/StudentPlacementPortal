const express = require('express');
const multer  = require('multer');
const path    = require('path');
const router  = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadResume,
  getLeaderboard,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

// ── Multer config for resume uploads ──────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/resumes'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}-resume${ext}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// @GET    /api/user/profile
router.get('/profile', protect, getProfile);

// @PUT    /api/user/profile
router.put('/profile', protect, updateProfile);

// @PUT    /api/user/change-password
router.put('/change-password', protect, changePassword);

// @POST   /api/user/upload-resume
router.post('/upload-resume', protect, upload.single('resume'), uploadResume);

// @GET    /api/user/leaderboard
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
