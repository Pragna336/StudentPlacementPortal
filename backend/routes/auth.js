const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();
const { register, login, adminLogin, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation rules
const registerRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// @POST /api/auth/register
router.post('/register', registerRules, register);

// @POST /api/auth/login
router.post('/login', loginRules, login);

// @POST /api/auth/admin-login
router.post('/admin-login', loginRules, adminLogin);

// @GET  /api/auth/me
router.get('/me', protect, getMe);

// @POST /api/auth/logout
router.post('/logout', protect, logout);

module.exports = router;
