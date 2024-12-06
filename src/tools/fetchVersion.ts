import { version } from "os";
import {gitHubRequest, logMessage, npmToGitHub} from "./utils.js";

/**
 * Fetches the version histories (releases) of a GitHub repository.
 * @param owner - The owner of the GitHub repository.
 * @param repo - The name of the GitHub repository.
 * @returns A promise that resolves to an array of release objects or an empty array if none found.
 */

interface GitHubRelease {
    name: string;
    tagName: string;
    publishedAt: string;
    url: string;
}

interface GitHubReleaseResponse {
    data: {
        repository: {
            releases: {
                nodes: GitHubRelease[];
            };
        };
    };
}

export async function fetchVersion(owner: string, repo: string): Promise<string | null> {
    const query = `
        query ($owner: String!, $repo: String!) {
            repository(owner: $owner, name: $repo) {
                releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
                    nodes {
                        name
                        tagName
                        publishedAt
                        url
                    }
                }
            }
        }
    `;
    try {
        const variables = { owner, repo };
        const response = await gitHubRequest(query, variables) as GitHubReleaseResponse;

        const releases = response.data.repository.releases.nodes;

        // Return the most recent release or null if none exist
        return releases && releases.length > 0 ? releases[0].tagName : null;
    } catch (error) {
        logMessage("ERROR", `Error fetching version history for ${owner}/${repo}: ${error}`);
        return null;
    }

}

/*
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
*/
