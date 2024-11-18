import JSZip from 'jszip';
import { Buffer } from 'buffer';
import axios from 'axios';
import { getOwnerRepo } from '../tools/utils.js';

export async function contentToURL(Content: string): Promise<string> {
    const buffer = Buffer.from(Content, 'base64');

    // Load the zip content
    const zip = await JSZip.loadAsync(buffer);

    // Locate and read package.json
    const packageJsonFile = zip.file('package.json');
    if (packageJsonFile) {
      const packageJsonContent = await packageJsonFile.async('string');
      const packageData = JSON.parse(packageJsonContent);

      // Access the homepage URL
      if (packageData.homepage) {
        return packageData.homepage;
      } else {
        return 'Failed to get the url';
      }
    } else {
      return 'Failed to get the url';
    }
}

export async function urlToContent(url: string): Promise<string> {
    const { owner, repo } = await getOwnerRepo(url);

    try {
        let response = await axios.get(`https://github.com/${owner}/${repo}`);
        const mainBranch = response.data.default_branch;

        response = await axios.get((`https://github.com/${owner}/${repo}/archive/refs/heads/${mainBranch}.zip`), {
            responseType: 'arraybuffer'
        });
      
        const zipAsString = Buffer.from(response.data).toString('base64');
        return zipAsString;
        
    } catch (error) {
        return 'Failed to get the zip file';
    }
}
