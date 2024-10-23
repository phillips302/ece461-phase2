import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { readPackageLock,
         readPackageJson,
         saveSeenPackagesToFile,
         loadSeenPackagesFromFile,
         generatePackageLock,
         getFileSize,
         calculateDependenciesSize } from '../src/tools/dependencyCost.js';
import { exec } from 'child_process';
import * as fs from 'fs/promises';
import { logMessage } from '../src/tools/utils.js';


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
        const mockWriteFile = vi.fn().mockResolvedValueOnce(mockData);
        (fs.writeFile as unknown as Mock) = mockWriteFile;
        await saveSeenPackagesToFile(seenPackages, './__tests__/files/seenPackages.json');

        expect(logMessage).toHaveBeenCalledWith('INFO', 'Seen packages saved to ./__tests__/files/seenPackages.json');
    });
  });

  describe('loadSeenPackagesFromFile', () => {
    it('should load seen packages from a file', async () => {
      const mockData = JSON.stringify({ package1: 12345 });
      const mockReadFile = vi.fn().mockResolvedValueOnce(mockData);
      (fs.readFile as unknown as Mock) = mockReadFile;

      const seenPackages = await loadSeenPackagesFromFile('./__tests__/files/seenPackages.json');
      expect(seenPackages.get('package1')).toBe(12345);
    });
  });

  describe('readPackageLock', () => {
    it('should read package-lock.json if it exists', async () => {
      const mockReadFile = vi.fn().mockResolvedValueOnce(undefined);
      (fs.readFile as unknown as Mock) = mockReadFile;

      const packageLock = await readPackageLock();
      if (packageLock) {
        expect(packageLock['name']).toBe("team-project-461");
      }
    });
  });

  describe('readPackageJson', () => {
    it('should read package.json if it exists', async () => {
      (fs.readFile as typeof fs.readFile & { mockResolvedValueOnce: any }).mockResolvedValueOnce(undefined);
      const { dependencies, devDependencies } = await readPackageJson();
      expect(dependencies).toContain('dotenv');
      expect(devDependencies).toContain('graphql');
    });
  });

  describe('generatePackageLockFalse', () => {
    it('should skip generating package-lock.json if it exists', async () => {
      (fs.access as typeof fs.access & { mockResolvedValueOnce: any }).mockResolvedValueOnce(undefined);
      await generatePackageLock();
      expect(exec).not.toHaveBeenCalled();
      expect(logMessage).toHaveBeenCalledWith('INFO', 'Skipping package-lock.json generation because it already exists.');
    });
  });

  describe('clacDependenciesSize', () => {
    it('should return total size of dependencies', async () => {
      const fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => '500' }, // Mock content-length header
      });
      globalThis.fetch = fetch as any;
      const mockPackageLock = {
        name: "mock-package",
        version: "1.0.0",
        lockfileVersion: 1,
        requires: true,
        packages: {
          "node_modules/package1": {
            version: "1.0.0",
            resolved: "http://example.com/package1.tgz"
          },
          "node_modules/package2": {
            version: "1.0.0",
            resolved: "http://example.com/package2.tgz"
          }
        }
      };
      const mockseenPackages = new Map<string, number>([["package1", 1000]]);
      const mockAllPackages = ["package1", "package2"];

      const totalSize = await calculateDependenciesSize(mockPackageLock, mockAllPackages, mockseenPackages);
      expect(totalSize).toBe(1500);
      expect(fetch).toHaveBeenCalledWith('http://example.com/package2.tgz', { method: 'GET' });
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
