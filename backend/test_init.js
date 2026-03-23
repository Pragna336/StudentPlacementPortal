const { pool, initDB } = require('./config/pgdb');

async function test() {
  try {
    const res = await pool.query('SELECT 1');
    console.log('Postgres ping:', res.rows[0]);
    await initDB();
    const problems = await pool.query('SELECT * FROM coding_problems');
    console.log('Problems:', problems.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}
test();
