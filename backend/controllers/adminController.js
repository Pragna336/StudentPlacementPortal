const User     = require('../models/User');
const Test     = require('../models/Test');
const Progress = require('../models/Progress');

// ── @route   GET /api/admin/dashboard
// ── @desc    Get high-level platform stats
// ── @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      placedStudents,
      totalTests,
      totalAttempts,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isPlaced: true }),
      Test.countDocuments({ isActive: true }),
      Progress.aggregate([{ $group: { _id: null, total: { $sum: '$totalTestsAttempted' } } }]),
    ]);

    // Average score across all students
    const avgScoreAgg = await Progress.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$averageScore' } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        placedStudents,
        placementRate:  totalStudents ? Math.round((placedStudents / totalStudents) * 100) : 0,
        totalTests,
        totalAttempts:  totalAttempts[0]?.total || 0,
        averageScore:   Math.round(avgScoreAgg[0]?.avgScore || 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/admin/students
// ── @desc    List all students with pagination & filters
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
    if (req.query.branch)  query.branch  = req.query.branch;
    if (req.query.year)    query.year    = req.query.year;
    if (req.query.placed !== undefined) query.isPlaced = req.query.placed === 'true';

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), users });
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/admin/students/:id
// ── @desc    Update any student's details (e.g. mark as placed)
// ── @access  Private/Admin
exports.updateStudent = async (req, res, next) => {
  try {
    const allowedFields = [
      'isPlaced', 'placedAt', 'placedPackage', 'isActive',
      'college', 'branch', 'year', 'cgpa',
    ];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Student not found.' });

    res.json({ success: true, message: 'Student updated.', user });
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/admin/students/:id
// ── @desc    Deactivate (soft-delete) a student account
// ── @access  Private/Admin
exports.deactivateStudent = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, message: 'Student account deactivated.' });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/admin/tests
// ── @desc    Get ALL tests including inactive ones
exports.getAllTests = async (req, res, next) => {
  try {
    const tests = await Test.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: tests.length, tests });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/admin/tests
// ── @desc    Create a new test
exports.createTest = async (req, res, next) => {
  try {
    const test = await Test.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, message: 'Test created successfully.', test });
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/admin/tests/:id
// ── @desc    Update a test
exports.updateTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found.' });
    res.json({ success: true, message: 'Test updated.', test });
  } catch (err) {
    next(err);
  }
};
// ── @route   DELETE /api/admin/tests/:id
// ── @desc    Delete a test
exports.deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found.' });
    res.json({ success: true, message: 'Test deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/admin/coding-problems/:id
// ── @desc    Delete a coding problem
exports.deleteCodingProblem = async (req, res, next) => {
  try {
    const CodingProblem = require('../models/CodingProblem');
    const { pool } = require('../config/pgdb');

    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });

    const title = problem.title;
    await problem.deleteOne();

    // Sync with PostgreSQL
    try {
      await pool.query('DELETE FROM coding_problems WHERE title = $1', [title]);
    } catch (pgErr) {
      console.error('PostgreSQL Sync Error (Delete):', pgErr.message);
    }

    res.json({ success: true, message: 'Coding problem deleted.' });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/admin/coding-problems
// ── @desc    Get ALL coding problems
exports.getAllCodingProblems = async (req, res, next) => {
  try {
    const CodingProblem = require('../models/CodingProblem');
    const problems = await CodingProblem.find().sort({ createdAt: -1 });
    res.json({ success: true, problems });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/admin/coding-problems
// ── @desc    Create a new coding problem
exports.createCodingProblem = async (req, res, next) => {
  try {
    const CodingProblem = require('../models/CodingProblem');
    const { pool } = require('../config/pgdb');

    const problem = await CodingProblem.create({ ...req.body, createdBy: req.user.id });

    // Sync with PostgreSQL for the Coding Practice section
    try {
      const sampleInput = problem.examples && problem.examples[0] ? problem.examples[0].input : '';
      const sampleOutput = problem.examples && problem.examples[0] ? problem.examples[0].output : '';
      
      await pool.query(
        'INSERT INTO coding_problems (title, description, sample_input, sample_output) VALUES ($1, $2, $3, $4)',
        [problem.title, problem.description, sampleInput, sampleOutput]
      );
    } catch (pgErr) {
      console.error('PostgreSQL Sync Error (Create):', pgErr.message);
    }

    res.status(201).json({ success: true, message: 'Coding problem created.', problem });
  } catch (err) {
    next(err);
  }
};


// ── @route   GET /api/admin/students/:id/progress
// ── @desc    Get specific student progress & attempts
exports.getStudentProgress = async (req, res, next) => {
  try {
    let progress = await Progress.findOne({ user: req.params.id })
      .populate('user', 'name email college branch year cgpa')
      .populate('testAttempts.test', 'title category');
    
    if (!progress) {
      // If no progress doc, at least return the user info with zeroed stats
      const user = await User.findById(req.params.id).select('name email college branch year cgpa');
      if (!user) return res.status(404).json({ success: false, message: 'Student not found.' });
      
      progress = {
        user,
        totalTestsAttempted: 0,
        totalTestsPassed: 0,
        averageScore: 0,
        testAttempts: []
      };
    }
    
    res.json({ success: true, progress });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/admin/students
// ── @desc    Manually create a student account
exports.createStudent = async (req, res, next) => {
  try {
    const { name, email, password, college, branch, year } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    const student = await User.create({
      name,
      email,
      password,
      college,
      branch,
      year,
      role: 'student'
    });

    res.status(201).json({ success: true, message: 'Student account created.', student });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/admin/create-admin
// ── @desc    Create another admin account
exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    const admin = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ success: true, message: 'Admin account created.', admin });
  } catch (err) {
    next(err);
  }
};
