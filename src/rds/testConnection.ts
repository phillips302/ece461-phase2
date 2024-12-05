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
        console.log('Connection successful! Test query result:', rows);
    
        // Optionally close the pool (useful for one-time tests)
        await pool.end();
        return 'connection success: '+rows;
      } catch (err) {
        console.error('Database connection failed:', err);
        return err;
    }
}

export async function testClient(): Promise<string | unknown> {
    try {
      // Create the connection
      console.log('Connecting to the MySQL database...');
      const connection = await mysql.createConnection({
        host: process.env.RDS_ENDPOINT,
        user: process.env.RDS_USERNAME,
        password: process.env.RDS_PASSWORD,
        database: process.env.RDS_DATABASE,
      });
  
      console.log('Connected to the MySQL database.');
  
      // Example query
      const [rows] = await connection.execute('SELECT 1 + 1 AS result');
      console.log('Query results:', rows);
  
      // Close the connection
      await connection.end();
      return 'connection success: '+rows;
    } catch (err) {
      console.error('Error connecting to the database:', err);
      return err;
    }
}
