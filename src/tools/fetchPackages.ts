import * as fs from 'fs';
import path from 'path';
import { logMessage } from "./utils.js";

/**
 * Retrieves the names of all subdirectories within the specified folder.
 * 
 * This function reads all entries in the given folder and filters out those 
 * that are directories, returning the names of those subdirectories. It handles 
 * file system operations synchronously and includes error handling in case 
 * of failures, such as the folder not existing or permission issues.
 * 
 * @param folderPath - The path to the folder from which to retrieve subdirectory names.
 * @returns An array of strings containing the names of the subdirectories, or an empty array 
 *          if an error occurs during the folder reading process.
 */
export function getPackageNames(folderPath: string): string[] {
    try {
        // Read all entries in the specified folder
        const entries = fs.readdirSync(folderPath, { withFileTypes: true });

        // Filter out the entries that are directories and return their names
        const subfolders = entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);

        return subfolders;
    } catch (error) {
        logMessage("ERROR", `Error reading folder: ${error}`);
        return [];
    }
}

/**
 * Retrieves the repository URL from the package.json file in the specified folder.
 * @param folderPath - The path to the folder containing package.json.
 * @returns The repository URL if found, otherwise null.
 */
export function getRepositoryUrl(folderPath: string): string | null {
    const packageJsonPath = path.join(folderPath, 'package.json');
    
    try {
        // Read and parse the package.json file
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
            repository?: {
                type?: string;
                url?: string;
            };
        };
        
        // Retrieve the repository URL if it exists
        if (packageJson.repository && packageJson.repository.url) {
            return packageJson.repository.url;
        } else {
            logMessage("ERROR", 'Repository URL not found in package.json');
            return null;
        }
    } catch (error) {
        logMessage("ERROR", `Failed to read package.json: ${(error as Error).message}`);
        return null;
    }
}