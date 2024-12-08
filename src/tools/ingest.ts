import * as fs from 'fs';
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';
import { logMessage } from "./utils.js";


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