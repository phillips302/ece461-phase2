import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { Package, PackageRating } from '../apis/types.js';
import console from 'console';
import process from 'process';
import { uploadToS3, readFromS3 } from '../tools/uploadToS3.js';
import { ingestPackageHelper } from '../tools/ingest.js';
import fs from 'fs';
import path from 'path';

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
    console.log(`Storing package ${newPackage.metadata.ID}`);
    let returnString = "";
    try {
        const insertText = `
            INSERT INTO packages(
                package_id, package_name, version, url, debloat, 
                busfactor, busfactor_latency, correctness, correctness_latency, 
                ramp_up, ramp_up_latency, responsive_maintainer, responsive_maintainer_latency, 
                license_score, license_score_latency, fraction_dependencies, 
                fraction_dependencies_latency, pr_fraction, pr_fraction_latency, 
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

        returnString = 'Package data stored successfully in RDS.';

    } catch (err) {
        console.error('Database operation failed:', err);
        returnString = 'Package data failed to store in RDS.';
    }
    try {
        let s3result;
        const s3path = `${newPackage.metadata.Name}/${newPackage.metadata.ID}`;
        if (newPackage.data.Content) {
            s3result = await uploadToS3(s3path, newPackage.data.Content);
        } else {
            s3result = await ingestPackageHelper(s3path, newPackage.data.Name, newPackage.metadata.Version);
        }
        console.log('Uploaded to S3:', s3result);
        returnString += ` --- Package content stored successfully in S3 for package ${newPackage.data.Name}-${newPackage.metadata.Version} w/ ID: ${newPackage.metadata.ID}.`;
    } catch (err) {
        console.error('S3 operation failed:', err);
        returnString += ` --- Package content failed to store in S3 for package ${newPackage.data.Name}-${newPackage.metadata.Version}.`;
    }
    return returnString;
}  

export async function downloadPackageContent(packageId: string): Promise<string | null> {
    console.log(`Downloading content for package ID: ${packageId}`);
    const downloadDirectory = path.join(__dirname, 'downloads');
    try {
        const packageData = await readPackage(packageId);
        if (!packageData) {
            console.log('Package not found');
            return null;
        }

        const s3Path = `${packageData.metadata.Name}/${packageData.metadata.ID}`;
        const content = await readFromS3(s3Path);
        if (!content) {
            console.log('Failed to read content from S3');
            return null;
        }

        if (!fs.existsSync(downloadDirectory)) {
            fs.mkdirSync(downloadDirectory, { recursive: true });
        }

        const filePath = path.join(downloadDirectory, `${packageData.metadata.Name}-${packageData.metadata.Version}.zip`);
        fs.writeFileSync(filePath, content);

        console.log(`Content downloaded and saved to ${filePath}`);
        return filePath;
    } catch (err) {
        console.error('Failed to download package content:', err);
        return null;
    }
}


// export async function storePackageRating(BusFactor: number, BusFactorLatency: number, Correctness: number, CorrectnessLatency: number, RampUp: number, RampUpLatency: number, ResponsiveMaintainer: number, ResponsiveMaintainerLatency: number, LicenseScore: number, LicenseScoreLatency: number, GoodPinningPractice: number, GoodPinningPracticeLatency: number, PullRequest: number, PullRequestLatency: number, NetScore: number, NetScoreLatency: number) {
//     try {
//         console.log('Connected to PostgreSQL RDS');
//         // **Store Data Example**
//         const insertText = 'INSERT INTO packages(bus_factor, bus_factor_latency, correctness, correctness_latency, ramp_up, ramp_up_latency, responsive_maintainer, responsive_maintainer_latency, license_score, license_score_latency, fraction_dependencies, fraction_dependencies_latency, pr_fraction, pr_fraction_latency, net_score, net_score_latency) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *';
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
    console.log('Reading package ID:', packageId);
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
        // **Read Data Example**
        const selectText = 'SELECT package_id, package_name, version, url, debloat FROM packages';
        const [rows] = await pool.query<mysql.RowDataPacket[]>(selectText);
        console.log('Queried:', rows);

        if (rows.length === 0) {
            console.log('No packages found in the database');
            return [];
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
    console.log('Reading package rating');
    const selectText = `
        SELECT 
            busfactor, busfactor_latency, correctness, correctness_latency, 
            ramp_up, ramp_up_latency, responsive_maintainer, responsive_maintainer_latency, 
            license_score, license_score_latency, fraction_dependencies, fraction_dependencies_latency, 
            pr_fraction, pr_fraction_latency, net_score, net_score_latency 
        FROM packages 
        WHERE package_id = ?
    `;

    try {
        // Execute the query with the parameterized value
        const [rows] = await pool.query<mysql.RowDataPacket[]>(selectText, [packageId]);

        if (rows.length === 0) {
            console.log('No package found with ID:', packageId);
            return null;
        }

        const data : PackageRating = {
            BusFactor: rows[0].busfactor,
            BusFactorLatency: rows[0].busfactor_latency,
            Correctness: rows[0].correctness,
            CorrectnessLatency: rows[0].correctness_latency,
            RampUp: rows[0].ramp_up,
            RampUpLatency: rows[0].ramp_up_latency,
            ResponsiveMaintainer: rows[0].responsive_maintainer,
            ResponsiveMaintainerLatency: rows[0].responsive_maintainer_latency,
            LicenseScore: rows[0].license_score,
            LicenseScoreLatency: rows[0].license_score_latency,
            GoodPinningPractice: rows[0].fraction_dependencies,
            GoodPinningPracticeLatency: rows[0].fraction_dependencies_latency,
            PullRequest: rows[0].pr_fraction,
            PullRequestLatency: rows[0].pr_fraction_latency,
            NetScore: rows[0].net_score,
            NetScoreLatency: rows[0].net_score_latency
        }

        return data;

    } catch (err) {
        console.error('Database operation failed:', err);
        return null;
    }
}

export async function deleteAllPackages(): Promise<string | null> {
    console.log('Deleting all packages');
    try {
        // **Delete Data Example**
        const deleteText = 'DELETE FROM packages';
        const deleteResult = await pool.query(deleteText);
        console.log('Deleted:', deleteResult);

        return 'All packages deleted';

    } catch (err) {
        console.error('Database operation failed:', err);
        return null;
    }
}
