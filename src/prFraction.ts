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
        };
    };
};

function calculatePrFraction(pullRequests: RequestNode[]): number {
    let totalCodeChanges = 0;
    let reviewedCodeChanges = 0;

    pullRequests.forEach((pr: any) => {
        const additions = pr.node.additions;
        const deletions = pr.node.deletions;
        const changedFiles = pr.node.changedFiles;
        const totalChanges = additions + deletions;
  
        // Increment total code changes
        totalCodeChanges += totalChanges;
  
        // Check if the PR had a review
        if (pr.node.reviews.totalCount > 0) {
          // If the PR was reviewed, increment reviewed code changes
          reviewedCodeChanges += totalChanges;
        }
    });
    // console.log(`Total changes: ${totalCodeChanges}`);
    // console.log(`Total reviewed changes: ${reviewedCodeChanges}`);

    const fractionReviewed = reviewedCodeChanges / totalCodeChanges;
    return parseFloat(fractionReviewed.toFixed(2));
}

// Execute the query
export async function fetchPullRequestsWithReviews(owner: string, name: string): Promise<RequestNode[]> {
    // Define the GraphQL query to get merged pull requests with reviews
    const query = gql`
        query($owner: String!, $name: String!) {
            repository(owner: $owner, name: $name) {
            pullRequests(first: 100, states: MERGED) {
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
            }
            }
        }
    `;

    try {
        const response: FetchResponse = await gitHubRequest(query, {owner, name}) as FetchResponse;
        return response.repository.pullRequests.edges;
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error occurred';
        logMessage('ERROR', `Error fetching contributors for BusFactor: ${errorMessage}`);
        return [];
    }
}

export async function getPrFraction(owner: string, repo: string): Promise<number> {
    const pullRequests = await fetchPullRequestsWithReviews(owner, repo);
    const fraction = calculatePrFraction(pullRequests);
    return fraction;
}