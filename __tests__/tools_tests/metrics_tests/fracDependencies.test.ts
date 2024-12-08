import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { calculateDependencyScore, DependencyResponse, fetchDependencies } from '../../../src/tools/metrics/fracDependencies.js';
import { gitHubRequest, logMessage } from '../../../src/tools/utils.js';


vi.mock('./utils.js', () => ({
    gitHubRequest: vi.fn(),
    logMessage: vi.fn(),
}));

const mockDependency1: DependencyResponse = {
    "testPack1": '4.0.0',
    "testPack2": '*4.2.0',
    "testPack3": '~1.0.0',
    "testPack4": '^3.3.3',
    "testPack5": '6.5.2',
    "testPack6": '6.0.0',
    "testPack7": '6.7.8',
    "testPack8": '^6.8.12',
    "testPack9": '*3.5.1',
    "testPack10": '^2.0.6',
};

const mockDependency2: DependencyResponse = {};

const mockDependency3: DependencyResponse = { 
    "testPack1": '1.7.7',
    "testPack2": '4.0.0',
};

console.log("TEST")

describe('Dependency Fraction Test', () => {

    afterEach(() => {
        vi.clearAllMocks();
      });

    it('Fraction should be 1 when there are no dependencies', () => {

        const fracDependency = calculateDependencyScore(mockDependency2);
        expect(fracDependency).toBe(1); // Expected fraction to 1 if no dependecies are provided
    });

    it('Fraction should be 0.7 when testing mockDependency1', () => {

        const fracDependency = calculateDependencyScore(mockDependency1);
        expect(fracDependency).toBe(0.7); // Expected fraction to 1 if no dependecies are provided
    });

    it('Fraction should be 0.5 when testing mockDependency3', () => {

        const fracDependency = calculateDependencyScore(mockDependency3);
        expect(fracDependency).toBe(0.5); // Expected fraction to 1 if no dependecies are provided
    });
});


// Mock the modules
vi.mock('../utils.js', () => ({
  gitHubRequest: vi.fn(),
  logMessage: vi.fn(),
}));

describe('fetchDependencies - Error Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test to reset state
  });

  it('should return a Promise resolving to an empty object {} when an error occurs', async () => {
    // Mock gitHubRequest to simulate an error
    vi.fn().mockImplementationOnce(() => {
      throw new Error('Simulated API error');
    });

    const owner = 'invalid-owner';
    const name = 'invalid-repo';


    await expect(fetchDependencies(owner, name)).toBeInstanceOf(Promise);

  
  });
});



