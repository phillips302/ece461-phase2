import * as fs from 'fs/promises';
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';
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
        logMessage('INFO', `Ingesting package for repository: ${repo}`);
        const repoString = `https://github.com/${owner}/${repo}.git`;

        const dir = `./ingestedPackages/${repo}`;
        try {
            try {
                await fs.access(dir);
                logMessage(`INFO`, `Repository already exists in directory: ${dir}`);
                return;
            } catch (err) {
                logMessage(`INFO`, `Repository does not exist, procedding to clone in ${dir}`);
            }

            const git: SimpleGit = simpleGit().clean(CleanOptions.FORCE);
            await git.clone(repoString, dir, ['--depth', '1']);
            logMessage(`INFO`, `Repository cloned successfully in ${dir}`);
        } catch (err) {
            logMessage(`DEBUG`, `Failed to clone repository: ${err}`);
        }
    } else {
        logMessage('DEBUG', `Package not ingested due to failing metrics.`);
        console.log(`${repo} not ingested due to failing metrics.`);
    }
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
      await fs.access(dir);
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