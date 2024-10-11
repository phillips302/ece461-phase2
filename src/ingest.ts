import * as fs from 'fs/promises';
import * as git from 'isomorphic-git';
import * as http from 'isomorphic-git/http/node/index.js';
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
        const repoString = `https://github.com/${owner}/${repo}`;

        const dir = `./ingestedPackages/${repo}`;
        try {
            try {
                await fs.access(dir);
                logMessage(`INFO`, `Repository already exists in directory: ${dir}`);
                return;
            } catch (err) {
                logMessage(`INFO`, `Repository does not exist, procedding to clone in ${dir}`);
            }

            await git.clone({
                fs,
                http,
                dir,
                url: repoString,
                singleBranch: true,
            });
            logMessage(`INFO`, `Repository cloned successfully in ${dir}`);
        } catch (err) {
            logMessage(`DEBUG`, `Failed to clone repository: ${err}`);
        }
    } else {
        logMessage('DEBUG', `Package not ingested due to failing metrics.`);
    }
}
