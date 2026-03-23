const express = require('express');
const router  = express.Router();
const {
  getAllTests,
  getTest,
  submitTest,
  createTest,
  updateTest,
  deleteTest,
} = require('../controllers/testController');
const { protect, adminOnly } = require('../middleware/auth');

// ── Public/Student routes (auth required) ─────────────────────
// @GET  /api/tests             — list tests (with filters)
router.get('/', protect, getAllTests);

// @GET  /api/tests/:id         — get a single test
router.get('/:id', protect, getTest);

// @POST /api/tests/:id/submit  — submit answers
router.post('/:id/submit', protect, submitTest);

// ── Admin-only routes ─────────────────────────────────────────
// @POST   /api/tests            — create test
router.post('/', protect, adminOnly, createTest);

// @PUT    /api/tests/:id        — update test
router.put('/:id', protect, adminOnly, updateTest);

// @DELETE /api/tests/:id        — deactivate test
router.delete('/:id', protect, adminOnly, deleteTest);

module.exports = router;
