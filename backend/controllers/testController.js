const Test     = require('../models/Test');
const Progress = require('../models/Progress');

// ── @route   GET /api/tests
// ── @desc    Get all active tests (with filters)
// ── @access  Private
exports.getAllTests = async (req, res, next) => {
  try {
    const query = { isActive: true };

    if (req.query.category)   query.category   = req.query.category;
    if (req.query.difficulty) query.difficulty  = req.query.difficulty;
    if (req.query.company)    query.company     = { $regex: req.query.company, $options: 'i' };
    if (req.query.search) {
      query.$or = [
        { title:       { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags:        { $in:    [new RegExp(req.query.search, 'i')] } },
      ];
    }

    const tests = await Test.find(query)
      .select('-questions.correctAnswer -questions.explanation') // hide answers in list
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tests.length, tests });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/tests/:id
// ── @desc    Get single test (hide answers until submitted)
// ── @access  Private
exports.getTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id)
      .select('-questions.correctAnswer -questions.explanation');

    if (!test || !test.isActive) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    res.json({ success: true, test });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/tests/:id/submit
// ── @desc    Submit test answers + get results + update progress
// ── @access  Private
exports.submitTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test || !test.isActive) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    const { answers, timeTaken } = req.body;
    // answers: [{ questionId, selectedAnswer }]

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array is required.' });
    }

    // ── Grade the test ─────────────────────────────────────────
    let score = 0;
    const gradedAnswers = test.questions.map((q) => {
      const submitted = answers.find((a) => a.questionId === q._id.toString());
      const isCorrect = submitted && submitted.selectedAnswer === q.correctAnswer;
      if (isCorrect) score += q.marks || 1;

      return {
        questionId:      q._id,
        questionText:    q.questionText,
        selectedAnswer:  submitted ? submitted.selectedAnswer : null,
        correctAnswer:   q.correctAnswer,
        explanation:     q.explanation,
        isCorrect:       !!isCorrect,
        marks:           isCorrect ? (q.marks || 1) : 0,
      };
    });

    const totalMarks  = test.totalMarks || test.questions.length;
    const percentage  = Math.round((score / totalMarks) * 100);
    const passed      = percentage >= (test.passingScore || 40);

    // ── Update attempt count on test ───────────────────────────
    test.attemptCount += 1;
    await test.save();

    // ── Update student progress ────────────────────────────────
    let progress = await Progress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await Progress.create({ user: req.user._id });
    }

    const attemptEntry = {
      test:       test._id,
      testTitle:  test.title,
      category:   test.category,
      score,
      totalMarks,
      percentage,
      passed,
      timeTaken:  timeTaken || 0,
      answers:    answers.map((a) => ({
        questionId:     a.questionId,
        selectedAnswer: a.selectedAnswer,
        isCorrect:      gradedAnswers.find((g) => g.questionId.toString() === a.questionId)?.isCorrect || false,
      })),
    };

    progress.testAttempts.push(attemptEntry);
    progress.totalTestsAttempted += 1;
    if (passed) progress.totalTestsPassed += 1;
    progress.totalScore += score;
    progress.averageScore = Math.round(
      (progress.totalScore / progress.totalTestsAttempted / totalMarks) * 100
    );

    // ── Category stats ────────────────────────────────────────
    const cat = test.category;
    if (progress.categoryStats[cat]) {
      const catStats = progress.categoryStats[cat];
      catStats.avgScore = Math.round(
        ((catStats.avgScore * catStats.attempted) + percentage) / (catStats.attempted + 1)
      );
      catStats.attempted += 1;
    }

    // ── Streak logic ──────────────────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = progress.lastActiveDate
      ? new Date(progress.lastActiveDate).setHours(0, 0, 0, 0)
      : null;

    if (!lastActive || lastActive < today.getTime()) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastActive && lastActive === yesterday.getTime()) {
        progress.currentStreak += 1;
      } else {
        progress.currentStreak = 1;
      }
      if (progress.currentStreak > progress.longestStreak) {
        progress.longestStreak = progress.currentStreak;
      }
    }
    progress.lastActiveDate = new Date();

    // ── Award badges ──────────────────────────────────────────
    const badges = [];
    if (progress.totalTestsAttempted === 1) badges.push({ name: 'First Test', icon: '🎯' });
    if (progress.totalTestsAttempted === 10) badges.push({ name: 'Dedicated Learner', icon: '📚' });
    if (percentage === 100) badges.push({ name: 'Perfect Score', icon: '💯' });
    if (progress.currentStreak === 7) badges.push({ name: '7-Day Streak', icon: '🔥' });

    for (const badge of badges) {
      const alreadyHas = progress.badges.some((b) => b.name === badge.name);
      if (!alreadyHas) progress.badges.push(badge);
    }

    await progress.save();

    res.json({
      success: true,
      message: passed ? '🎉 Test passed!' : 'Test submitted.',
      result: {
        score,
        totalMarks,
        percentage,
        passed,
        timeTaken: timeTaken || 0,
        newBadges: badges,
        gradedAnswers,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/tests   (Admin)
// ── @desc    Create a new test
// ── @access  Private/Admin
exports.createTest = async (req, res, next) => {
  try {
    const testData = { ...req.body, createdBy: req.user._id };
    const test     = await Test.create(testData);
    res.status(201).json({ success: true, message: 'Test created successfully.', test });
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/tests/:id   (Admin)
// ── @desc    Update a test
// ── @access  Private/Admin
exports.updateTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found.' });
    res.json({ success: true, message: 'Test updated.', test });
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/tests/:id   (Admin)
// ── @desc    Soft-delete a test
// ── @access  Private/Admin
exports.deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!test) return res.status(404).json({ success: false, message: 'Test not found.' });
    res.json({ success: true, message: 'Test removed.' });
  } catch (err) {
    next(err);
  }
};
