import dotenv from 'dotenv';
import { Package } from '../apis/types.js';
import console from 'console';
import mysql from 'mysql2/promise';
import process from 'process';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.RDS_ENDPOINT,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testPoolQuery(): Promise<string | unknown> {
    try {
        // Perform a simple query to check the connection
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        return `connection success: ${JSON.stringify(rows)}`;
      } catch (err) {
        console.error('Database connection failed:', err);
        return err;
    }
}

export async function testClient(): Promise<string | unknown> {
    try {
      // Create the connection
      const connection = await mysql.createConnection({
        host: process.env.RDS_ENDPOINT,
        user: process.env.RDS_USERNAME,
        password: process.env.RDS_PASSWORD,
        database: process.env.RDS_DATABASE,
      });
      const [rows] = await connection.execute('SELECT 1 + 1 AS result');  
      // Close the connection
      await connection.end();
      return `connection success: ${JSON.stringify(rows)}`;
    } catch (err) {
      console.error('Error connecting to the database:', err);
      return err;
    }
}

export async function readAllPackageData(): Promise<string | unknown> {
  try {
    // Create the connection
    const connection = await mysql.createConnection({
      host: process.env.RDS_ENDPOINT,
      user: process.env.RDS_USERNAME,
      password: process.env.RDS_PASSWORD,
      database: process.env.RDS_DATABASE,
    });
    try {
      const [rows] = await connection.execute('SELECT * FROM packages');
      return `connection success: ${JSON.stringify(rows)}`;
    } catch (err) {
      console.error('Database connection failed:', err);
      return `connection error: ${err}`;
    }
  } catch (err) {
    console.error('Error connecting to the database:', err);
    return `connection error: ${err}`;
  }
}
