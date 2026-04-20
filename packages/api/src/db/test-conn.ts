import pg from 'pg';
import 'dotenv/config';

async function testConnection() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Testing connection to:', process.env.DATABASE_URL);
    const client = await pool.connect();
    const res = await client.query('SELECT 1');
    console.log('Connection successful!', res.rows);
    client.release();
  } catch (err: any) {
    console.error('Connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
