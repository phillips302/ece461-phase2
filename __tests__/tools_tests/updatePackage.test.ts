import { describe, it, expect, vi } from "vitest";
import { updatePackage } from "../../src/tools/updatePackage.js"; // Adjust the import path as necessary
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { logMessage } from '../../src/tools/utils.js';

// Mock the fs and exec functions
vi.mock('fs/promises', () => ({
    access: vi.fn(),
}));

vi.mock('child_process', () => ({
    exec: vi.fn(),
}));

vi.mock('../../src/tools/utils.js', () => ({
    logMessage: vi.fn(),
}));

describe("updatePackage", () => {

    it("should update the package when the repository directory exists", async () => {
        const repo = "my-repo";
        const dir = `./ingestedPackages/${repo}`;

        // Mock fs.access to resolve
        (fs.access as typeof fs.access & { mockResolvedValueOnce: any }).mockResolvedValueOnce(undefined);
        
        // Mock exec to resolve
        (exec as typeof exec & { mockImplementation: any }).mockImplementation((cmd, callback) => {
            callback(null, "Update successful", ""); // Simulating successful update
        });

        await updatePackage(repo);
        expect(logMessage).toHaveBeenCalledWith('INFO', `Repository found in directory: ${dir}`);
        expect(exec).toHaveBeenCalledWith(`cd ${dir} && npm update`, expect.any(Function));
        expect(logMessage).toHaveBeenCalledWith('INFO', `Running npm update in directory: ${dir}`);
        expect(logMessage).toHaveBeenCalledWith('INFO', `npm update output: Update successful`);
    });

    it("should log an error when the repository directory does not exist", async () => {
        const repo = "my-repo";
        const dir = `./ingestedPackages/${repo}`;

        // Mock fs.access to reject
        (fs.access as typeof fs.access & { mockRejectedValueOnce: any }).mockRejectedValueOnce(new Error("Directory not found"));

        await updatePackage(repo);
        expect(logMessage).toHaveBeenCalledWith('ERROR', `Repository does not exist or an error occurred: Error: Directory not found`);
    });

    it("should log an error when there is an error during npm update", async () => {
        const repo = "my-repo";
        const dir = `./ingestedPackages/${repo}`;

        // Mock fs.access to resolve
        (fs.access as typeof fs.access & { mockResolvedValueOnce: any }).mockResolvedValueOnce(undefined);

        // Mock exec to simulate an error
        (exec as typeof exec & { mockImplementation: any }).mockImplementation((cmd, callback) => {
            callback(new Error("npm update failed"), "", "Some error output"); // Simulating error during update
        });

        await updatePackage(repo);
        expect(logMessage).toHaveBeenCalledWith('ERROR', `Error during npm update: Some error output`);
    });
});

