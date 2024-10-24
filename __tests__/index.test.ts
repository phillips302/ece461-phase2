import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as utils from '../src/tools/utils.ts';
import * as score from '../src/tools/score.ts';
import * as fs from "fs";

vi.mock('./score');
vi.mock('./utils');

// Mock the `fs` module
vi.mock('fs');

const clearIndexCache = () => {
    // Delete the cached module entry to force re-import of index.ts
    delete require.cache[require.resolve('../src/index.ts')];
};

describe('CLI logic', () => {
    const originalArgv = process.argv; // Save the original process.argv
    
    beforeEach(() => {
        process.argv = [...originalArgv]; // Reset process.argv before each test
        vi.clearAllMocks();
        clearIndexCache();  // Ensure fresh module import
    });
    
    afterEach(() => {
        vi.resetModules();
        vi.restoreAllMocks();
    });

    it('should return the expected output given a file of valid URLs', async () => {
        process.argv = ['node', 'dist/index.js', 'SampleUrlFile.txt'];

        // Mock the fs.existsSync function to simulate the file exists
        vi.mocked(fs.existsSync).mockReturnValue(true);

        // Mock the fs.lstatSync function to simulate that the input is a file
        vi.mocked(fs.lstatSync).mockReturnValue({
            isFile: () => true // Mock isFile to return true
        } as unknown as fs.Stats); // TypeScript needs a cast here

        // Mock fs.readFileSync to return URLs from the file
        vi.mocked(fs.readFileSync).mockReturnValue('https://github.com/cloudinary/cloudinary_npm\nhttps://www.npmjs.com/package/express');

        const mockGetScores = vi.spyOn(score, 'getScores').mockResolvedValueOnce('some-score-output');
        const mockGetLinkType = vi.spyOn(utils, 'getLinkType');
        
        clearIndexCache();
        await import('../src/index.ts');

        expect(mockGetScores).toHaveBeenCalledTimes(2);
        expect(mockGetLinkType).toHaveBeenCalledTimes(2);
    }, { timeout: 20000 });
});
