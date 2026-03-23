const { pool } = require('./config/pgdb');

const seedProblems = async () => {
  const newProblems = [
    {
      title: 'Palindrome Check',
      description: 'Given a string, print "True" if it is a palindrome, otherwise print "False".',
      sample_input: 'racecar',
      sample_output: 'True'
    },
    {
      title: 'Fibonacci Sequence',
      description: 'Print the 5th Fibonacci number (where F(0)=0, F(1)=1).',
      sample_input: '5',
      sample_output: '5'
    },
    {
      title: 'Even or Odd',
      description: 'Given a number, print "Even" if it is even, otherwise print "Odd".',
      sample_input: '4',
      sample_output: 'Even'
    }
  ];

  try {
    const existing = await pool.query('SELECT title FROM coding_problems');
    const existingTitles = existing.rows.map(r => r.title);

    for (let prob of newProblems) {
      if (!existingTitles.includes(prob.title)) {
        await pool.query(
          'INSERT INTO coding_problems (title, description, sample_input, sample_output) VALUES ($1, $2, $3, $4)',
          [prob.title, prob.description, prob.sample_input, prob.sample_output]
        );
        console.log(`Inserted problem: ${prob.title}`);
      } else {
        console.log(`Problem already exists: ${prob.title}`);
      }
    }
    console.log('Seeding done.');
    process.exit(0);
  } catch (err) {
    if (err.message.includes('password authentication failed') || err.message.includes('ECONNREFUSED')) {
      console.log('PostgreSQL is not running or accessible, skipping seed.');
      process.exit(0);
    } else {
      console.error(err);
      process.exit(1);
    }
  }
};

seedProblems();
