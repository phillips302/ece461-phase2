import { Buffer } from 'buffer';
import axios from 'axios';
import { getOwnerRepo } from '../tools/utils.js';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import process from 'process';

export async function contentToURL(Content: string): Promise<string> {
    type PackageJson = {
    repository?: { url?: string };
    homepage?: string;
    };

    const extractPath = path.join(process.cwd(), 'extracted');
    const zipFilePath = path.join(process.cwd(), 'package.zip');
    try {
        // Step 1: Decode the base64 string to a buffer
        const zipBuffer = Buffer.from(Content, 'base64');

        // Step 2: Save the buffer as a zip file
        fs.writeFileSync(zipFilePath, zipBuffer);

        // Step 3: Extract the zip file
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(extractPath, true);

        // Step 4: Read the package.json file
        const packageJsonPath = findPackageJson(extractPath);
        if (packageJsonPath) {
            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
            const packageJson: PackageJson = JSON.parse(packageJsonContent);

            // Step 5: Get the URL
            let url = packageJson.repository?.url || packageJson.homepage || 'Failed to get the url';
            url = url.replace(/^git\+/, "");
            url = url.replace(/^git:\/\//, ""); //try delteing these tomorrow
            return url;
        } else {
            return 'Failed to get the url';
        }
    } catch (error) {
        return 'Failed to get the url';
    } finally {
        // Step 6: Delete the extracted directory
        if (fs.existsSync(extractPath)) {
            fs.rmSync(extractPath, { recursive: true, force: true });
        }
        if (fs.existsSync(zipFilePath)) {
            fs.unlinkSync(zipFilePath);
        }
    }
}

export async function urlToContent(url: string): Promise<string> {
    const { owner, repo } = await getOwnerRepo(url);

    try {
        // Step 1: Fetch the repository metadata to get the default branch
        const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
        const mainBranch = repoResponse.data.default_branch;

        // Step 2: Fetch the ZIP file for the default branch
        const zipResponse = await axios.get(`https://github.com/${owner}/${repo}/archive/refs/heads/${mainBranch}.zip`,
            { responseType: 'arraybuffer' }
        );

        // Step 3: Convert the ZIP file's data into a Base64 string
        const zipAsString = Buffer.from(zipResponse.data).toString('base64');
        return zipAsString;
    } catch (error) {
        return 'Failed to get the zip file';
    }
}


export function findPackageJson(directory: string): string | null {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            const result = findPackageJson(fullPath);
            if (result) return result;
        } else if (file === 'package.json') {
            return fullPath;
        }
    }
    return null;
}