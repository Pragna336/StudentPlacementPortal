const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Basic Info ──────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never return password in queries
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },

    // ── Academic Info ───────────────────────────────────────────
    college: { type: String, trim: true, default: '' },
    branch:  { type: String, trim: true, default: '' },
    year:    { type: String, enum: ['1st', '2nd', '3rd', '4th', 'Alumni', ''], default: '' },
    cgpa:    { type: Number, min: 0, max: 10, default: null },
    rollNo:  { type: String, trim: true, default: '' },

    // ── Profile ─────────────────────────────────────────────────
    avatar:  { type: String, default: '' },
    bio:     { type: String, maxlength: 300, default: '' },
    phone:   { type: String, default: '' },
    linkedin:{ type: String, default: '' },
    github:  { type: String, default: '' },
    resumeUrl: { type: String, default: '' },

    // ── Skills & Goals ───────────────────────────────────────────
    skills: [{ type: String }],
    targetCompanies: [{ type: String }],
    targetRole: { type: String, default: '' },

    // ── Status ───────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isPlaced: { type: Boolean, default: false },
    placedAt:  { type: String, default: '' },
    placedPackage: { type: Number, default: null }, // in LPA

    // ── Auth ─────────────────────────────────────────────────────
    lastLogin: { type: Date, default: null },
    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// ── Hash password before save ─────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Compare entered password with hashed ──────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Remove sensitive fields from JSON output ──────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
