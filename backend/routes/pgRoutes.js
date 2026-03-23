const express = require('express');
const { pool } = require('../config/pgdb');
const runCode = require('../compiler');
const bcrypt = require('bcryptjs');

const router = express.Router();

// 1. POST /api/register
router.post('/register', async (req, res) => {
  const { name, email, password, branch, year } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = await pool.query(
      'INSERT INTO students (name, email, password, branch, year) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, hashedPassword, branch, year]
    );

    res.status(201).json({ success: true, user: newStudent.rows[0], message: 'Student registered successfully' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const studentQuery = await pool.query('SELECT * FROM students WHERE email = $1', [email]);
    if (studentQuery.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const student = studentQuery.rows[0];
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Since we don't have JWT implemented in this subset, just returning user info
    res.json({ success: true, user: student, message: 'Logged in successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/coding-problems', async (req, res) => {
  const standardProblems = [
    { id: 1, title: 'Two Sum', description: 'Given an array of integers followed by a target, return true if two numbers add up to target, else false.', sample_input: '2 7 11 15 9', sample_output: 'True' },
    { id: 2, title: 'Palindrome Check', description: 'Given a string, print True if it is a palindrome, else False.', sample_input: 'racecar', sample_output: 'True' },
    { id: 3, title: 'Reverse String', description: 'Given a string, print its reverse.', sample_input: 'hello', sample_output: 'olleh' },
    { id: 4, title: 'Factorial', description: 'Print the factorial of a given number n.', sample_input: '5', sample_output: '120' },
    { id: 5, title: 'Maximum Element', description: 'Given an array of integers, print the maximum element.', sample_input: '1 5 3 9 2', sample_output: '9' },
    { id: 6, title: 'Even or Odd', description: 'Given a number, print Even if it is even, otherwise print Odd.', sample_input: '4', sample_output: 'Even' }
  ];

  try {
    const problems = await pool.query('SELECT * FROM coding_problems ORDER BY id ASC');
    // Combine standard with DB problems if unique
    const dbRows = problems.rows;
    const combined = [...standardProblems];
    dbRows.forEach(row => {
      if (!combined.find(p => p.title === row.title)) combined.push(row);
    });
    res.json({ success: true, problems: combined });
  } catch (error) {
    console.error('PostgreSQL Connection Failed for /coding-problems, trying MongoDB...');
    
    try {
      const CodingProblem = require('../models/CodingProblem');
      const mongoProblems = await CodingProblem.find().sort({ createdAt: -1 });
      
      const formattedProblems = mongoProblems.map((p) => ({
        id: p.id || p._id.toString(),
        title: p.title,
        description: p.description,
        difficulty: p.difficulty || 'Easy',
        category: p.category || 'General',
        constraints: p.constraints || '',
        examples: p.examples || [],
        starterCode: p.starterCode || {},
        sample_input: p.examples && p.examples[0] ? p.examples[0].input : '',
        sample_output: p.examples && p.examples[0] ? p.examples[0].output : ''
      }));

      // Merge standard with MongoDB problems
      const combined = [...standardProblems];
      formattedProblems.forEach(p => {
        if (!combined.find(cp => cp.title === p.title)) combined.push(p);
      });
      
      return res.json({ success: true, problems: combined });
    } catch (mongoError) {
      console.error('MongoDB Fallback failed too:', mongoError.message);
    }

    res.json({ success: true, problems: standardProblems });
  }
});



// 4. POST /api/submit-code
router.post('/submit-code', async (req, res) => {
  const { student_id, problem_id, code, language = 'python' } = req.body;

  try {
    let expectedOutput = 'True'; // Default offline fallback
    let sampleInput = '';      // Default offline fallback
    
    try {
      // Get the input and expected output for the given problem
      const problemQuery = await pool.query('SELECT sample_input, sample_output FROM coding_problems WHERE id = $1', [problem_id]);
      if (problemQuery.rows.length > 0) {
        sampleInput = (problemQuery.rows[0].sample_input || '').trim();
        expectedOutput = (problemQuery.rows[0].sample_output || '').trim();
      } else {
        // Handle fallback logic for specific hardcoded IDs if postgres query fails or returns nothing
        const fallbacks = {
          1: { input: '[2, 7, 11, 15], 9', output: 'True' },
          2: { input: 'racecar', output: 'True' },
          3: { input: '5', output: '5' },
          4: { input: '4', output: 'Even' }
        };
        if (fallbacks[problem_id]) {
          sampleInput = fallbacks[problem_id].input;
          expectedOutput = fallbacks[problem_id].output;
        }
      }
    } catch (pgError) {
      console.log('Postgres offline or query error: using fallback logic');
      // Simple hardcoded mapping for demo completeness
      const fallbacks = {
        1: { input: '2 7 11 15 9', output: 'True' },
        2: { input: 'racecar', output: 'True' },
        3: { input: 'hello', output: 'olleh' },
        4: { input: '5', output: '120' },
        5: { input: '1 5 3 9 2', output: '9' },
        6: { input: '4', output: 'Even' }
      };
      if (fallbacks[problem_id]) {
        sampleInput = fallbacks[problem_id].input;
        expectedOutput = fallbacks[problem_id].output;
      }
    }


    const fs = require('fs');
    fs.appendFileSync('debug.log', `[${new Date().toISOString()}] Submitting ${language} for problem ${problem_id}\n`);
    
    const execution = await runCode(language, code, sampleInput);
    
    fs.appendFileSync('debug.log', `[${new Date().toISOString()}] Execution Result: ${JSON.stringify(execution)}\n`);


    let result = 'Error';
    let finalOutput = '';

    if (!execution.success) {
      result = 'Error';
      finalOutput = execution.message || 'Execution failed to start.';
    } else {
      switch (execution.status) {
        case 'compile_error':
          result = 'Compilation Error';
          finalOutput = execution.output || 'Compilation failed with no details.';
          break;
        case 'runtime_error':
          result = 'Runtime Error';
          finalOutput = execution.output || 'Runtime error occurred.';
          break;
        case 'success':
          const cleanActual = (execution.stdout || '').trim();
          finalOutput = cleanActual;
          if (cleanActual === expectedOutput) {
            result = 'Accepted';
          } else {
            result = 'Wrong Answer';
          }
          break;
        default:
          result = 'Error';
          finalOutput = 'Unknown execution status: ' + execution.status;
      }
    }


    let submissionObj = null;
    try {
      const submission = await pool.query(
        'INSERT INTO submissions (student_id, problem_id, code, language, result) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [student_id || null, problem_id, code, language, result]
      );
      submissionObj = submission.rows[0];
    } catch (pgError) {
      console.error('Postgres submission error:', pgError.message);
      submissionObj = {
          id: Date.now(), problem_id, result, code, language
      };
    }

    res.json({
      success: true,
      output: finalOutput,
      result: result,
      submission: submissionObj
    });


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. GET /api/submissions
router.get('/submissions', async (req, res) => {
  const { student_id } = req.query;
  try {
    let query = `
      SELECT s.*, p.title as problem_title 
      FROM submissions s
      JOIN coding_problems p ON s.problem_id = p.id
    `;
    let values = [];

    if (student_id) {
      query += ' WHERE s.student_id = $1';
      values.push(student_id);
    }
    
    query += ' ORDER BY s.submitted_at DESC';

    const submissions = await pool.query(query, values);
    res.json({ success: true, submissions: submissions.rows });
  } catch (error) {
    console.error('PostgreSQL Error in /submissions:', error.message);
    res.json({ success: true, submissions: [] });
  }
});

module.exports = router;
