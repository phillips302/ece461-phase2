import { Pool } from 'pg';
import dotenv from 'dotenv';

import console from 'console';
import process from 'process';

dotenv.config();

// If using environment variables, ensure they've been set or loaded by dotenv
export const pool = new Pool({
  host: process.env.RDS_ENDPOINT,
  port: 5432, // Default PostgreSQL port
  database: process.env.RDS_DATABASE,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD
});

export async function testConnection() {
  console.log('Testing connection to PostgreSQL');
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT NOW() AS current_time;');
    console.log('Current time from DB:', res.rows[0].current_time);
  } catch (error) {
    console.error('Error executing query', error);
  } finally {
    client.release();
  }
}

testConnection();
