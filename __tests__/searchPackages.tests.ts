import { describe, it, expect, vi, afterEach } from 'vitest';
import { searchPackages } from '../src/searchPackages.js';

vi.mock('./utils.js', () => ({
    gitHubRequest: vi.fn(),
    logMessage: vi.fn(),
}));

const mockRegex1: string = ".*?twitter.*";
const mockRegex2: string = ".*?Underscore.*";
const mockRegex3: string = ".*?browserify.*";

console.log("TEST")

describe('Search Packages Test', () => {

    afterEach(() => {
        vi.clearAllMocks();
      });

    it('Result should include browserify', () => {

        const result = searchPackages(mockRegex1);
        expect(result).toContain("browserify"); // Expected list to include browserify
    });

    it('Result should be an empty list', () => {

        const result = searchPackages(mockRegex2);
        expect(result).toBe([]); // Expected list to include browserify
    });

    it('Result should include browserify', () => {

        const result = searchPackages(mockRegex3);
        expect(result).toContain("browserify"); // Expected list to include browserify
    });
});