import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { Package, PackageRating } from '../apis/types.js';
import console from 'console';
import process from 'process';
import { uploadToS3, readFromS3 } from '../tools/uploadToS3.js';

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
        
        returnString = 'Package data stored successfully in RDS.';
    } catch (err) {
        console.error('Database operation failed:', err);
        return null;
    }
    try {
        let s3result;
        const s3path = `${newPackage.metadata.Name}/${newPackage.metadata.ID}`;
        if (newPackage.data.Content) {
            s3result = await uploadToS3(s3path, newPackage.data.Content);
        } else {
            console.log('No content to store in S3');
            return null
        }
        console.log('Uploaded to S3:', s3result);
        returnString += ` --- Package content stored successfully in S3 for package ${newPackage.data.Name}-${newPackage.metadata.Version} w/ ID: ${newPackage.metadata.ID}.`;
    } catch (err) {
        console.error('S3 operation failed:', err);
        return null;
    }
    return returnString;
}

export async function readPackage(packageId: string): Promise<Package | null> {
    console.log('Reading package ID:', packageId);
    let data: Package;
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

        data = {
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
    } catch (error) {
        console.error('Error querying the database:', error);
        return null;
    }
    try {
        const s3path = `${data.metadata.Name}/${data.metadata.ID}`;
        const content = await readFromS3(s3path);
        if (content === undefined) {
            console.log('Could not retrieve package content for ID: ', packageId);
            return null;
        }
        data.data.Content = content;
    } catch (error) {
        console.error('Error retrieving package content:', error);
        return null;
    }
    return data;
}

export async function readAllPackages(): Promise<Package[] | null> {
    try {
        const selectText = 'SELECT package_id, package_name, version, url, debloat FROM packages';
        const [rows] = await pool.query<mysql.RowDataPacket[]>(selectText);

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
        const deleteText = 'DELETE FROM packages';
        const deleteResult = await pool.query(deleteText);
        console.log('Deleted:', deleteResult);

        return 'All packages deleted';

    } catch (err) {
        console.error('Database operation failed:', err);
        return null;
    }
}
