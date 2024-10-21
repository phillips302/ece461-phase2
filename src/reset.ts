import * as fs from 'fs';
import * as path from 'path';
import { logMessage } from "./utils.js";

/**
 * Recursively clears the contents of a specified folder, including all files and subfolders.
 * 
 * This function reads all the entries in the provided folder, deleting each file or recursively 
 * clearing each subfolder. Optionally, it can also delete the root folder itself after its contents 
 * have been cleared. It supports asynchronous operations using promises and includes error handling 
 * for file system operations.
 * 
 * @param folderPath - The path to the folder to clear.
 * @param deleteRootFolder - Optional. If true, the root folder itself will be deleted after its contents 
 *                           are cleared. Defaults to false.
 * @param log - Optional. If true, logs the deletion of each file and folder. Defaults to false.
 * @returns A promise that resolves when the folder has been cleared.
 */
async function clearFolder(folderPath: string, deleteRootFolder: boolean = false, log: boolean = false): Promise<void> {
    try {
        // Check if the folder exists before trying to clear it
        if (!fs.existsSync(folderPath)) {
            logMessage("ERROR", `The folder "${folderPath}" does not exist.`);
            process.exit(1);
        }

        // Read all entries (files and folders) inside the specified folder
        const entries = await fs.promises.readdir(folderPath);

        for (const entry of entries) {
            const fullPath = path.join(folderPath, entry);
            const stats = await fs.promises.stat(fullPath);

            if (stats.isDirectory()) {
                // Recursively remove the subfolder
                await clearFolder(fullPath, true, log);
            } else {
                // If it's a file, delete it
                await fs.promises.unlink(fullPath);
                if (log) logMessage("INFO",`Deleted file: ${fullPath}`);
            }
        }

        // Optionally delete the root folder itself
        if (deleteRootFolder) {
            await fs.promises.rmdir(folderPath);
            if (log) logMessage("INFO", `Deleted folder: ${folderPath}`);
        }
    } catch (error) {
        logMessage("ERROR", `Error clearing folder "${folderPath}": ${(error as Error).message}`);
        process.exit(1);
    }
}

const folderPath = './ingestedPackages'; //change this file path if the registry folder changes
clearFolder(folderPath, false, true).then(() => {
    logMessage("INFO", 'Folder cleared successfully.');
    process.exit(0);
});
