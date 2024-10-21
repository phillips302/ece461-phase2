import * as fs from 'fs';
import * as path from 'path';

function clearFolder(folderPath: string): void {
    // Read all entries (files and folders) inside the specified folder
    const entries = fs.readdirSync(folderPath);

    for (const entry of entries) {
        const fullPath = path.join(folderPath, entry);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            // Recursively remove the subfolder
            clearFolder(fullPath);
            // After clearing the subfolder, remove the empty folder
            fs.rmdirSync(fullPath);
        } else {
            // If it's a file, delete it
            fs.unlinkSync(fullPath);
        }
    }
}

const folderPath = './ingestedPackages';
clearFolder(folderPath);