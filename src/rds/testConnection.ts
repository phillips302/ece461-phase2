import pkg from 'pg';
const { Client } = pkg;
const { Pool } = pkg;
import dotenv from 'dotenv';

import process from 'process';

dotenv.config();

const client = new Client({
    host: process.env.RDS_ENDPOINT,
    port: 5432,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE
});

export const pool = new Pool({
    host: process.env.RDS_ENDPOINT,
    port: 5432, // Default PostgreSQL port
    database: process.env.RDS_DATABASE,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD
});

export async function testClient(): Promise<string> {
    try {
        // Connect to the database
        await client.connect();
        console.log('Connected to RDS PostgreSQL');

        // Run a test query
        const res = await client.query('SELECT NOW()');
        console.log('Server Time:', res.rows[0]);

    } catch (err) {
        console.error('Connection error:', err);
        return 'connection error';
    } finally {
        // Always close the connection
        await client.end();
        console.log('Disconnected from RDS PostgreSQL');
        return 'connection success';
    }
}

export async function testPoolQuery(): Promise<string> {
    try {
        console.log('Testing pool connection to PostgreSQL RDS...');
        
        // Test the connection with a simple query
        const result = await pool.query('SELECT NOW()');
        console.log('Successfully connected to PostgreSQL RDS');
        console.log('Server time:', result.rows[0].now);

    } catch (err) {
        console.error('Error executing query:', err);
        return 'connection error';
    } finally {
        // End the pool (optional for testing, not recommended for long-lived apps)
        await pool.end();
        console.log('Disconnected from PostgreSQL RDS');
        return 'connection success';
    }
}
