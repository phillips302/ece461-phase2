import * as fs from 'fs';
import * as path from 'path';
import { logMessage } from "./tools/utils.js";
import { exit } from 'process';

/**
 * Recursively clears the contents of a specified folder, including all files and subfolders.
 * 
 * This function reads all the entries in the provided folder, deleting each file or recursively 
 * clearing each subfolder.
 * 
 * @param folderPath - The path to the folder to clear.
 * @returns A promise that resolves when the folder has been cleared.
 */
export async function clearFolder(folderPath: string): Promise<number> {
    try {
        // Check if the folder exists before trying to clear it
        if (!fs.existsSync(folderPath)) {
            logMessage("ERROR", `The folder "${folderPath}" does not exist.`);
            return 1;
        }

        // Read all entries (files and folders) inside the specified folder
        const entries = await fs.promises.readdir(folderPath);

        for (const entry of entries) {
            const fullPath = path.join(folderPath, entry);
            const stats = await fs.promises.stat(fullPath);

            if (stats.isDirectory()) {
                // Recursively remove the subfolder
                await clearFolder(fullPath);
            } else {
                // If it's a file, delete it
                await fs.promises.unlink(fullPath);
                logMessage("INFO",`Deleted file: ${fullPath}`);
            }
        }
        return 0;
    } catch (error) {
        logMessage("ERROR", `Error clearing folder "${folderPath}": ${(error as Error).message}`);
        return 1;
    }
}

const folderPath = './ingestedPackages'; //change this file path if the registry folder changes
clearFolder(folderPath).then((exit_val) => {
    if(exit_val) {
        logMessage("INFO", 'Folder cleared successfully.');
    }
    else {
        logMessage("ERROR", 'Failed to clear folder.');
    }
    exit(exit_val);
});