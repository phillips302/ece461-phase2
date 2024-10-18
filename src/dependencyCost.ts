import { logMessage, getOwnerRepo } from "./utils.js";
import { ingestPackageFree } from "./ingest.js";
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';

interface PackageLockJson {
    name: string;
    version: string;
    lockfileVersion: number;
    requires?: boolean;
    packages?: {
        [packagePath: string]: {
        version: string;
        resolved: string;
        integrity?: string;
        dev?: boolean;
        };
    };
}

export async function saveSeenPackagesToFile(seenPackages: Map<string | null, number>, filePath: string): Promise<void> {
    const objectToWrite = Object.fromEntries(seenPackages); // Convert Map to an object
    const jsonData = JSON.stringify(objectToWrite, null, 2); // Pretty print with indentation
    try {
      await fs.writeFile(filePath, jsonData, 'utf-8');
      logMessage(`INFO`, `Seen packages saved to ${filePath}`);
    } catch (error) {
      logMessage(`DEBUG`, `Error saving seenPackages to file: ${error}`);
    }
}

export async function loadSeenPackagesFromFile(filePath: string): Promise<Map<string | null, number>> {
    try {
      const jsonData = await fs.readFile(filePath, 'utf-8');
      const objectData = JSON.parse(jsonData); // Parse the JSON string back into an object
      return new Map(Object.entries(objectData)); // Convert the object back into a Map
    } catch (error) {
        logMessage(`INFO`, `No existing seenPackages file found, starting fresh.`);
        return new Map(); // Return an empty map if the file doesn't exist
    }
}

export async function packageLockExists(): Promise<boolean> {
    try {
      await fs.access('package-lock.json');
      logMessage('INFO', 'package-lock.json already exists.');
      return true;
    } catch (error) {
      logMessage('INFO', 'package-lock.json does not exist.');
      return false;
    }
}
  
// Function to generate package-lock.json only if it doesn't already exist
export async function generatePackageLock(): Promise<void> {
    const exists = await packageLockExists();
    if (exists) {
        logMessage('INFO', 'Skipping package-lock.json generation because it already exists.');
        return;
    }
    return new Promise((resolve, reject) => {
        exec('npm install --package-lock-only --package-lock', (error, stdout, stderr) => {
        if (error) {
            console.error(stderr);
            reject(new Error(`Failed to generate package-lock.json: ${error.message}`));
            return;
        }
        logMessage(`INFO`, 'Generated package-lock.json successfully.');
        resolve();
        });
    });
}

export async function getDirectorySize(dir: string): Promise<number> {
    let totalSize: number = 0;
  
    // Read all items (files and directories) in the current directory
    const files = await fs.readdir(dir, { withFileTypes: true });
  
    for (const file of files) {
      const filePath = join(dir, file.name);
  
      if (file.isDirectory()) {
        // Recursively calculate the size of the directory
        totalSize += await getDirectorySize(filePath);
      } else if (file.isFile()) {
        // Get the file size and add it to the total size
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }
    }
  
    return totalSize;
}

export async function getFileSize(url: string): Promise<number> {
    try {
      // Using GET instead of HEAD to fetch the headers
      const response = await fetch(url, { method: 'GET' });
      // Get the 'content-length' from headers
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength, 10) : 0;
    } catch (error) {
      console.error(error);
      return 0;
    }
}

export async function readPackageJson(): Promise<{ dependencies: string[], devDependencies: string[] }> {
    try {
        const packageData = await fs.readFile('package.json', 'utf-8');
        const packageJson = JSON.parse(packageData);
        const dependencies = Object.keys(packageJson.dependencies || {});
        const devDependencies = Object.keys(packageJson.devDependencies || {});
        return { dependencies, devDependencies };
    } catch (error) {
        logMessage(`DEBUG`, `Failed to read package.json: ${error}`);
        return { dependencies: [], devDependencies: [] };
    }
}

export async function readPackageLock(): Promise<PackageLockJson | undefined> {
    try {
      const packageLockData = await fs.readFile('package-lock.json', 'utf-8');
      const packageLock: PackageLockJson = JSON.parse(packageLockData);
      return packageLock;
    } catch (error) {
      logMessage('DEBUG', `Failed to read package-lock.json: ${error}`);
      return undefined; // Return undefined in case of failure
    }
}

