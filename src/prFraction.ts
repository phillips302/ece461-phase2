import { gql } from 'graphql-request';
import { logMessage, gitHubRequest } from './utils.js';
import * as dotenv from 'dotenv';

dotenv.config();

// stores data of each pull request
type RequestNode = {
    node: {
        title: string;
        url: string;
        mergedAt: string;
        additions: number;
        deletions: number;
        changedFiles: number;
        reviews: {
          totalCount: number;
        };
    };
};

//response data from the GitHub API
type FetchResponse = {
    repository: {
        pullRequests: {
            edges: RequestNode[];
            pageInfo: {
                hasNextPage: boolean;
                endCursor: string;
            };
        };
    };
};

/**
 * Calculates the fraction of project code that was introduced through pull requests with a code review.
 * 
 * This function adds the number of additions and deletions from each merged pull request and returns the ratio
 * of how many were from reviewed requests to the total changes.
 * 
 * @param pullRequests - An array of `RequestNode` objects representing the pull Request data.
 * @returns The pull request fraction, which is the ratio of changes from reviewed pull requests to the total changes.
 */
function calculatePrFraction(pullRequests: RequestNode[]): number {
    let totalCodeChanges = 0;
    let reviewedCodeChanges = 0;

    pullRequests.forEach((pr: RequestNode) => {
        const additions = pr.node.additions;
        const deletions = pr.node.deletions;
        const totalChanges = additions + deletions;

        // Increment total code changes
        totalCodeChanges += totalChanges;

        // Check if the PR had a review
        if (pr.node.reviews.totalCount > 0) {
          // If the PR was reviewed, increment reviewed code changes
          reviewedCodeChanges += totalChanges;
        }
    });

    const fractionReviewed = reviewedCodeChanges / totalCodeChanges;
    return parseFloat(fractionReviewed.toFixed(2));
}

/**
 * Fetches the merged pull requests of a given GitHub repository.
 *
 * @param owner - The owner of the repository.
 * @param name - The name of the repository.h * @returns A promise that resolves to an array of commit nodes representing the contributors. *
 * @throws Will log an error message if the request fails and return an empty array. * * @example * ```typescript * const contributors = await fetchRepoContributors('octocat', 'Hello-World'); * console.log(contributors); * ```
 * @returns A promise that resolves to an array of pull request nodes, each containing pull request details.
 */
export async function fetchMergedPullRequests(owner: string, name: string): Promise<RequestNode[]> {
    const query = gql`
        query($owner: String!, $name: String!, $afterCursor: String) {
            repository(owner: $owner, name: $name) {
                pullRequests(first: 100, after: $afterCursor, states: MERGED) {
                    edges {
                        node {
                            title
                            url
                            mergedAt
                            additions
                            deletions
                            changedFiles
                            reviews(first: 1) {
                                totalCount
                            }
                        }
                    }
                    pageInfo {
                        hasNextPage
                        endCursor
                    }
                }
            }
        }
    `;

    let allPullRequests: RequestNode[] = [];
    let hasNextPage = true;
    let afterCursor = null;

    //Loop through each page of pull requests, so its not only limited to the first 100
    while (hasNextPage) {
        try {
            //fetch pull request daya from current page and add it to to the total pull request data
            const response: FetchResponse = await gitHubRequest(query, { owner, name, afterCursor }) as FetchResponse;
            allPullRequests = allPullRequests.concat(response.repository.pullRequests.edges);

            //update page and cursor data
            hasNextPage = response.repository.pullRequests.pageInfo.hasNextPage;
            afterCursor = response.repository.pullRequests.pageInfo.endCursor;
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : 'Unknown error occurred';
            logMessage('ERROR', `Error fetching pull requests: ${errorMessage}`);
            return [];
        }
    }

    return allPullRequests;
}

/**
 * Calculates the reviewed pull request fraction for a given repository.
 * The pull request fraction is the ratio of changes from reviewed pull requests to the total changes.
 * 
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @returns A promise that resolves to the PR fraction, a number between 0 and 1.
 */
export async function getPrFraction(owner: string, repo: string): Promise<number> {
    const pullRequests = await fetchMergedPullRequests(owner, repo);
    const fraction = calculatePrFraction(pullRequests);
    return fraction;
}