import { describe, it, expect, vi, afterEach, beforeAll, afterAll } from 'vitest';
import { searchPackages } from '../../src/tools/searchPackages.js';
import path from 'path';

vi.mock('../../src/tools/utils.js', () => ({
    gitHubRequest: vi.fn(),
    logMessage: vi.fn(),
}));

const mockRegex1: string = ".*?twitter.*";
const mockRegex2: string = ".*?Underscore.*";
const mockRegex3: string = ".*?browserify.*";

const originalDir = process.cwd();

describe('Search Packages Test', () => {

    // Before all tests, change to the directory where this test file is located
    beforeAll(() => {
        const testDir = path.resolve('./__tests__/files'); // Get the directory where the test file is located
        process.chdir(testDir); // Change to the test file directory
    });

    // After all tests, restore the original directory
    afterAll(() => {
        process.chdir(originalDir); // Change back to the original directory
    });

    afterEach(() => {
        vi.clearAllMocks();
      });

    it('Result should include browserify', async () => {
        const result = await searchPackages(mockRegex1);
        const includesBrowserify = result.some(pkg => pkg.Name === "browserify");
        expect(includesBrowserify).toBe(true); // Expected list to include browserify
    });

    it('Result should be an empty list', async () => {
        const result = await searchPackages(mockRegex2);
        expect(result).toEqual([]); // Expected list to include browserify
    });

    it('Result should include browserify',async () => {
        const result = await searchPackages(mockRegex3);
        const includesBrowserify = result.some(pkg => pkg.Name === "browserify");
        expect(includesBrowserify).toBe(true); // Expected list to include browserify
    });
});