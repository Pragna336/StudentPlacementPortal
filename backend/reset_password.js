const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

/**
 * RESET PASSWORD TOOL
 * Replace the values below and run: node reset_password.js
 */
const TARGET_EMAIL = 'test@test.com'; // Change this to the user's email
const NEW_PASSWORD = 'password123';    // Change this to the desired password

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const user = await User.findOne({ email: TARGET_EMAIL.toLowerCase() });
    
    if (!user) {
      console.error(`Error: User with email "${TARGET_EMAIL}" not found.`);
      process.exit(1);
    }

    console.log(`User found: ${user.name}. Resetting password...`);
    
    user.password = NEW_PASSWORD;
    await user.save(); // This triggers the bcrypt hashing in User.js

    console.log('--------------------------------------------------');
    console.log('✅ SUCCESS: Password has been reset.');
    console.log(`📧 User: ${TARGET_EMAIL}`);
    console.log(`🔑 New Password: ${NEW_PASSWORD}`);
    console.log('--------------------------------------------------');
    
    process.exit(0);
  } catch (err) {
    console.error('Fatal Error:', err.message);
    process.exit(1);
  }
}

resetPassword();
