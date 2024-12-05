import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { Package, PackageRating } from '../apis/types.js';
import console from 'console';
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

//reuired, name,id , version, make upload_date DEFAULT

export async function storePackage(newPackage: Package, scores: PackageRating): Promise<string | null> {
    try {
        const insertText = `
            INSERT INTO packages(
                package_id, package_name, version, url, debloat, 
                bus_factor, bus_factor_latency, correctness, correctness_latency, 
                ramp_up, ramp_up_latency, responsive_maintainer, responsive_maintainer_latency, 
                license_score, license_score_latency, good_pinning_practice, 
                good_pinning_practice_latency, pull_request, pull_request_latency, 
                net_score, net_score_latency
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertValues = [
            newPackage.metadata.ID, newPackage.metadata.Name, newPackage.metadata.Version, 
            newPackage.data.URL, newPackage.data.debloat, 
            scores.BusFactor, scores.BusFactorLatency, 
            scores.Correctness, scores.CorrectnessLatency, 
            scores.RampUp, scores.RampUpLatency, 
            scores.ResponsiveMaintainer, scores.ResponsiveMaintainerLatency, 
            scores.LicenseScore, scores.LicenseScoreLatency, 
            scores.GoodPinningPractice, scores.GoodPinningPracticeLatency, 
            scores.PullRequest, scores.PullRequestLatency, 
            scores.NetScore, scores.NetScoreLatency
        ];

        // Execute the query
        const [result] = await pool.query<mysql.RowDataPacket[]>(insertText, insertValues);

        if(result.length === 0) {
            console.log('Failed to insert package');
            return null;
        }
        
        console.log('Inserted Package, Affected Rows:', (result as any).affectedRows);

        return 'Package stored successfully';

    } catch (err) {
        console.error('Database operation failed:', err);
        return null;
    }
}

// export async function storePackageRating(BusFactor: number, BusFactorLatency: number, Correctness: number, CorrectnessLatency: number, RampUp: number, RampUpLatency: number, ResponsiveMaintainer: number, ResponsiveMaintainerLatency: number, LicenseScore: number, LicenseScoreLatency: number, GoodPinningPractice: number, GoodPinningPracticeLatency: number, PullRequest: number, PullRequestLatency: number, NetScore: number, NetScoreLatency: number) {
//     try {
//         console.log('Connected to PostgreSQL RDS');
//         // **Store Data Example**
//         const insertText = 'INSERT INTO packages(bus_factor, bus_factor_latency, correctness, correctness_latency, ramp_up, ramp_up_latency, responsive_maintainer, responsive_maintainer_latency, license_score, license_score_latency, good_pinning_practice, good_pinning_practice_latency, pull_request, pull_request_latency, net_score, net_score_latency) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *';
//         const insertValues = [BusFactor, BusFactorLatency, Correctness, CorrectnessLatency, RampUp, RampUpLatency, ResponsiveMaintainer, ResponsiveMaintainerLatency, LicenseScore, LicenseScoreLatency, GoodPinningPractice, GoodPinningPracticeLatency, PullRequest, PullRequestLatency, NetScore, NetScoreLatency];
//         const insertResult = await pool.query(insertText, insertValues);
//         console.log('Inserted:', insertResult.rows[0]);

//     } catch (err) {
//         console.error('Database operation failed:', err);
//     } finally {
//         console.log('Disconnected from PostgreSQL RDS');
//     }
// }

export async function readPackage(packageId: string): Promise<Package | null> {
    const query = `
        SELECT package_id, package_name, version, url, debloat 
        FROM packages 
        WHERE package_id = ?
    `;
    try {
        // Execute the query with the provided packageId
        const [rows] = await pool.query<mysql.RowDataPacket[]>(query, [packageId]);

        if (rows.length === 0) {
            console.log('No package found with ID:', packageId);
            return null;
        }

        console.log('Queried package:', rows[0]);

        const data: Package = {
            metadata: {
                Name: rows[0].package_name,
                ID: rows[0].package_id,
                Version: rows[0].version
            },
            data: {
                Name: rows[0].package_name,
                URL: rows[0].url,
                debloat: rows[0].debloat
            }
        }

        return data;

    } catch (error) {
        console.error('Error querying the database:', error);
        return null;
    }
}

export async function readAllPackages(): Promise<Package[] | null> {
    try {
        console.log('Connected to PostgreSQL RDS');
        // **Read Data Example**
        const selectText = 'SELECT package_id, package_name, version, url, debloat FROM packages';
        const [rows] = await pool.query<mysql.RowDataPacket[]>(selectText);
        console.log('Queried:', rows);

        if (rows.length === 0) {
            console.log('No packages found in the database');
            return null;
        }

        const data: Package[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = {
                metadata: {
                    Name: rows[i].package_name,
                    ID: rows[i].package_id,
                    Version: rows[i].version
                },
                data: {
                    Name: rows[i].package_name,
                    URL: rows[i].url,
                    debloat: rows[i].debloat
                }
            }
            data.push(row);
        }

        return data;

    } catch (err) {
        console.error('Database operation failed:', err);
        return null;
    }
}

export async function readPackageRating(packageId: string): Promise<PackageRating | null> {
    const selectText = `
        SELECT 
            bus_factor, bus_factor_latency, correctness, correctness_latency, 
            ramp_up, ramp_up_latency, responsive_maintainer, responsive_maintainer_latency, 
            license_score, license_score_latency, good_pinning_practice, good_pinning_practice_latency, 
            pull_request, pull_request_latency, net_score, net_score_latency 
        FROM packages 
        WHERE package_id = ?
    `;

    try {
        // Execute the query with the parameterized value
        const [rows] = await pool.query<mysql.RowDataPacket[]>(selectText, [packageId]);

        if (rows.length === 0) {
            return null;
        }

        const data : PackageRating = {
            BusFactor: rows[0].bus_factor,
            BusFactorLatency: rows[0].bus_factor_latency,
            Correctness: rows[0].correctness,
            CorrectnessLatency: rows[0].correctness_latency,
            RampUp: rows[0].ramp_up,
            RampUpLatency: rows[0].ramp_up_latency,
            ResponsiveMaintainer: rows[0].responsive_maintainer,
            ResponsiveMaintainerLatency: rows[0].responsive_maintainer_latency,
            LicenseScore: rows[0].license_score,
            LicenseScoreLatency: rows[0].license_score_latency,
            GoodPinningPractice: rows[0].good_pinning_practice,
            GoodPinningPracticeLatency: rows[0].good_pinning_practice_latency,
            PullRequest: rows[0].pull_request,
            PullRequestLatency: rows[0].pull_request_latency,
            NetScore: rows[0].net_score,
            NetScoreLatency: rows[0].net_score_latency
        }

        return data;
    
    } catch (err) {
        console.error('Database operation failed:', err);
        return null;
    }
}
