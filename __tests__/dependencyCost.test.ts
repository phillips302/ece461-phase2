import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readPackageLock, readPackageJson, changeDirectory, saveSeenPackagesToFile, loadSeenPackagesFromFile, generatePackageLock, getFileSize, getCumulativeSize, calculateDependenciesSize } from '../src/dependencyCost.js';
import { exec } from 'child_process';
import * as fs from 'fs/promises';
import { logMessage } from '../src/utils.js';
import { log } from 'console';
import { version } from 'os';

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
  describe('changeDir', () => {
    it('should change directories', async () => {
      await changeDirectory('./__tests__/files');
      expect(process.chdir).toHaveBeenCalledWith('./__tests__/files');
      expect(logMessage).toHaveBeenCalledWith('INFO', `Directory exists: ./__tests__/files`);
      expect(logMessage).toHaveBeenCalledWith('INFO', `Moved into directory: ${process.cwd()}`);
      await changeDirectory('../../');
    });
  });

  describe('saveSeenPackagesToFile', () => {
    it('should save seen packages to a file', async () => {
        const mockData = JSON.stringify({ package1: 12345 });
        const parsedObject = JSON.parse(mockData);
        const seenPackages = new Map<string, number>(Object.entries(parsedObject));
      await saveSeenPackagesToFile(seenPackages, './__tests__/files/seenPackages.json');

      expect(logMessage).toHaveBeenCalledWith('INFO', 'Seen packages saved to ./files/seenPackages.json');
    });
  });

  describe('loadSeenPackagesFromFile', () => {
    it('should load seen packages from a file', async () => {
      const mockData = JSON.stringify({ package1: 12345 });
      (fs.readFile as typeof fs.readFile & { mockResolvedValueOnce: any }).mockResolvedValueOnce(mockData);

      const seenPackages = await loadSeenPackagesFromFile('./__tests__/files/seenPackages.json');
      expect(seenPackages.get('package1')).toBe(12345);
    });
  });

  describe('readPackageLock', () => {
    it('should read package-lock.json if it exists', async () => {
      const mockData = JSON.stringify(
        { name: "mock-package",
          version: "1.0.0",
          lockfileVersion: 1,
          requires: true,
          packages: {
            "node_modules/package1": {
              version: "1.0.0",
              resolved: "http://example.com/package1.tgz"
            }
          }
        });
      (fs.readFile as typeof fs.readFile & { mockResolvedValueOnce: any }).mockResolvedValueOnce(mockData);

      const packageLock = await readPackageLock();
      if (packageLock) {
        expect(packageLock['name']).toBe("package1");
        expect(packageLock['packages']).toHaveProperty('node_modules/package1');
      }
    });
  });

  describe('readPackageJson', () => {
    it('should read package.json if it exists', async () => {
      const mockData = JSON.stringify(
        { name: "package1",
          version: "1.0.0",
          type: "module",
          devDependencies: {
            "mockDevPackage": "1.0.0"
          },
          dependencies: {
            "mockPackage": "1.0.0"
          }
        });
      (fs.readFile as typeof fs.readFile & { mockResolvedValueOnce: any }).mockResolvedValueOnce(mockData);

      const { dependencies, devDependencies } = await readPackageJson();
      expect(dependencies).toContain('mockPackage');
      expect(devDependencies).toContain('mockDevPackage');
      const allPackages = [...dependencies, ...devDependencies];
      expect(allPackages).toHaveLength(2);
    });
  });

  describe('generatePackageLockFalse', () => {
    it('should skip generating package-lock.json if it exists', async () => {
      (fs.access as typeof fs.access & { mockResolvedValueOnce: any }).mockResolvedValueOnce(undefined); // Simulate file exists

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
