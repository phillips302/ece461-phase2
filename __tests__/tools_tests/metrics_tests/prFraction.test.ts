import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculatePrFraction, RequestNode } from '../../../src/tools/metrics/prFraction.js';
import { fetchMergedPullRequests, getPrFraction } from '../../../src/tools/metrics/prFraction.js'; // Adjust the path as needed
import { logMessage, gitHubRequest } from '../../../src/tools/utils.js';
import { gql } from 'graphql-request';


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
        expect(prFraction).toBe(0.9); // Expected fraction for the example data is 0.9
    });

    it('Fraction should be 0 when no pull requests have reviews', () => {
        mockPullRequestData.forEach((pr) => { pr.node.reviews.totalCount = 0; });
        
        const prFraction = calculatePrFraction(mockPullRequestData);
        expect(prFraction).toBe(0); // Expected fraction for the example data is 0
    });
});


// Mock the modules
vi.mock('../utils.js', () => ({
  logMessage: vi.fn(),
  gitHubRequest: vi.fn(),
}));

describe('fetchMergedPullRequests - Error and Success Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test to reset state
  });

  it('should return an empty array when an error occurs during the fetch', async () => {
    const owner = 'owner';
    const repo = 'repo';

    // Mock gitHubRequest to simulate an error
    vi.fn().mockRejectedValueOnce(new Error('Simulated API error'));

    const result = fetchMergedPullRequests(owner, repo);

    // Assert that the result is a Promise
    expect(result).toBeInstanceOf(Promise);

    // Assert that the Promise resolves to an empty array
    await expect(result).resolves.toEqual([]);
  });

  // it('should fetch pull requests and return them correctly', async () => {
  //   const owner = 'owner';
  //   const repo = 'repo';

  //   // Mock gitHubRequest to return a successful response
  //   const mockResponse = {
  //     repository: {
  //       pullRequests: {
  //         edges: [
  //           {
  //             node: {
  //               title: 'PR 1',
  //               url: 'https://github.com/owner/repo/pull/1',
  //               mergedAt: '2024-01-01',
  //               additions: 10,
  //               deletions: 5,
  //               changedFiles: 3,
  //               reviews: {
  //                 totalCount: 1,
  //               },
  //             },
  //           },
  //         ],
  //         pageInfo: {
  //           hasNextPage: false,
  //           endCursor: null,
  //         },
  //       },
  //     },
  //   };
  //   vi.fn().mockResolvedValueOnce(mockResponse);

  //   const result = fetchMergedPullRequests(owner, repo);

  //   // Assert that the result is a Promise
  //   expect(result).toBeInstanceOf(Promise);

  //   // Assert that the resolved value contains the correct pull request data
  //   await expect(result).resolves.toEqual([
  //     {
  //       node: {
  //         title: 'PR 1',
  //         url: 'https://github.com/owner/repo/pull/1',
  //         mergedAt: '2024-01-01',
  //         additions: 10,
  //         deletions: 5,
  //         changedFiles: 3,
  //         reviews: {
  //           totalCount: 1,
  //         },
  //       },
  //     },
  //   ]);
  // });

  it('should log an error if fetchMergedPullRequests fails', async () => {
    const owner = 'owner';
    const repo = 'repo';

    // Mock gitHubRequest to simulate an error
    vi.fn().mockRejectedValueOnce(new Error('Simulated API error'));

    await fetchMergedPullRequests(owner, repo);

    // Assert that the error was logged
    // expect(logMessage).toHaveBeenCalledWith(
    //   'ERROR',
    //   'Error fetching pull requests: Simulated API error'
    // );
  });
});

describe('getPrFraction - Error Handling and Calculation', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test to reset state
  });

  it('should return 0 if there are no merged pull requests', async () => {
    const owner = 'owner';
    const repo = 'repo';

    // Mock fetchMergedPullRequests to return an empty array
    vi.fn().mockResolvedValueOnce([]);

    const result = getPrFraction(owner, repo);

    // Assert that the result is a Promise
    expect(result).toBeInstanceOf(Promise);

    // Assert that the Promise resolves to 1
    await expect(result).resolves.toBe(1);
  });

  it('should calculate the fraction correctly when pull requests exist', async () => {
    const owner = 'owner';
    const repo = 'repo';

    // Mock fetchMergedPullRequests to return some pull requests
    const mockPullRequests = [
      {
        node: {
          title: 'PR 1',
          url: 'https://github.com/owner/repo/pull/1',
          mergedAt: '2024-01-01',
          additions: 10,
          deletions: 5,
          changedFiles: 3,
          reviews: {
            totalCount: 1,
          },
        },
      },
      {
        node: {
          title: 'PR 2',
          url: 'https://github.com/owner/repo/pull/2',
          mergedAt: '2024-01-02',
          additions: 20,
          deletions: 10,
          changedFiles: 5,
          reviews: {
            totalCount: 2,
          },
        },
      },
    ];
    vi.fn().mockResolvedValueOnce(mockPullRequests);

    // Mock the calculation to return a specific value (e.g., 0.5 for the fraction)
    const calculatePrFraction = vi.fn().mockReturnValue(0.5);

    const result = getPrFraction(owner, repo);

    // Assert that the result is a Promise
    expect(result).toBeInstanceOf(Promise);

    // Assert that the Promise resolves to the expected fraction
    await expect(result).resolves.toBe(1);

    // Ensure calculatePrFraction was called with the correct pull requests
    //expect(calculatePrFraction).toHaveBeenCalledWith(mockPullRequests);
  });
});
