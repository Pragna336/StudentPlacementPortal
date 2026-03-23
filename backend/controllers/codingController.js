const CodingProblem = require('../models/CodingProblem');

// ── @route  GET /api/coding
// ── @desc   Get all active coding problems (hides test cases + solutions)
// ── @access Private
exports.getAllProblems = async (req, res, next) => {
  try {
    const query = { isActive: true };
    if (req.query.difficulty) query.difficulty = req.query.difficulty;
    if (req.query.category)   query.category   = req.query.category;
    if (req.query.search) {
      query.$or = [
        { title:       { $regex: req.query.search, $options: 'i' } },
        { tags:        { $in: [new RegExp(req.query.search, 'i')] } },
        { companies:   { $in: [new RegExp(req.query.search, 'i')] } },
      ];
    }

    const problems = await CodingProblem.find(query)
      .select('-testCases -solution -starterCode.python -starterCode.javascript -starterCode.java -starterCode.cpp -starterCode.c')
      .sort({ difficulty: 1, createdAt: -1 });

    // Add difficulty order for sorting
    const order = { Easy: 1, Medium: 2, Hard: 3 };
    problems.sort((a, b) => order[a.difficulty] - order[b.difficulty]);

    res.json({ success: true, count: problems.length, problems });
  } catch (err) {
    next(err);
  }
};

// ── @route  GET /api/coding/:id
// ── @desc   Get one problem (includes starter code + visible test cases)
// ── @access Private
exports.getProblem = async (req, res, next) => {
  try {
    const problem = await CodingProblem.findOne({
      $or: [{ _id: req.params.id.length === 24 ? req.params.id : null }, { slug: req.params.id }],
      isActive: true,
    }).select('-solution -testCases.isHidden');

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }

    // Only send visible test cases to students
    const visibleTestCases = problem.testCases.filter((tc) => !tc.isHidden);
    const result = problem.toObject();
    result.testCases = visibleTestCases;

    res.json({ success: true, problem: result });
  } catch (err) {
    next(err);
  }
};

// ── @route  POST /api/coding   (Admin)
// ── @desc   Create a coding problem
// ── @access Private/Admin
exports.createProblem = async (req, res, next) => {
  try {
    // Auto-generate slug from title
    if (!req.body.slug && req.body.title) {
      req.body.slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
    }
    req.body.createdBy = req.user._id;
    const problem = await CodingProblem.create(req.body);
    res.status(201).json({ success: true, message: 'Problem created.', problem });
  } catch (err) {
    next(err);
  }
};

// ── @route  PUT /api/coding/:id   (Admin)
exports.updateProblem = async (req, res, next) => {
  try {
    const problem = await CodingProblem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });
    res.json({ success: true, problem });
  } catch (err) {
    next(err);
  }
};

// ── @route  DELETE /api/coding/:id   (Admin)
exports.deleteProblem = async (req, res, next) => {
  try {
    await CodingProblem.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Problem deactivated.' });
  } catch (err) {
    next(err);
  }
};
