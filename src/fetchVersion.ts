import { version } from "os";
import {gitHubRequest, logMessage, npmToGitHub} from "./utils.js";

/**
 * Fetches the version histories (releases) of a GitHub repository.
 * @param owner - The owner of the GitHub repository.
 * @param repo - The name of the GitHub repository.
 * @returns A promise that resolves to an array of release objects or an empty array if none found.
 */
interface ReleaseNode {
    tagName: string;
    publishedAt: string;
    name: string;
    description: string;
}

interface VersionHistoryResponse {
    repository: {
        releases: {
            nodes: ReleaseNode[];
            pageInfo: {
                hasNextPage: boolean;
                endCursor: string | null;
            };
        };
    };
}

export async function fetchVersionHistory(owner: string, repo: string): Promise<string> {
    const allReleases: ReleaseNode[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    while (hasNextPage) {
        const query = `
            query ($owner: String!, $repo: String!, $after: String) {
                repository(owner: $owner, name: $repo) {
                    releases(first: 100, after: $after) {
                        nodes {
                            tagName
                            publishedAt
                            name
                            description
                        }
                        pageInfo {
                            hasNextPage
                            endCursor
                        }
                    }
                }
            }
        `;

        const variables = { owner, repo, after: endCursor };
        const data = await gitHubRequest(query, variables) as VersionHistoryResponse;
        
        // Append the new releases to the allReleases array
        allReleases.push(...data?.repository?.releases?.nodes || []);
        
        // Update pagination info
        hasNextPage = data.repository.releases.pageInfo.hasNextPage;
        endCursor = data.repository.releases.pageInfo.endCursor;
    }
    if(allReleases.length > 0){
        //Sorts the version history into format "earliestVersion - latestVersion"
        const sortedVersionHistory = allReleases.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
        const earliestVersion = sortedVersionHistory[0].tagName.replace(/^v/, ''); // Remove leading 'v'
        const latestVersion = sortedVersionHistory[sortedVersionHistory.length - 1].tagName.replace(/^v/, ''); // Remove leading 'v'
        const versionRange = `${earliestVersion} - ${latestVersion}`;
        return(versionRange);    

    }
    else{
        logMessage("INFO", `No version history found for ${owner}/${repo}`);
        return "No version history";
    }
    
}


