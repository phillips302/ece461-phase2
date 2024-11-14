import { describe, it, expect } from 'vitest';
import { calculatePrFraction, RequestNode } from '../../../src/tools/metrics/prFraction.js';

const mockPullRequestData: RequestNode[] = [
    {
      node: {
        title: "Fix issue with user login",
        url: "https://github.com/example/repo/pull/1",
        mergedAt: "2023-10-01T12:00:00Z",
        additions: 100,
        deletions: 60,
        changedFiles: 3,
        reviews: {
          totalCount: 1
        }
      }
    },
    {
      node: {
        title: "Add new feature for dashboard",
        url: "https://github.com/example/repo/pull/2",
        mergedAt: "2023-10-05T15:30:00Z",
        additions: 200,
        deletions: 50,
        changedFiles: 5,
        reviews: {
          totalCount: 2
        }
      }
    },
    {
      node: {
        title: "Update dependencies and fix security issues",
        url: "https://github.com/example/repo/pull/3",
        mergedAt: "2023-10-10T08:45:00Z",
        additions: 20,
        deletions: 70,
        changedFiles: 2,
        reviews: {
          totalCount: 3
        }
      }
    }
  ];

describe('Pull Request Fraction Calculation', () => {
    it('Fraction should be 1 when all of the pull requests have reviews', () => {
        
        const prFraction = calculatePrFraction(mockPullRequestData);
        expect(prFraction).toBe(1); // Expected fraction for the example data is 0.5
    });

    it('Fraction should be 0.5 when half the changes come from pull requests with reviews', () => {
        mockPullRequestData[1].node.reviews.totalCount = 0;
        
        const prFraction = calculatePrFraction(mockPullRequestData);
        expect(prFraction).toBe(0.5); // Expected fraction for the example data is 0.5
    });

    it('Fraction should be 0 when no pull requests have reviews', () => {
        mockPullRequestData.forEach((pr) => { pr.node.reviews.totalCount = 0; });
        
        const prFraction = calculatePrFraction(mockPullRequestData);
        expect(prFraction).toBe(0); // Expected fraction for the example data is 0
    });
});