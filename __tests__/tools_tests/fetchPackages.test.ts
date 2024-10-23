import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import { getPackageNames } from '../../src/tools/fetchPackages';

// Mock the fs module
vi.mock('fs');

describe('getPackageNames', () => {
    it('should return an array of folder names when directories are present', () => {
        // Mock data for readdirSync
        const mockEntries = [
            { name: 'folder1', isDirectory: () => true },
            { name: 'file1.txt', isDirectory: () => false },
            { name: 'folder2', isDirectory: () => true }
        ];

        // Mock implementation of readdirSync
        vi.spyOn(fs, 'readdirSync').mockReturnValue(mockEntries as any);

        const folderPath = './some/folder';
        const result = getPackageNames(folderPath);

        // Expected result should include only folder names
        expect(result).toEqual(['folder1', 'folder2']);
    });

    it('should return an empty array if no directories are present', () => {
        // Mock data for readdirSync
        const mockEntries = [
            { name: 'file1.txt', isDirectory: () => false },
            { name: 'file2.txt', isDirectory: () => false }
        ];

        // Mock implementation of readdirSync
        vi.spyOn(fs, 'readdirSync').mockReturnValue(mockEntries as any);

        const folderPath = './some/folder';
        const result = getPackageNames(folderPath);

        // Expected result should be an empty array
        expect(result).toEqual([]);
    });

    it('should handle errors and return an empty array if readdirSync throws an error', () => {
        // Mock implementation of readdirSync to throw an error
        vi.spyOn(fs, 'readdirSync').mockImplementation(() => { throw new Error('Mock error'); });
        // Mock console.error to suppress error output during test
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const folderPath = './some/folder';
        const result = getPackageNames(folderPath);

        // Expected result should be an empty array
        expect(result).toEqual([]);
    });
});
