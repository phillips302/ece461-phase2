import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { logMessage } from './utils.js';

/**
 * Updates the npm packages in the specified repository directory if it exists.
 *
 * @param repo - Name of the repository.
 * @returns Promise<void>
 */
export async function updatePackage(repo: string): Promise<void> {
    const dir = `./ingestedPackages/${repo}`;
    
    try {
        // Check if the directory exists
        await fs.access(dir);
        logMessage('INFO', `Repository found in directory: ${dir}`);

        // Run npm update inside the directory
        await runNpmUpdate(dir);

    } catch (err) {
        logMessage('ERROR', `Repository does not exist or an error occurred: ${err}`);
    }
}

/**
 * Runs `npm outdated -u` in the specified directory to update the package.
 *
 * @param dir - Directory of the repository.
 * @returns Promise<void>
 */
async function runNpmUpdate(dir: string): Promise<void> {
    return new Promise((resolve, reject) => {
        logMessage('INFO', `Running npm update in directory: ${dir}`);
        
        exec(`npm outdated -u`, { cwd: dir }, (error, stdout, stderr) => {
            if (error) {
                logMessage('ERROR', `During npm update: ${stderr}`);
                logMessage('ERROR', `stdout: ${stdout}`);
                return reject(error);
            }
            logMessage('INFO', `npm update output: ${stdout}`);
            resolve();
        });
    });
}