export async function calculateDependenciesSize(packageLock: PackageLockJson | undefined, packages: string[], seenPackages: Map<string | null, number>): Promise<number> {
    let totalSize = 0;

    async function traversePackages(packagesMap: PackageLockJson['packages']): Promise<void> {
        for (const [packagePath, details] of Object.entries(packagesMap || {})) {
        const packageName = packagePath.replace('node_modules/', '');

        // Check if the package name exists in the list of dependencies or devDependencies
        if (packages.includes(packageName) && details.resolved) {
            if (seenPackages.has(packageName)) {
                totalSize += seenPackages.get(packageName) || 0;
            } else {
                const resolvedUrl = details.resolved;
                logMessage(`INFO`, `Found resolved URL for ${packageName}: ${resolvedUrl}`);
                let fileSize = await getFileSize(resolvedUrl);
                fileSize = fileSize;
                logMessage(`INFO`, `Size of ${packageName}: ${fileSize} KB`);
                seenPackages.set(packageName, fileSize);
                totalSize += fileSize;
            }
        }
        }
    }

    if (packageLock?.packages) {
        await traversePackages(packageLock.packages);
    }

    return totalSize;
}
  
/*
1. navigate to the folder where the package is stored
2. run the command npm install --package-lock-only
3. read the package-lock.json file
    3.1 parse the file and find each of the .tgz files
4. for each of the .tgz files, get the size using the getFileSize function
    4.1 sum all sizes
5. add the sum to the totalSize
*/
export async function getPackageSize(owner: string | null, name: string | null, seenPackages: Map<string | null, number>): Promise<number> {
    let totalSize: number = 0;
    if (seenPackages.has(name)) {
        return seenPackages.get(name) || 0;
    }

    totalSize += await getDirectorySize(process.cwd());
    seenPackages.set(name, totalSize);
    logMessage(`INFO`, `Size of ${name}: ${totalSize} KB`);

    //Step 2
    logMessage(`INFO`, `Generating package-lock.json for ${name}`);
    await generatePackageLock();

    //Step 3
    const packageLock = await readPackageLock();
    const { dependencies, devDependencies } = await readPackageJson();
    const allPackages = [...dependencies, ...devDependencies];

    //Step 4
    const dependenciesSize = await calculateDependenciesSize(packageLock, allPackages, seenPackages);

    //Step 5
    totalSize += dependenciesSize;
    return totalSize;
}

export async function removeDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      logMessage('INFO', `Directory ${dirPath} removed successfully.`);
    } catch (error) {
      logMessage('ERROR', `Failed to remove directory ${dirPath}: ${error}`);
    }
  }

export async function changeDirectory(dir: string): Promise<void> {
    try {
        await fs.access(dir);
        logMessage('INFO', `Directory exists: ${dir}`);
    } catch (err) {
        // Directory doesn't exist, so create it
        logMessage('DEBUG', `Directory does not exist, creating: ${dir}`);
        await fs.mkdir(dir, { recursive: true });
        logMessage('INFO', `Directory created: ${dir}`);
    }

    process.chdir(dir);
    logMessage('INFO', `Moved into directory: ${process.cwd()}`);
}

/**
 * Finds the cumulative size of all the packages in the given URLs.
 * @param urls - The URLs of the packages to be analyzed.
 * @returns number - The cumulative size of all the packages in MB.
 */
export async function getCumulativeSize(urls: string[]): Promise<number> {
    const packageCostFile = './files/seenPackages.json';
    let seenPackages = await loadSeenPackagesFromFile(packageCostFile);
    let cumulativeSize: number = 0;
    await changeDirectory("./packageCost");

    for (const url of urls) {
        const { owner, repo } = await getOwnerRepo(url);
        const packageDir = `./${repo}`;
        await ingestPackageFree(owner, repo, packageDir);
        await changeDirectory(packageDir);
        cumulativeSize += await getPackageSize(owner, repo, seenPackages);
        await changeDirectory("../");
    }
    await changeDirectory("../");
    await Promise.all([
        saveSeenPackagesToFile(seenPackages, packageCostFile),
        removeDirectory("./packageCost")
      ]);
    return cumulativeSize / 1024 / 1024;
}
