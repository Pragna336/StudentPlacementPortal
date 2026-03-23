const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options:      [{ type: String }],         // For MCQ
  correctAnswer:{ type: String, required: true }, // option text or answer
  explanation:  { type: String, default: '' },
  marks:        { type: Number, default: 1 },
  difficulty:   { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  type:         { type: String, enum: ['MCQ', 'True/False', 'Subjective'], default: 'MCQ' },
});

const testSchema = new mongoose.Schema(
  {
    title:       { type: String, required: [true, 'Test title is required'], trim: true },
    description: { type: String, default: '' },
    category:    {
      type: String,
      enum: ['Aptitude', 'Coding', 'Technical', 'HR', 'Mock', 'Company-Specific'],
      required: true,
    },
    difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    questions:   [questionSchema],
    totalMarks:  { type: Number, default: 0 },
    duration:    { type: Number, required: true }, // in minutes
    passingScore:{ type: Number, default: 40 },    // percentage
    tags:        [{ type: String }],
    company:     { type: String, default: '' },    // for company-specific tests
    isActive:    { type: Boolean, default: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attemptCount:{ type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-calculate totalMarks before save
testSchema.pre('save', function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  }
  next();
});

module.exports = mongoose.model('Test', testSchema);
