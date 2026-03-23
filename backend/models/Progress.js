const mongoose = require('mongoose');

// One document per user – stores all their test attempts & overall stats
const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // ── Overall Stats ────────────────────────────────────────────
    totalTestsAttempted: { type: Number, default: 0 },
    totalTestsPassed:    { type: Number, default: 0 },
    totalScore:          { type: Number, default: 0 },    // cumulative score
    averageScore:        { type: Number, default: 0 },    // percentage
    currentStreak:       { type: Number, default: 0 },    // days
    longestStreak:       { type: Number, default: 0 },
    lastActiveDate:      { type: Date, default: null },

    // ── Category-wise Scores ─────────────────────────────────────
    categoryStats: {
      Aptitude:  { attempted: { type: Number, default: 0 }, avgScore: { type: Number, default: 0 } },
      Coding:    { attempted: { type: Number, default: 0 }, avgScore: { type: Number, default: 0 } },
      Technical: { attempted: { type: Number, default: 0 }, avgScore: { type: Number, default: 0 } },
      HR:        { attempted: { type: Number, default: 0 }, avgScore: { type: Number, default: 0 } },
      Mock:      { attempted: { type: Number, default: 0 }, avgScore: { type: Number, default: 0 } },
    },

    // ── Test Attempt History ─────────────────────────────────────
    testAttempts: [
      {
        test:        { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
        testTitle:   { type: String },
        category:    { type: String },
        score:       { type: Number },       // marks obtained
        totalMarks:  { type: Number },
        percentage:  { type: Number },
        passed:      { type: Boolean },
        timeTaken:   { type: Number },       // seconds
        answers: [
          {
            questionId: { type: mongoose.Schema.Types.ObjectId },
            selectedAnswer: { type: String },
            isCorrect: { type: Boolean },
          },
        ],
        attemptedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Badges & Achievements ────────────────────────────────────
    badges: [
      {
        name:      { type: String },
        icon:      { type: String },
        awardedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Progress', progressSchema);
