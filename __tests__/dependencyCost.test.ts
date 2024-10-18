import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDirectorySize, saveSeenPackagesToFile, loadSeenPackagesFromFile, generatePackageLock, getFileSize } from '../src/dependencyCost.js';
import { exec } from 'child_process';
import * as fs from 'fs/promises';
import { logMessage } from '../src/utils.js';

// Mock the `fs`, `exec`, and `logMessage`
vi.mock('fs/promises', () => ({
  access: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

vi.mock('../src/utils.js', () => ({
  logMessage: vi.fn(),
}));

beforeEach(() => {
    vi.clearAllMocks(); // Clears mocks before each test
  });

describe('dependencyCost functions', () => {
  describe('saveSeenPackagesToFile', () => {
    it('should save seen packages to a file', async () => {
        const mockData = JSON.stringify({ package1: 12345 });
        const parsedObject = JSON.parse(mockData);
        const seenPackages = new Map<string, number>(Object.entries(parsedObject));
      await saveSeenPackagesToFile(seenPackages, './files/seenPackages.json');

      expect(logMessage).toHaveBeenCalledWith('INFO', 'Seen packages saved to ./files/seenPackages.json');
    });
  });

  describe('loadSeenPackagesFromFile', () => {
    it('should load seen packages from a file', async () => {
      const mockData = JSON.stringify({ package1: 12345 });
      (fs.readFile as typeof fs.readFile & { mockResolvedValueOnce: any }).mockResolvedValueOnce(mockData);

      const seenPackages = await loadSeenPackagesFromFile('./files/seenPackages.json');
      expect(seenPackages.get('package1')).toBe(12345);
    });
  });

  describe('generatePackageLock', () => {
    it('should skip generating package-lock.json if it exists', async () => {
      (fs.access as typeof fs.access & { mockResolvedValueOnce: any }).mockResolvedValueOnce(undefined); // Simulate file exists

      await generatePackageLock();

      expect(exec).not.toHaveBeenCalled();
      expect(logMessage).toHaveBeenCalledWith('INFO', 'Skipping package-lock.json generation because it already exists.');
    });
  });

  describe('getFileSize', () => {
    it('should return the size of the file from a URL', async () => {
      const fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => '12345' }, // Mock content-length header
      });
      globalThis.fetch = fetch as any;

      const size = await getFileSize('http://example.com/file.tgz');
      expect(size).toBe(12345);
    });
  });
});
