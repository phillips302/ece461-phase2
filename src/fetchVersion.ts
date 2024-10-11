import {gitHubRequest} from "./utils.js";
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

export async function fetchVersionHistory(owner: string, repo: string): Promise<ReleaseNode[]> {
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
    console.log("All Releases",allReleases);
    return allReleases;
}


