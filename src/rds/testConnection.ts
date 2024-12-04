import pkg from 'pg';
const { Client } = pkg;
const { Pool } = pkg;
import dotenv from 'dotenv';
import { Package } from '../apis/types.js';
import console from 'console';

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
        const res = await client.query('SELECT * FROM packages');
        console.log('Server Time:', res.rows[0]);

        return 'connection success';

    } catch (err) {
        console.error('Connection error:', err);
        return 'connection error';
    } finally {
        // Always close the connection
        await client.end();
        console.log('Disconnected from RDS PostgreSQL');
    }
}

export async function testPoolQuery(): Promise<string> {
    try {
        console.log('Testing pool connection to PostgreSQL RDS...');
        
        // Test the connection with a simple query
        const result = await pool.query('SELECT * FROM packages');
        console.log('Successfully connected to PostgreSQL RDS');
        console.log('Server time:', result.rows[0].now);

        return 'connection success';

    } catch (err) {
        console.error('Error executing query:', err);
        return 'connection error';
    } finally {
        console.log('Disconnected from PostgreSQL RDS');
    }
}

export async function testStoreQuery(newPackage: Package): Promise<string> {
    try {
        console.log('Testing pool connection to PostgreSQL RDS...');
        
        // Test the connection with a simple query
        const insertText = 'INSERT INTO packages(package_id, package_name, version, url, debloat) VALUES($1, $2, $3, $4, $5) RETURNING *';
        const insertValues = [newPackage.metadata.ID, newPackage.metadata.Name, newPackage.metadata.Version, newPackage.data.URL, newPackage.data.debloat];
        const insertResult = await pool.query(insertText, insertValues);
        console.log('Successfully connected to PostgreSQL RDS');
        console.log('Server time:', insertResult.rows[0].now);

        
        return 'connection success';

    } catch (err) {
        console.error('Error executing query:', err);
        return 'connection error';
    } finally {
        console.log('Disconnected from PostgreSQL RDS');
    }
}

export async function testReadAll(): Promise<string> {
    try {
        console.log('Testing pool connection to PostgreSQL RDS...');
        
        // Test the connection with a simple query
        const selectResult = await pool.query('SELECT package_id, package_name, version, url, debloat FROM packages');
        console.log('Successfully connected to PostgreSQL RDS');
        console.log('Server time:', selectResult.rows[0].now);

        return `${selectResult.rows[0].package_name}`;

    } catch (err) {
        console.error('Error executing query:', err);
        return 'connection error';
    } finally {
        console.log('Disconnected from PostgreSQL RDS');
    }
}
