const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'placement_portal',
  password: process.env.PG_PASSWORD || 'postgres',
  port: process.env.PG_PORT || 5432,
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        branch VARCHAR(50),
        year VARCHAR(20)
      );

      CREATE TABLE IF NOT EXISTS coding_problems (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        sample_input TEXT,
        sample_output TEXT
      );

      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES students(id),
        problem_id INT REFERENCES coding_problems(id),
        code TEXT NOT NULL,
        language VARCHAR(50) DEFAULT 'python',
        result VARCHAR(50) NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed/Update coding problems
    const problems = [
      ['Two Sum', 'Given an array of integers followed by a target, return true if two numbers add up to target, else false.', '2 7 11 15 9', 'True'],
      ['Palindrome Check', 'Given a string, print True if it is a palindrome, else False.', 'racecar', 'True'],
      ['Reverse String', 'Given a string, print its reverse.', 'hello', 'olleh'],
      ['Factorial', 'Print the factorial of a given number n.', '5', '120'],
      ['Maximum Element', 'Given an array of integers, print the maximum element.', '1 5 3 9 2', '9'],
      ['Even or Odd', 'Given a number, print Even if it is even, otherwise print Odd.', '4', 'Even']
    ];


    for (const p of problems) {
      // Upsert: Try to update if title exists, else insert
      const res = await pool.query('UPDATE coding_problems SET description=$2, sample_input=$3, sample_output=$4 WHERE title=$1 RETURNING *', p);
      if (res.rowCount === 0) {
        await pool.query('INSERT INTO coding_problems (title, description, sample_input, sample_output) VALUES ($1, $2, $3, $4)', p);
      }
    }
    console.log('DSA coding problems synchronized successfully.');



    console.log('PostgreSQL Tables initialized successfully.');
  } catch (err) {
    console.error('Error initializing PostgreSQL tables:', err.message);
  }
};

module.exports = { pool, initDB };
