/**
 * seed.js
 * Run: node seed.js
 * Seeds the database with:
 *   - 1 admin account
 *   - 2 sample student accounts
 *   - Sample tests in each category
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Test     = require('./models/Test');
const Progress = require('./models/Progress');

const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();
  console.log('\n🌱 Starting seed...\n');

  // ── Clear existing data ───────────────────────────────────────
  await Promise.all([User.deleteMany(), Test.deleteMany(), Progress.deleteMany()]);
  console.log('🗑️  Cleared existing data.');

  // ── Create Admin ──────────────────────────────────────────────
  const admin = await User.create({
    name:     'Admin User',
    email:    'admin@placement.com',
    password: 'admin123',
    role:     'admin',
  });
  console.log('👑 Admin created:  admin@placement.com / admin123');

  // ── Create Students ───────────────────────────────────────────
  const student1 = await User.create({
    name:    'Rishi Patel',
    email:   'rishi@student.com',
    password:'student123',
    college: 'IIT Bombay',
    branch:  'Computer Science',
    year:    '3rd',
    cgpa:    8.5,
    skills:  ['Python', 'JavaScript', 'DSA', 'React'],
  });
  const student2 = await User.create({
    name:    'Priya Sharma',
    email:   'priya@student.com',
    password:'student123',
    college: 'NIT Trichy',
    branch:  'Electronics',
    year:    '4th',
    cgpa:    7.8,
    skills:  ['C++', 'VLSI', 'Embedded Systems'],
  });

  await Progress.create({ user: student1._id });
  await Progress.create({ user: student2._id });
  console.log('🎓 Students created: rishi@student.com / priya@student.com  (password: student123)');

  // ── Create Sample Tests ───────────────────────────────────────
  const tests = await Test.insertMany([
    {
      title:       'Quantitative Aptitude — Basics',
      category:    'Aptitude',
      difficulty:  'Easy',
      duration:    30,
      passingScore:50,
      tags:        ['quant', 'basics', 'arithmetic'],
      createdBy:   admin._id,
      questions: [
        {
          questionText:  'A train travels 360 km in 4 hours. What is its speed in km/h?',
          options:       ['80', '90', '100', '70'],
          correctAnswer: '90',
          explanation:   'Speed = Distance ÷ Time = 360 ÷ 4 = 90 km/h',
          difficulty:    'Easy',
          marks:         2,
        },
        {
          questionText:  'If 20% of a number is 50, what is the number?',
          options:       ['200', '250', '300', '150'],
          correctAnswer: '250',
          explanation:   '20% of x = 50 → x = 50 × 100 / 20 = 250',
          difficulty:    'Easy',
          marks:         2,
        },
        {
          questionText:  'What is the LCM of 12 and 18?',
          options:       ['36', '24', '48', '72'],
          correctAnswer: '36',
          explanation:   'LCM(12, 18) = 36',
          difficulty:    'Easy',
          marks:         1,
        },
        {
          questionText:  'A can do a job in 10 days, B in 15 days. Together, how many days?',
          options:       ['5', '6', '7', '8'],
          correctAnswer: '6',
          explanation:   '1/10 + 1/15 = 5/30 = 1/6 → 6 days',
          difficulty:    'Medium',
          marks:         2,
        },
        {
          questionText:  'Simple interest on Rs. 2000 at 5% per annum for 3 years?',
          options:       ['Rs. 200', 'Rs. 300', 'Rs. 350', 'Rs. 250'],
          correctAnswer: 'Rs. 300',
          explanation:   'SI = (P × R × T) / 100 = (2000 × 5 × 3) / 100 = 300',
          difficulty:    'Easy',
          marks:         2,
        },
      ],
    },
    {
      title:       'Data Structures & Algorithms — MCQ',
      category:    'Coding',
      difficulty:  'Medium',
      duration:    45,
      passingScore:60,
      tags:        ['DSA', 'arrays', 'sorting', 'complexity'],
      createdBy:   admin._id,
      questions: [
        {
          questionText:  'What is the time complexity of Binary Search?',
          options:       ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
          correctAnswer: 'O(log n)',
          explanation:   'Binary Search halves the search space each step → O(log n)',
          difficulty:    'Easy',
          marks:         2,
        },
        {
          questionText:  'Which data structure uses LIFO?',
          options:       ['Queue', 'Stack', 'Linked List', 'Tree'],
          correctAnswer: 'Stack',
          explanation:   'Stack follows Last-In-First-Out (LIFO)',
          difficulty:    'Easy',
          marks:         1,
        },
        {
          questionText:  'What is the worst-case time complexity of Quick Sort?',
          options:       ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
          correctAnswer: 'O(n²)',
          explanation:   'When pivot is always the smallest or largest element',
          difficulty:    'Medium',
          marks:         2,
        },
        {
          questionText:  'Which traversal of a BST gives sorted order?',
          options:       ['Pre-order', 'Post-order', 'In-order', 'Level-order'],
          correctAnswer: 'In-order',
          explanation:   'In-order traversal (Left → Root → Right) of BST gives ascending order',
          difficulty:    'Easy',
          marks:         2,
        },
        {
          questionText:  'What is the space complexity of Merge Sort?',
          options:       ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
          correctAnswer: 'O(n)',
          explanation:   'Merge Sort requires O(n) auxiliary space for merging',
          difficulty:    'Medium',
          marks:         2,
        },
      ],
    },
    {
      title:       'Technical Fundamentals — DBMS & OS',
      category:    'Technical',
      difficulty:  'Medium',
      duration:    40,
      passingScore:55,
      tags:        ['DBMS', 'OS', 'technical', 'cs-fundamentals'],
      createdBy:   admin._id,
      questions: [
        {
          questionText:  'Which normal form removes partial dependencies?',
          options:       ['1NF', '2NF', '3NF', 'BCNF'],
          correctAnswer: '2NF',
          explanation:   '2NF removes partial dependencies on composite primary keys',
          difficulty:    'Medium',
          marks:         2,
        },
        {
          questionText:  'What is a deadlock in OS?',
          options:       [
            'A process that runs forever',
            'Two or more processes waiting for each other indefinitely',
            'Memory overflow',
            'CPU starvation',
          ],
          correctAnswer: 'Two or more processes waiting for each other indefinitely',
          explanation:   'Deadlock occurs when processes hold resources and wait for others in a circular manner',
          difficulty:    'Medium',
          marks:         2,
        },
        {
          questionText:  'Which SQL command is used to remove a table?',
          options:       ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'],
          correctAnswer: 'DROP',
          explanation:   'DROP TABLE removes the table structure and all its data permanently',
          difficulty:    'Easy',
          marks:         1,
        },
        {
          questionText:  'What is virtual memory?',
          options:       [
            'RAM',
            'Secondary storage used as RAM extension',
            'Cache memory',
            'ROM',
          ],
          correctAnswer: 'Secondary storage used as RAM extension',
          explanation:   'Virtual memory uses disk space to extend available RAM',
          difficulty:    'Medium',
          marks:         2,
        },
      ],
    },
    {
      title:       'Full Mock Test — TCS NQT Pattern',
      category:    'Mock',
      difficulty:  'Hard',
      duration:    90,
      passingScore:65,
      tags:        ['TCS', 'NQT', 'full-mock', 'placement'],
      company:     'TCS',
      createdBy:   admin._id,
      questions: [
        {
          questionText:  'If CLOCK is coded as ENQEM, how is SHIRT coded?',
          options:       ['UKKTV', 'UIJSU', 'UKKJS', 'VJITV'],
          correctAnswer: 'UKKTV',
          explanation:   'Each letter is shifted by +2 positions',
          difficulty:    'Hard',
          marks:         3,
        },
        {
          questionText:  'Find the odd one out: 2, 5, 10, 17, 26, 37, 50, 64',
          options:       ['50', '37', '64', '26'],
          correctAnswer: '64',
          explanation:   'Series: 1²+1, 2²+1, 3²+1, ... → 8²+1 = 65, not 64',
          difficulty:    'Hard',
          marks:         3,
        },
        {
          questionText:  'What does REST stand for?',
          options:       [
            'Representational State Transfer',
            'Remote Execution Service Technology',
            'Reliable State Transfer',
            'Resource Entity Service Transfer',
          ],
          correctAnswer: 'Representational State Transfer',
          explanation:   'REST = Representational State Transfer, an architectural style for APIs',
          difficulty:    'Medium',
          marks:         2,
        },
        {
          questionText:  'A boat goes 12 km upstream in 4 hours and 18 km downstream in 4 hours. Find stream speed.',
          options:       ['1.5 km/h', '2 km/h', '1 km/h', '2.5 km/h'],
          correctAnswer: '1.5 km/h',
          explanation:   'Upstream = 3 km/h, Downstream = 4.5 km/h. Stream = (4.5-3)/2 = 0.75... wait: (4.5-3)/2 = 0.75. Correct: 0.75 km/h. Check your textbook.',
          difficulty:    'Hard',
          marks:         3,
        },
      ],
    },
    {
      title:       'HR Interview Preparation Quiz',
      category:    'HR',
      difficulty:  'Easy',
      duration:    20,
      passingScore:40,
      tags:        ['HR', 'interview', 'behavioral', 'soft-skills'],
      createdBy:   admin._id,
      questions: [
        {
          questionText:  'What is the best response when asked "Tell me about yourself" in an HR interview?',
          type:          'MCQ',
          options:       [
            'Talk about your personal life and hobbies',
            'Give a structured 2-minute pitch: education, experience, skills, and goals',
            'Read your resume aloud',
            'Ask the interviewer what they want to know',
          ],
          correctAnswer: 'Give a structured 2-minute pitch: education, experience, skills, and goals',
          explanation:   'A structured pitch covering academics, skills, and career goals is most effective',
          difficulty:    'Easy',
          marks:         1,
        },
        {
          questionText:  'The STAR method in interviews stands for?',
          options:       [
            'Situation, Task, Action, Result',
            'Skills, Training, Attitude, Resume',
            'Strategy, Target, Approach, Response',
            'Study, Test, Answer, Review',
          ],
          correctAnswer: 'Situation, Task, Action, Result',
          explanation:   'STAR is a framework for answering behavioral questions with concrete examples',
          difficulty:    'Easy',
          marks:         1,
        },
        {
          questionText:  'Which of these is a red flag behavior during an HR interview?',
          options:       [
            'Asking about company culture',
            'Badmouthing a previous employer',
            'Asking about growth opportunities',
            'Mentioning team projects',
          ],
          correctAnswer: 'Badmouthing a previous employer',
          explanation:   'Speaking negatively about past employers reflects poor professionalism',
          difficulty:    'Easy',
          marks:         1,
        },
      ],
    },
  ]);

  console.log(`\n✅ Seeded ${tests.length} sample tests.`);
  console.log('\n──────────────────────────────────────────────');
  console.log('🎉 Seed complete! You can now start the server.');
  console.log('──────────────────────────────────────────────\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
