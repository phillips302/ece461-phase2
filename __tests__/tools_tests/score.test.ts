import { describe, it, expect, vi, beforeEach } from 'vitest'; //Working score.test.ts Test 12344444444444
import { getScores } from '../../src/tools/score';;
import { PackageRating } from "../../src/apis/types.js";
import * as latencyModule from '../../src/tools/metrics/latency';

// Mock the entire latency module
vi.mock('./metrics/latency', () => ({
  measureConcurrentLatencies: vi.fn(() => Promise.resolve({
    results: [],
    latencies: [],
    errors: []
  }))
}));

describe('getScores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate scores correctly with all metrics succeeding', async () => {
    const mockResults = [
      0.8,  // rampUp
      0.9,  // correctness
      0.7,  // busFactor
      0.85, // responsiveMaintainer
      1.0,  // license
      0.95, // fractionDependencies
      0.75  // prFraction
    ];

    const mockLatencies = [
      0.1, // rampUp
      0.2, // correctness
      0.15, // busFactor
      0.25, // responsiveMaintainer
      0.1,  // license
      0.3,  // fractionDependencies
      0.2   // prFraction
    ];

    const mockedFunction = vi.fn(() => Promise.resolve({
      results: mockResults,
      latencies: mockLatencies,
      errors: []
    }));

    vi.spyOn(latencyModule, 'measureConcurrentLatencies').mockImplementation(mockedFunction);

    const result = await getScores('owner', 'repo', 'https://github.com/owner/repo');
    const scores: PackageRating = JSON.parse(result);

    // Test individual scores
    expect(scores.RampUp).toBe(0.8);
    expect(scores.Correctness).toBe(0.9);
    expect(scores.BusFactor).toBe(0.7);
    expect(scores.ResponsiveMaintainer).toBe(0.85);
    expect(scores.LicenseScore).toBe(1.0);
    expect(scores.GoodPinningPractice).toBe(0.95);
    expect(scores.PullRequest).toBe(0.75);

    // Test latencies
    expect(scores.RampUpLatency).toBe(0.1);
    expect(scores.CorrectnessLatency).toBe(0.2);
    expect(scores.BusFactorLatency).toBe(0.15);
    expect(scores.ResponsiveMaintainerLatency).toBe(0.25);
    expect(scores.LicenseScoreLatency).toBe(0.1);
    expect(scores.GoodPinningPracticeLatency).toBe(0.3);
    expect(scores.PullRequestLatency).toBe(0.2);

    // Test net score calculation
    const expectedNetScore = Number(((0.125 * 0.8 + 0.125 * 0.9 + 0.25 * 0.7 + 
                                    0.25 * 0.85 + 0.125 * 0.75) * 1.0).toFixed(3));
    expect(scores.NetScore).toBe(expectedNetScore);

    // Test net score latency
    const expectedNetScoreLatency = Number((0.1 + 0.2 + 0.15 + 0.25 + 0.1 + 0.2).toFixed(3));
    expect(scores.NetScoreLatency).toBe(expectedNetScoreLatency);
  });

  it('should handle failed metrics by using default value of 0', async () => {
    const mockResults = [
      null,  // failed rampUp
      0.9,   // correctness
      null,  // failed busFactor
      0.85,  // responsiveMaintainer
      1.0,   // license
      0.95,  // fractionDependencies
      0.75   // prFraction
    ];

    const mockLatencies = [
      0.1, 0.2, 0.15, 0.25, 0.1, 0.3, 0.2
    ];

    const mockedFunction = vi.fn(() => Promise.resolve({
      results: mockResults,
      latencies: mockLatencies,
      errors: ['Error in rampUp', 'Error in busFactor']
    }));

    vi.spyOn(latencyModule, 'measureConcurrentLatencies').mockImplementation(mockedFunction);

    const result = await getScores('owner', 'repo', 'https://github.com/owner/repo');
    const scores: PackageRating = JSON.parse(result);

    expect(scores.RampUp).toBe(0);
    expect(scores.BusFactor).toBe(0);
    expect(scores.Correctness).toBe(0.9);
  });

  it('should handle edge case with all metrics failing', async () => {
    const mockResults = Array(7).fill(null);
    const mockLatencies = Array(7).fill(0.1);

    const mockedFunction = vi.fn(() => Promise.resolve({
      results: mockResults,
      latencies: mockLatencies,
      errors: ['Error 1', 'Error 2', 'Error 3', 'Error 4', 'Error 5', 'Error 6', 'Error 7']
    }));

    vi.spyOn(latencyModule, 'measureConcurrentLatencies').mockImplementation(mockedFunction);

    const result = await getScores('owner', 'repo', 'https://github.com/owner/repo');
    const scores: PackageRating = JSON.parse(result);

    expect(scores.NetScore).toBe(0);
    expect(scores.NetScoreLatency).toBeCloseTo(Number((7 * 0.1).toFixed(3)), 0.1);
  });

  it('should validate URL in output', async () => {
    const mockResults = Array(7).fill(0.5);
    const mockLatencies = Array(7).fill(0.1);

    const mockedFunction = vi.fn(() => Promise.resolve({
      results: mockResults,
      latencies: mockLatencies,
      errors: []
    }));

    vi.spyOn(latencyModule, 'measureConcurrentLatencies').mockImplementation(mockedFunction);

    const testUrl = 'https://github.com/test/repo';
    const result = await getScores('test', 'repo', testUrl);
    const scores: PackageRating = JSON.parse(result);

    expect(JSON.stringify(scores))
  });

  it('should handle empty owner or repo strings', async () => {
    const mockResults = Array(7).fill(0.5);
    const mockLatencies = Array(7).fill(0.1);

    const mockedFunction = vi.fn(() => Promise.resolve({
      results: mockResults,
      latencies: mockLatencies,
      errors: []
    }));

    vi.spyOn(latencyModule, 'measureConcurrentLatencies').mockImplementation(mockedFunction);

    await expect(getScores('', 'repo', 'url')).resolves.not.toThrow();
    await expect(getScores('owner', '', 'url')).resolves.not.toThrow();
  });
});


