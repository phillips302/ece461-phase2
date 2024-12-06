import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'; 
import * as fs from 'fs/promises';
import * as path from 'path';
import { logMessage } from '../../src/tools/utils.js';
import { searchPackages } from '../../src/tools/searchPackages.js';

// Mock the utilities
vi.mock('../../src/tools/utils.js', () => ({
  logMessage: vi.fn()
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn()
}));

// Mock path.join
vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/'))
}));

describe('searchPackages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should find packages matching the name pattern', async () => {
    const mockDirents = [
      { name: 'test-package', isDirectory: () => true },
      { name: 'another-test', isDirectory: () => true },
      { name: 'not-matching', isDirectory: () => true }
    ];

    vi.mocked(fs.readdir).mockResolvedValue(mockDirents as any);
    vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
      if (filePath.toString().endsWith('package.json')) {
        return JSON.stringify({ version: '1.0.0' });
      }
      throw new Error('File not found');
    });

    const results = await searchPackages('test');
    expect(results).toEqual([
    ]);
    expect(logMessage).toHaveBeenCalledWith('INFO', expect.stringContaining('test-package'));
  });

  it('should find packages with matching README content', async () => {
    const mockDirents = [
      { name: 'package-with-readme', isDirectory: () => true }
    ];

    vi.mocked(fs.readdir).mockResolvedValue(mockDirents as any);
    vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
      if (filePath.toString().endsWith('README.md')) {
        return 'This package contains test content';
      }
      if (filePath.toString().endsWith('package.json')) {
        return JSON.stringify({ version: '2.0.0' });
      }
      throw new Error('File not found');
    });

    const results = await searchPackages('test');
    expect(results).toEqual([{ Version: '2.0.0', Name: 'package-with-readme' }]);
    expect(logMessage).toHaveBeenCalledWith('INFO', expect.stringContaining('Matched README'));
  });

  it('should handle packages with readme.markdown instead of README.md', async () => {
    const mockDirents = [
      { name: 'package-markdown', isDirectory: () => true }
    ];

    vi.mocked(fs.readdir).mockResolvedValue(mockDirents as any);
    vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
      if (filePath.toString().endsWith('readme.markdown')) {
        return 'This package contains test content';
      }
      if (filePath.toString().endsWith('package.json')) {
        return JSON.stringify({ version: '3.0.0' });
      }
      throw new Error('File not found');
    });

    const results = await searchPackages('test');
    expect(results).toEqual([{ Version: '3.0.0', Name: 'package-markdown' }]);
  });

  it('should handle missing README files', async () => {
    const mockDirents = [
      { name: 'no-readme-package', isDirectory: () => true }
    ];

    vi.mocked(fs.readdir).mockResolvedValue(mockDirents as any);
    vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
      if (filePath.toString().endsWith('package.json')) {
        return JSON.stringify({ version: '1.0.0' });
      }
      throw new Error('File not found');
    });

    const results = await searchPackages('no-readme');
    expect(results).toEqual([]);
    expect(logMessage).toHaveBeenCalledWith('DEBUG', expect.stringContaining('README not found'));
  });

  it('should handle invalid regex patterns', async () => {
    const mockDirents = [
      { name: 'test-package', isDirectory: () => true }
    ];

    vi.mocked(fs.readdir).mockResolvedValue(mockDirents as any);

    await expect(searchPackages('[')).rejects.toThrow(SyntaxError);
    expect(logMessage).not.toHaveBeenCalledWith('INFO', expect.anything());
  });

  it('should handle directory read errors', async () => {
    vi.mocked(fs.readdir).mockRejectedValue(new Error('Permission denied'));

    const results = await searchPackages('test');
    expect(results).toEqual([]);
    expect(logMessage).toHaveBeenCalledWith('ERROR', expect.stringContaining('Permission denied'));
  });

  it('should ignore non-directory entries', async () => {
    const mockDirents = [
      { name: 'test-file.txt', isDirectory: () => false },
      { name: 'test-package', isDirectory: () => true }
    ];

    vi.mocked(fs.readdir).mockResolvedValue(mockDirents as any);
    vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
      if (filePath.toString().endsWith('package.json')) {
        return JSON.stringify({ version: '1.0.0' });
      }
      throw new Error('File not found');
    });

    const results = await searchPackages('test');
    expect(results).toEqual([]);
  });
});







