import { describe, it, expect, vi } from 'vitest';
import { getDirectorySize, saveSeenPackagesToFile, loadSeenPackagesFromFile, generatePackageLock, getFileSize } from '../src/dependencyCost';
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

describe('dependencyCost functions', () => {
  describe('getDirectorySize', () => {
    it('should calculate the total size of files in the directory', async () => {
      // Mock directory structure and file sizes
      (fs.readdir as typeof fs.readdir & { mockResolvedValueOnce: any }).mockResolvedValueOnce([
        { name: 'file1.txt', isFile: () => true, isDirectory: () => false },
        { name: 'subdir', isFile: () => false, isDirectory: () => true },
      ]);
      (fs.stat as typeof fs.stat & { mockResolvedValueOnce: any }).mockResolvedValueOnce({ size: 500 });
      (fs.readdir as typeof fs.readdir & { mockResolvedValueOnce: any }).mockResolvedValueOnce([
        { name: 'file2.txt', isFile: () => true, isDirectory: () => false },
      ]);
      (fs.stat as typeof fs.stat & { mockResolvedValueOnce: any }).mockResolvedValueOnce({ size: 300 });

      const totalSize = await getDirectorySize('/fake-dir');
      expect(totalSize).toBe(800);
    });
  });

  describe('saveSeenPackagesToFile', () => {
    it('should save seen packages to a file', async () => {
      const seenPackages = new Map<string, number>([['package1', 12345]]);
      await saveSeenPackagesToFile(seenPackages, './seenPackages.json');

      expect(fs.writeFile).toHaveBeenCalledWith(
        './seenPackages.json',
        JSON.stringify({ package1: 12345 }, null, 2),
        'utf-8'
      );
    });
  });

  describe('loadSeenPackagesFromFile', () => {
    it('should load seen packages from a file', async () => {
      const mockData = JSON.stringify({ package1: 12345 });
      (fs.readFile as typeof fs.readFile & { mockResolvedValueOnce: any }).mockResolvedValueOnce(mockData);

      const seenPackages = await loadSeenPackagesFromFile('./seenPackages.json');
      expect(seenPackages.get('package1')).toBe(12345);
    });

    it('should return an empty map if file does not exist', async () => {
      (fs.readFile as typeof fs.readFile & { mockRejectedValueOnce: any }).mockRejectedValueOnce({ code: 'ENOENT' });

      const seenPackages = await loadSeenPackagesFromFile('./seenPackages.json');
      expect(seenPackages.size).toBe(0);
    });
  });

  describe('generatePackageLock', () => {
    it('should generate package-lock.json if it does not exist', async () => {
      (fs.access as typeof fs.access & { mockRejectedValueOnce: any }).mockRejectedValueOnce(new Error('ENOENT')); // Simulate file not existing
      (exec as typeof exec & { mockImplementation: any }).mockImplementation((cmd, callback) => {
        callback(null, 'Success', ''); // Simulate successful npm call
      });

      await generatePackageLock();

      expect(exec).toHaveBeenCalledWith('npm install --package-lock-only --package-lock', expect.any(Function));
      expect(logMessage).toHaveBeenCalledWith('INFO', 'Generated package-lock.json successfully.');
    });

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

    it('should return 0 if fetching the URL fails', async () => {
      const fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });
      globalThis.fetch = fetch as any;

      const size = await getFileSize('http://example.com/file.tgz');
      expect(size).toBe(0);
    });
  });
});
