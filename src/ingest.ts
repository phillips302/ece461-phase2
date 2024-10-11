import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { logMessage } from "./utils.js";

/**
 * Ingests a package if each of the non-latency scores is >= 0.5.
 *
 * @param output - Dictionary containing all outputed metrics.
 * @param owner - Owner of the repository.
 * @param repo - Name of the repository.
 * @returns Promise<void>.
 */
export async function ingestPackage(output: { [key: string]: number | string }, owner: string | null, repo: string | null): Promise<void> {
    let ingest = true;
    const filteredOutput = Object.entries(output)
        .filter(([key]) => 
            !key.includes('_latency') && 
            key !== 'URL' && 
            key !== 'NetScore'
        );

    filteredOutput.forEach(([key, value]) => {
        if (typeof value === 'number' && value < 0.5) {
            ingest = false;
        }
    });
    
    if (ingest) {
        logMessage('INFO', `Ingesting package for repository: ${repo}`);
        const repoString = `https://github.com/${owner}/${repo}`;
        
        // Define the localPackages directory path
        const localPackagesDir = path.join(__dirname, '../localPackages');
        if (!fs.existsSync(localPackagesDir)) {
            fs.mkdirSync(localPackagesDir);
        }

        try {
            // Run 'npm install' for the package with the --prefix option to install in localPackages
            await npmInstallPackage(repoString, localPackagesDir);
            logMessage('INFO', `Package installed successfully in ${localPackagesDir}`);
        } catch (error) {
            logMessage('ERROR', `Failed to install package: ${error}`);
        }
    } else {
        logMessage('DEBUG', `Package not ingested due to failing metrics.`);
    }
}

// Helper function to run 'npm install' with the --prefix option
function npmInstallPackage(repoString: string, installDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const command = `npm install ${repoString} --prefix ${installDir}`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            if (stderr) {
                logMessage('DEBUG', `stderr: ${stderr}`);
            }
            logMessage('INFO', `stdout: ${stdout}`);
            resolve();
        });
    });
}
