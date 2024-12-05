import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';
import { getLinkType, logMessage, getOwnerRepo } from "./utils.js";
import { readAllPackages } from '../rds/index.js';

/**
 * Searches for packname or README content for a given regular expression.
 * 
 * @param regex_string - The regular expression as a string to match.
 * @returns Promise<void>
 */

export async function searchPackages(regex_string: string): Promise<{ Version: string; Name: string }[]> {
    let regex = new RegExp(regex_string);
    let matchedPackages: { Version: string; Name: string }[] = [];

    const dir = `./ingestedPackages`;

    try {
        // Read the directories (packages) in the ingestedPackages folder
        const packages = await fs.readdir(dir, { withFileTypes: true });
        
        for (const packageDir of packages) {
            if (packageDir.isDirectory()) {
                const packageName = packageDir.name;
                const packagePath = path.join(dir, packageName);
                
                let match = false;

                // Search in the package name
                if (regex.test(packageName)) {
                    logMessage('INFO', `Matched package name: ${packageName}`);
                    match = true;
                }

                // Search in the README.md file (if it exists)
                let readmePath = path.join(packagePath, 'README.md');
                try {
                    let readmeContent = await fs.readFile(readmePath, 'utf8');
                    if (regex.test(readmeContent)) {
                        logMessage('INFO', `Matched README in package: ${packageName}`);
                        match = true;
                    }
                } catch (err) {
                    try{
                        readmePath = path.join(packagePath, 'readme.markdown');
                        let readmeContent = await fs.readFile(readmePath, 'utf8');
                        if (regex.test(readmeContent)) {
                            logMessage('INFO', `Matched README in package: ${packageName}`);
                            match = true;
                        }
                    } catch (err){
                        logMessage('DEBUG', `README not found for package: ${packageName}`);
                        return matchedPackages
                    }
                }

                // If a match is found, copy the package directory to the results directory
                if (match) {
                    let packageJsonPath = path.join(packagePath, 'package.json');
                    try {
                        let packageContent = await fs.readFile(packageJsonPath, 'utf8');
                        let packageData = JSON.parse(packageContent); // Parse the JSON content
                        let packageVersion = packageData.version || 'unknown'; // Extract version
                        matchedPackages.push({ Version: packageVersion, Name: packageName });

                        logMessage('INFO', `Copied matched package: ${packageName}, Version: ${packageVersion}`);
                    } catch (err) {
                        logMessage('DEBUG', `package.json not found or invalid for package: ${packageName}`);
                        return matchedPackages
                    }
                }
            }
        }
    } catch (err) {
        logMessage('ERROR', `Error during package search: ${err}`);
        return matchedPackages
    }
    logMessage('INFO', JSON.stringify(matchedPackages, null, 2))
    return matchedPackages
}

export async function searchPackagesRDS(regex_string: string): Promise<{ ID: string }[]> {
    console.log('searchPackagesRDS');
    let regex = new RegExp(regex_string);
    let matchedPackages: { ID: string }[] = [];

    try {
        // Read the directories (packages) in the ingestedPackages folder
        const packages = await readAllPackages();

        if (!packages || packages.length === 0) {
            console.log('No packages found in the database');
            logMessage('INFO', 'No packages found in the database');
            return matchedPackages;
        }
        
        for (const pkg of packages) {
            // Search in the package name
            if (regex.test(pkg.metadata.Name)) {
                console.log('Matched package name:', pkg.metadata.Name);
                logMessage('INFO', `Matched package name: ${pkg.metadata.Name}`);
                matchedPackages.push({ ID: pkg.metadata.ID });
            }

            // Search in the README.md file (if it exists)
            if(pkg.data.URL) {
                let readmeContent = '';
                if(getLinkType(pkg.data.URL) === 'GitHub'){
                    try {
                        const { owner, repo } = await getOwnerRepo(pkg.data.URL);
                        const response = await axios.get(
                          `https://api.github.com/repos/${owner}/${repo}/readme`,
                          {
                            headers: {
                              Accept: 'application/vnd.github.v3.raw',
                            },
                          }
                        );
                        readmeContent = response.data;
                    } catch (error) {
                        logMessage('ERROR', 'Error fetching README from GitHub');
                    }
                } else {
                    try {
                        const response = await axios.get(`https://registry.npmjs.org/${pkg.metadata.Name}`);
                        readmeContent = response.data.readme;
                    } catch (error) {
                        logMessage('ERROR', 'Error fetching README from NPM');
                    }
                }

                if (regex.test(readmeContent)) {
                    logMessage('INFO', `Matched README in package: ${pkg.metadata.Name}`);
                    matchedPackages.push({ ID: pkg.metadata.ID });
                }
            }
        }
    } catch (err) {
        logMessage('ERROR', `Error during package search: ${err}`);
        return matchedPackages
    }
    logMessage('INFO', JSON.stringify(matchedPackages, null, 2))
    return matchedPackages;
}