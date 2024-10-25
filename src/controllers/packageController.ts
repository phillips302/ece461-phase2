import { Request, Response } from 'express';
import { getPackageNames, getRepositoryUrl } from '../tools/fetchPackages.js';
import { getOwnerRepo } from '../tools/utils.js';
import { fetchVersionHistory } from '../tools/fetchVersion.js';

export const getPackageInfo = async (req: Request, res: Response) => {
    let packages = []
    const packageNames = getPackageNames('./ingestedPackages');
    for (const name of packageNames) {
        const url = getRepositoryUrl(`./ingestedPackages/${name}`);
        let owner: string | null = null;
        let repo: string | null = null;
        let versionHistory: string = "";
        if (url) {
            ({ owner, repo } = await getOwnerRepo(url));
        }
        if (owner && repo) {
            versionHistory = await fetchVersionHistory(owner, repo);
        }
        packages.push({ Version: versionHistory, Name: name.charAt(0).toUpperCase() + name.slice(1), ID: name });
    }
  res.json(packages);
};