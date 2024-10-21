import * as fs from 'fs';

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
        console.error(`Error reading folder: ${error}`);
        return [];
    }
}