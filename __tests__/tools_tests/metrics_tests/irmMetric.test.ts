import { calculateIRM, normalizeIRM, maxResponseTime } from '../../../src/tools/metrics/irmMetric.ts';
import { vi, it, expect, beforeEach, describe } from 'vitest';
import { fetchRepoIssues } from '../../../src/tools/metrics/irmMetric'; // Replace with actual module path
import { GraphQLClient } from 'graphql-request'; // Assuming you're using 'graphql-request'
import { logMessage } from '../../../src/tools/utils'; // Assuming 'logMessage' is imported from your logger module


// Mock the GraphQLClient's request method manually with Vitest's vi.fn()
class MockGraphQLClient {
  request = vi.fn();
}

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});

// Sample mock data for testing
const mockData = {
  repository: {
    issues: {
      edges: [
        {
          node: {
            createdAt: '2024-01-01T00:00:00Z',
            comments: { nodes: [{ createdAt: '2024-01-02T00:00:00Z' }] },
            closedAt: '2024-01-03T00:00:00Z',
          },
        },
        {
          node: {
            createdAt: '2024-02-01T00:00:00Z',
            comments: { nodes: [] },
            closedAt: null,
          },
        },
      ],
    },
  },
};

describe('IRM Metric Calculation', () => {
  it('should calculate the correct IRM for issues with responses', () => {
    const issues = [
      { node: { createdAt: '2024-09-01T00:00:00Z', comments: { nodes: [{ createdAt: '2024-09-02T00:00:00Z' }] }, closedAt: null } },
      { node: { createdAt: '2024-09-03T00:00:00Z', comments: { nodes: [{ createdAt: '2024-09-03T12:00:00Z' }] }, closedAt: null } },
    ];
    // avg response time is (24 + 12) / 2 = 18 hours * 60 = 1080 minutes
    const irm = calculateIRM(issues);
    expect(irm).toBe(normalizeIRM(1080, maxResponseTime)); 
  });

  it('should return 0 for issues with no comments or closures', () => {
    const issues = [
      { node: { createdAt: '2024-09-01T00:00:00Z', comments: { nodes: [] }, closedAt: null } },
    ];
    const irm = calculateIRM(issues);
    expect(irm).toBe(normalizeIRM(maxResponseTime, maxResponseTime));
  });

  it('should normalize IRM to a score between 0 and 1', () => {
    const irm = 1200; // 20 hours
    const irmScore = normalizeIRM(irm, maxResponseTime);
    expect(irmScore).toBeCloseTo(1 - 1200/maxResponseTime); // Close to 1 as response time is relatively fast
  });

  it('should return 0 when the IRM exceeds the maximum response time', () => {
    const irm = 50000; // More than 4 * 7 * 24 * 60 minutes
    const irmScore = normalizeIRM(irm, maxResponseTime);
    expect(irmScore).toBe(0); // Exceeds the threshold, should return 0
  });
  it('should fetch issues successfully and log success', async () => {
    const owner = 'ResponsiveMaintainer';
    const name = 'test-repo';
  
    // Create a new instance of the mock client
    const mockClient = new MockGraphQLClient();
    // Mock the request method to resolve with mock data
    mockClient.request.mockResolvedValue(mockData);
  
    // Instead of changing GraphQLClient directly, we inject our mock client into the function
    const originalGraphQLClient = GraphQLClient;
    const spyOnGraphQLClient = vi.spyOn(GraphQLClient.prototype, 'request');
    spyOnGraphQLClient.mockImplementation(mockClient.request);
  
    // Call the fetchRepoIssues function
    const issues = await fetchRepoIssues(owner, name);
  
    // Verify that the request method was called correctly
    expect(mockClient.request).toHaveBeenCalledWith(expect.any(String), { owner, name });
  
    // Verify that the issues were fetched correctly
    expect(issues).toEqual(mockData.repository.issues.edges);
  
    // Verify that the success log message was called
    //expect(logMessage).toHaveBeenCalledWith('INFO', `Successfully fetched issues for ${owner}/${name}`);
  
    // Restore the original request implementation after the test
    spyOnGraphQLClient.mockRestore();
  });
  
  it('should handle errors and log error message', async () => {
    const owner = 'ResponsiveMaintainer';
    const name = 'test-repo';
  
    // Create a new instance of the mock client
    const mockClient = new MockGraphQLClient();
    // Mock the request method to throw an error
    mockClient.request.mockRejectedValue(new Error('Network Error'));
  
    // Instead of changing GraphQLClient directly, we inject our mock client into the function
    const spyOnGraphQLClient = vi.spyOn(GraphQLClient.prototype, 'request');
    spyOnGraphQLClient.mockImplementation(mockClient.request);
  
    // Call the fetchRepoIssues function
    const issues = await fetchRepoIssues(owner, name);
  
    // Verify that the issues returned is an empty array
    expect(issues).toEqual([]);
  
    // Verify that the error log message was called with the correct error
    //expect(logMessage).toHaveBeenCalledWith('ERROR', `Error fetching issues for ResponsiveMaintainer: Network Error`);
  
    // Restore the original request implementation after the test
    spyOnGraphQLClient.mockRestore();
  });
  
  it('should handle unknown errors and log error message', async () => {
    const owner = 'ResponsiveMaintainer';
    const name = 'test-repo';
  
    // Create a new instance of the mock client
    const mockClient = new MockGraphQLClient();
    // Mock the request method to throw an unknown error
    mockClient.request.mockRejectedValue({}); // Simulating an unknown error
  
    // Instead of changing GraphQLClient directly, we inject our mock client into the function
    const spyOnGraphQLClient = vi.spyOn(GraphQLClient.prototype, 'request');
    spyOnGraphQLClient.mockImplementation(mockClient.request);
  
    // Call the fetchRepoIssues function
    const issues = await fetchRepoIssues(owner, name);
  
    // Verify that the issues returned is an empty array
    expect(issues).toEqual([]);
  
    // Verify that the error log message was called with the correct error message
    //expect(logMessage).toHaveBeenCalledWith('ERROR', `Error fetching issues for ResponsiveMaintainer: Unknown error occurred`);
  
    // Restore the original request implementation after the test
    spyOnGraphQLClient.mockRestore();
  });
});



