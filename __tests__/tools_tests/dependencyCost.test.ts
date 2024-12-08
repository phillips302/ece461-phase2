import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { readPackageLock,
         readPackageJson,
         saveSeenPackagesToFile,
         loadSeenPackagesFromFile,
         generatePackageLock,
         getFileSize,
         calculateDependenciesSize } from '../../src/tools/dependencyCost.js';
import { exec } from 'child_process';
import * as fs from 'fs/promises';
import { logMessage } from '../../src/tools/utils.js';


import { getPackageSize, removeDirectory, changeDirectory, getCumulativeSize } from '../../src/tools/dependencyCost.js';;  // Adjust import as necessary
import { ingestPackageFree } from '../../src/tools/ingest.js';


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

vi.mock('../../src/tools/utils.js', () => ({
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

// Mocks
vi.mock('./yourModule', () => ({
  getDirectorySize: vi.fn(),
  generatePackageLock: vi.fn(),
  readPackageLock: vi.fn(),
  readPackageJson: vi.fn(),
  calculateDependenciesSize: vi.fn(),
  logMessage: vi.fn(),
}));

beforeEach(() => {
  // Reset mocks before each test
  vi.resetAllMocks();
});

it('should return correct size when package is cached', async () => {
  const seenPackages = new Map([['package1', 1024]]);
  const name = 'package1';
  const depends = true;

  const result = await getPackageSize(name, seenPackages, depends);


});



it('should skip dependency size calculation when depends is false', async () => {
  const seenPackages = new Map([['package1', 1024]]);
  const name = 'package1';
  const depends = false;

  const result = await getPackageSize(name, seenPackages, depends);

  expect(result).toEqual([1024, 0]);
  //expect(logMessage).toHaveBeenCalledWith('INFO', `Size of ${name}: 1024 KB`);
});

it('should calculate total size with dependencies when depends is true', async () => {
  const seenPackages = new Map([['package1', 1024]]);
  const name = 'package1';
  const depends = true;

  // Mock additional functions
  vi.fn().mockResolvedValue(undefined);
  vi.fn().mockResolvedValue({
    name: "mock-package",
    version: "1.0.0",
    lockfileVersion: 1,
    requires: true,
    packages: {}
  }); // Mock an empty package-lock object
  vi.fn().mockResolvedValue({ dependencies: ['dep1'], devDependencies: ['devDep1'] });
  vi.fn().mockResolvedValue(512);

  const result = await getPackageSize(name, seenPackages, depends);

  
});

it('should log error if dependencies calculation fails', async () => {
  const seenPackages = new Map([['package1', 1024]]);
  const name = 'package1';
  const depends = true;

  // Mock failure for calculateDependenciesSize
  vi.fn().mockRejectedValue(new Error('Failed to calculate dependencies size'));

  try {
    await getPackageSize(name, seenPackages, depends);
  } catch (error) {
    expect(error.message).toBe('Failed to calculate dependencies size');
  }
  
});
