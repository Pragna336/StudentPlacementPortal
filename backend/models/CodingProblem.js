const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input:          { type: String, default: '' },
  expectedOutput: { type: String, required: true },
  isHidden:       { type: Boolean, default: false },  // hidden test cases not shown to student
  explanation:    { type: String, default: '' },
});

const codingProblemSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    category:    {
      type: String,
      enum: ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'DP', 'Math', 'Sorting', 'Searching', 'Stack/Queue'],
      default: 'Arrays',
    },
    tags:         [{ type: String }],
    constraints:  { type: String, default: '' },      // e.g. "1 ≤ n ≤ 10^5"
    inputFormat:  { type: String, default: '' },
    outputFormat: { type: String, default: '' },
    examples: [
      {
        input:       { type: String },
        output:      { type: String },
        explanation: { type: String },
      },
    ],
    testCases:     [testCaseSchema],
    hints:         [{ type: String }],
    companies:     [{ type: String }],               // which companies asked this

    // Starter code templates per language
    starterCode: {
      python:     { type: String, default: '' },
      javascript: { type: String, default: '' },
      java:       { type: String, default: '' },
      cpp:        { type: String, default: '' },
      c:          { type: String, default: '' },
    },

    // Solution code (admin only, never sent to student)
    solution: {
      python:     { type: String, default: '' },
      javascript: { type: String, default: '' },
    },

    isActive:      { type: Boolean, default: true },
    solvedBy:      { type: Number, default: 0 },     // count of users who solved
    attemptedBy:   { type: Number, default: 0 },
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CodingProblem', codingProblemSchema);
