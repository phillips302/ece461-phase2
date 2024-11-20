import * as fs from 'fs';
import * as https from 'https';
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';
import { logMessage } from "./utils.js";
import { removeDirectory } from '../tools/dependencyCost.js';
import { uploadToS3 } from '../tools/uploadToS3.js';

/**
 * Ingests a package if each of the non-latency scores is >= 0.5.
 *
 * @param output - Dictionary containing all outputed metrics.
 * @param owner - Owner of the repository.
 * @param repo - Name of the repository.
 * @param version - Version of the package to ingest.
 * @returns Promise<void>.
 */
export async function ingestPackage(output: { [key: string]: number | string }, owner: string | null, repo: string | null, version: string='1.0.0'): Promise<void> {
    let ingest = true;
    const filteredOutput = Object.entries(output)
    .filter(([key]) => 
        !key.includes('_Latency') && 
        key !== 'URL' && 
        
        key !== 'NetScore'
    );

    filteredOutput.forEach(([key, value]) => {
        if (typeof value === 'number' && value < 0.5) {
            ingest = false;
            logMessage('INFO', `Clamped ${key} @ value: ${value}`);
        }
    });
    
    if (ingest) {
        if (owner === null || repo === null) {
            logMessage('DEBUG', `Owner or repo is null. Skipping ingestion.`);
            return;
        }
        await ingestPackageHelper(repo, version);
    } else {
        logMessage('DEBUG', `Package not ingested due to failing metrics.`);
        console.log(`${repo} not ingested due to failing metrics.`);
    }
}

export async function ingestPackageHelper(repo: string | null, version: string): Promise<void> {
    logMessage('INFO', `Ingesting package for repository: ${repo}`);
    const dir = `./ingestedPackages/${repo}-${version}.tgz`;
    const url = `https://registry.npmjs.org/${repo}/-/${repo}-${version}.tgz`;
    await downloadFile(url, dir);
    uploadToS3(`${repo}-${version}`, fs.createReadStream(dir));
    await removeDirectory(dir);
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }

            // Pipe the response data to the file
            response.pipe(file);

            // Close the file and resolve promise on end
            file.on('finish', () => {
                file.close();
                logMessage('INFO', `Downloaded file saved to ${outputPath}`);
                resolve();
            });
        }).on('error', (error) => {
            // Handle any errors
            fs.unlink(outputPath, () => reject(error));  // Delete the file if error occurs
        });
    });
}

/**
 * Ingests a package without checks
 *
 * @param owner - Owner of the repository.
 * @param repo - Name of the repository.
 * @param dir - Directory to clone the repository into.
 * @returns Promise<void>.
 */
export async function ingestPackageFree(owner: string | null, repo: string | null, dir: string): Promise<void> {
    logMessage('INFO', `Ingesting package for repository: ${repo}`);
    const repoString = `https://github.com/${owner}/${repo}.git`;
  
    try {
      await fs.promises.access(dir);
      logMessage('INFO', `Directory already exists: ${dir}. Skipping clone.`);
      return;
    } catch (err) {
      logMessage('DEBUG', `Directory does not exist. Proceeding to clone repository.`);
    }
  
    // Step 2: Clone the repository if the directory doesn't exist
    try {
      const git: SimpleGit = simpleGit().clean(CleanOptions.FORCE);
      await git.clone(repoString, dir, ['--depth', '1']); // Clone with depth 1 for shallow clone
      logMessage('INFO', `Repository cloned successfully in ${dir}`);
    } catch (err) {
      logMessage('DEBUG', `Failed to clone repository: ${err}`);
    }
}