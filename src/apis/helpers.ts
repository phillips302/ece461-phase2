import JSZip from 'jszip';
import { Buffer } from 'buffer';
import axios from 'axios';
import { getOwnerRepo } from '../tools/utils.js';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import process from 'process';

export async function contentToURL(Content: string, Name: string): Promise<string> {
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
        const packageJsonPath = path.join(extractPath, `/${Name}/package.json`);
        if (fs.existsSync(packageJsonPath)) {
            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
            const packageJson: PackageJson = JSON.parse(packageJsonContent);

            // Step 5: Get the URL
            const url = packageJson.repository?.url || packageJson.homepage || 'Failed to get the url';
            //return url.replace(/\.git$/, '');
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

// const zipFileBuffer = fs.readFileSync('../browserify-master.zip');
// const base64String = zipFileBuffer.toString('base64');
// console.log(await contentToURL(base64String, 'browserify-master'));

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

//console.log(await urlToContent('https://www.npmjs.com/package/browserify'));