import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { Package, PackageRating } from '../apis/types.js';

import process from 'process';

dotenv.config();

export const pool = new Pool({
  host: process.env.RDS_ENDPOINT,
  port: 5432, // Default PostgreSQL port
  database: process.env.RDS_DATABASE,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Error executing query', err.stack);
    } else {
      console.log('Connection successful:', res.rows[0]);
    }
    pool.end();
});

//reuired, name,id , version, make upload_date DEFAULT

export async function storePackage(newPackage: Package, scores: PackageRating) {
    try {
        console.log('Connected to PostgreSQL RDS');
        const insertText = 'INSERT INTO packages(package_id, package_name, version, url, debloat, bus_factor, bus_factor_latency, correctness, correctness_latency, ramp_up, ramp_up_latency, responsive_maintainer, responsive_maintainer_latency, license_score, license_score_latency, good_pinning_practice, good_pinning_practice_latency, pull_request, pull_request_latency, net_score, net_score_latency) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *';
        const insertValues = [newPackage.metadata.ID, newPackage.metadata.Name, newPackage.metadata.Version, newPackage.data.URL, newPackage.data.debloat, scores.BusFactor, scores.BusFactorLatency, scores.Correctness, scores.CorrectnessLatency, scores.RampUp, scores.RampUpLatency, scores.ResponsiveMaintainer, scores.ResponsiveMaintainerLatency, scores.LicenseScore, scores.LicenseScoreLatency, scores.GoodPinningPractice, scores.GoodPinningPracticeLatency, scores.PullRequest, scores.PullRequestLatency, scores.NetScore, scores.NetScoreLatency];
        const insertResult = await pool.query(insertText, insertValues);
        console.log('Inserted:', insertResult.rows[0]);

    } catch (err) {
        console.error('Database operation failed:', err);
    } finally {
        console.log('Disconnected from PostgreSQL RDS');
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

export async function readPackage(ID: string): Promise<Package | null> {
    try {
        console.log('Connected to PostgreSQL RDS');
        // **Read Data Example**
        const selectText = 'SELECT package_id, package_name, version, url, debloat FROM packages WHERE package_id = $1';
        const selectValues = [ID];
        const selectResult = await pool.query(selectText, selectValues);
        console.log('Queried:', selectResult.rows);

        if (selectResult.rows.length === 0) {
            return null;
        }

        const data: Package = {
            metadata: {
                Name: selectResult.rows[0].package_name,
                ID: selectResult.rows[0].package_id,
                Version: selectResult.rows[0].version
            },
            data: {
                Name: selectResult.rows[0].package_name,
                URL: selectResult.rows[0].url,
                debloat: selectResult.rows[0].deloat
            }
        }

        return data;

    } catch (err) {
        console.error('Database operation failed:', err);
        return null;
    } finally {
        console.log('Disconnected from PostgreSQL RDS');
    }
}

export async function readAllPackages(): Promise<Package[] | null> {
    try {
        console.log('Connected to PostgreSQL RDS');
        // **Read Data Example**
        const selectText = 'SELECT package_id, package_name, version, url, debloat FROM packages';
        const selectResult = await pool.query(selectText);
        console.log('Queried:', selectResult.rows);

        if (selectResult.rows.length === 0) {
            console.log('No packages found in the database');
            return null;
        }

        const data: Package[] = [];

        for (let i = 0; i < selectResult.rows.length; i++) {
            const row = {
                metadata: {
                    Name: selectResult.rows[i].package_name,
                    ID: selectResult.rows[i].package_id,
                    Version: selectResult.rows[i].version
                },
                data: {
                    Name: selectResult.rows[i].package_name,
                    URL: selectResult.rows[i].url,
                    debloat: selectResult.rows[i].debloat
                }
            }
            data.push(row);
        }

        return data;

    } catch (err) {
        console.error('Database operation failed:', err);
        return null;
    } finally {
        console.log('Disconnected from PostgreSQL RDS');
    }
}

export async function readPackageRating(ID: string): Promise<PackageRating | null> {
    try {
        console.log('Connected to PostgreSQL RDS'); 
        // **Read Data Example**
        const selectText = 'SELECT bus_factor, bus_factor_latency, correctness, correctness_latency, ramp_up, ramp_up_latency, responsive_maintainer, responsive_maintainer_latency, license_score, license_score_latency, good_pinning_practice, good_pinning_practice_latency, pull_request, pull_request_latency, net_score, net_score_latency FROM packages WHERE package_id = $1';
        const selectValues = [ID];
        const selectResult = await pool.query(selectText, selectValues);
        console.log('Queried:', selectResult.rows);

        if (selectResult.rows.length === 0) {
            return null;
        }

        const data : PackageRating = {
            BusFactor: selectResult.rows[0].bus_factor,
            BusFactorLatency: selectResult.rows[0].bus_factor_latency,
            Correctness: selectResult.rows[0].correctness,
            CorrectnessLatency: selectResult.rows[0].correctness_latency,
            RampUp: selectResult.rows[0].ramp_up,
            RampUpLatency: selectResult.rows[0].ramp_up_latency,
            ResponsiveMaintainer: selectResult.rows[0].responsive_maintainer,
            ResponsiveMaintainerLatency: selectResult.rows[0].responsive_maintainer_latency,
            LicenseScore: selectResult.rows[0].license_score,
            LicenseScoreLatency: selectResult.rows[0].license_score_latency,
            GoodPinningPractice: selectResult.rows[0].good_pinning_practice,
            GoodPinningPracticeLatency: selectResult.rows[0].good_pinning_practice_latency,
            PullRequest: selectResult.rows[0].pull_request,
            PullRequestLatency: selectResult.rows[0].pull_request_latency,
            NetScore: selectResult.rows[0].net_score,
            NetScoreLatency: selectResult.rows[0].net_score_latency
        }

        return data;
    
    } catch (err) {
        console.error('Database operation failed:', err);
        return null;
    } finally {
        console.log('Disconnected from PostgreSQL RDS');
    }
}
