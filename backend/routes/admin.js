const express = require('express');
const router  = express.Router();
const {
  getDashboardStats,
  getAllStudents,
  updateStudent,
  deactivateStudent,
  getAllTests,
  createTest,
  updateTest,
  getAllCodingProblems,
  createCodingProblem,
  getStudentProgress,
  deleteTest,
  deleteCodingProblem,
  createStudent,
  createAdmin,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// @GET    /api/admin/dashboard
router.get('/dashboard', getDashboardStats);

// @GET    /api/admin/students
router.get('/students', getAllStudents);

// @POST   /api/admin/students
router.post('/students', createStudent);

// @PUT    /api/admin/students/:id
router.put('/students/:id', updateStudent);

// @DELETE /api/admin/students/:id
router.delete('/students/:id', deactivateStudent);

// @GET    /api/admin/tests  (includes inactive)
router.get('/tests', getAllTests);

// @POST   /api/admin/tests
router.post('/tests', createTest);

// @PUT    /api/admin/tests/:id
router.put('/tests/:id', updateTest);

// @DELETE /api/admin/tests/:id
router.delete('/tests/:id', deleteTest);

// @GET    /api/admin/coding-problems
router.get('/coding-problems', getAllCodingProblems);

// @POST   /api/admin/coding-problems
router.post('/coding-problems', createCodingProblem);

// @DELETE /api/admin/coding-problems/:id
router.delete('/coding-problems/:id', deleteCodingProblem);

// @GET    /api/admin/students/:id/progress
router.get('/students/:id/progress', getStudentProgress);

// @POST   /api/admin/create-admin
router.post('/create-admin', createAdmin);

module.exports = router;
