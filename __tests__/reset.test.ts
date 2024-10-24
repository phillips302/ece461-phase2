import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { clearFolder } from '../src/reset'; // Update the import path as needed
import { logMessage } from '../src/tools/utils';

// Mock the logMessage function
vi.mock('../src/tools/utils.js', () => ({
    logMessage: vi.fn(),
}));

// Helper function to create a test folder with sample files and subfolders
async function setupTestFolder(testFolderPath: string) {
    await fs.promises.mkdir(testFolderPath, { recursive: true });
    await fs.promises.writeFile(path.join(testFolderPath, 'file1.txt'), 'Sample content 1');
    await fs.promises.writeFile(path.join(testFolderPath, 'file2.txt'), 'Sample content 2');
    const subfolderPath = path.join(testFolderPath, 'subfolder');
    await fs.promises.mkdir(subfolderPath);
    await fs.promises.writeFile(path.join(subfolderPath, 'file3.txt'), 'Sample content 3');
}

// Helper function to clean up the test folder
async function cleanupTestFolder(testFolderPath: string) {
    if (fs.existsSync(testFolderPath)) {
        await fs.promises.rm(testFolderPath, { recursive: true, force: true });
    }
}

describe('clearFolder', () => {
    const testFolderPath = './testFolder';

    beforeEach(async () => {
        // Set up the test folder before each test
        await setupTestFolder(testFolderPath);
    });

    afterEach(async () => {
        // Clean up the test folder after each test
        await cleanupTestFolder(testFolderPath);
        vi.clearAllMocks();
    });

    it('should clear all files and subfolders in the specified folder', async () => {
        const exit_val = await clearFolder(testFolderPath);

        // Check that the folder exists but is empty
        const entries = await fs.promises.readdir(testFolderPath);
        expect(entries.length).toEqual(0);
        expect(exit_val).toEqual(0);
    });

    it('should handle non-existent folder gracefully', async () => {
        const nonExistentFolder = './nonExistentFolder';
        const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null) => { throw new Error(`process.exit: ${code}`); });

        const exit_val = await clearFolder(nonExistentFolder);

        // Check that logMessage was called with an error message
        expect(logMessage).toHaveBeenCalledWith('ERROR', expect.stringContaining('The folder "'));
        expect(exit_val).toEqual(1);
        expect(exitSpy).toHaveBeenCalledWith(1);

        exitSpy.mockRestore();
    });

    it('should handle errors during file system operations', async () => {
        // Make the test folder read-only to simulate a permission error
        await fs.promises.chmod(testFolderPath, 0o444);
        const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null) => { throw new Error(`process.exit: ${code}`); });

        const exit_val = await clearFolder(testFolderPath);

        // Check that logMessage was called with an error message
        expect(logMessage).toHaveBeenCalledWith('ERROR', expect.stringContaining('Error clearing folder'));
        expect(exit_val).toEqual(1);
        expect(exitSpy).toHaveBeenCalledWith(1);

        // Restore folder permissions and clean up
        await fs.promises.chmod(testFolderPath, 0o755);
        exitSpy.mockRestore();
    });
});
