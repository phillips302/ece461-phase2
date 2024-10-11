import { gql } from 'graphql-request';
import { logMessage, gitHubRequest } from './utils.js';
import * as dotenv from 'dotenv';

dotenv.config();

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

export async function fetchPullRequestsWithReviews(owner: string, name: string): Promise<RequestNode[]> {
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

    while (hasNextPage) {
        try {
            const response: FetchResponse = await gitHubRequest(query, { owner, name, afterCursor }) as FetchResponse;
            allPullRequests = allPullRequests.concat(response.repository.pullRequests.edges);
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

export async function getPrFraction(owner: string, repo: string): Promise<number> {
    const pullRequests = await fetchPullRequestsWithReviews(owner, repo);
    const fraction = calculatePrFraction(pullRequests);
    return fraction;
}