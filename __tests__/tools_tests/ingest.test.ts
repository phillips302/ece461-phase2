import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ingestPackageFree } from '../../src/tools/ingest.ts'; // Adjust the import based on the actual location of the file
import { logMessage } from '../../src/tools/utils.js';
import * as fs from 'fs';
import simpleGit, { SimpleGit, CleanOptions } from 'simple-git';

// Mock the modules
vi.mock('fs');

// Mock logMessage function
vi.mock('../../src/tools/utils.js', () => ({
  logMessage: vi.fn(),
}));

// Mock simple-git
const mockGitInstance = {
  clone: vi.fn(async () => ({})), // Mock clone to return an empty object or any appropriate value
  clean: vi.fn().mockReturnThis(),
};

vi.mock('simple-git', () => ({
  simpleGit: vi.fn(() => mockGitInstance),
  CleanOptions: {} // Mock CleanOptions to avoid the error related to missing export
}));

describe('Ingest Package Free', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test to reset state
  });

  it('should log that ingestion is starting', async () => {
    await ingestPackageFree('owner', 'repo', './dir');
    expect(logMessage).toHaveBeenCalledWith('INFO', 'Ingesting package for repository: repo');
  });

  it('should log and skip clone if directory already exists', async () => {
    fs.promises.access = vi.fn().mockResolvedValueOnce(true);

    await ingestPackageFree('owner', 'repo', './dir');

    expect(logMessage).toHaveBeenCalledWith('INFO', 'Directory already exists: ./dir. Skipping clone.');
    expect(mockGitInstance.clone).not.toHaveBeenCalled();
  });

  it('should log and proceed to clone if directory does not exist', async () => {
    fs.promises.access = vi.fn().mockImplementationOnce(() => {
      throw new Error('Directory does not exist');
    });

    await ingestPackageFree('owner', 'repo', './dir');

    expect(logMessage).toHaveBeenCalledWith('DEBUG', 'Directory does not exist. Proceeding to clone repository.');
    expect(mockGitInstance.clone).toHaveBeenCalledWith('https://github.com/owner/repo.git', './dir', ['--depth', '1']);
  });

  it('should log successful clone', async () => {
    fs.promises.access = vi.fn().mockImplementationOnce(() => {
      throw new Error('Directory does not exist');
    });

    mockGitInstance.clone.mockResolvedValueOnce({}); // Mock resolved value for clone

    await ingestPackageFree('owner', 'repo', './dir');

    expect(logMessage).toHaveBeenCalledWith('INFO', 'Repository cloned successfully in ./dir');
  });

  it('should log error if clone fails', async () => {
    fs.promises.access = vi.fn().mockImplementationOnce(() => {
      throw new Error('Directory does not exist');
    });

    mockGitInstance.clone.mockRejectedValueOnce(new Error('Clone failed'));

    await ingestPackageFree('owner', 'repo', './dir');

    expect(logMessage).toHaveBeenCalledWith('DEBUG', 'Failed to clone repository: Error: Clone failed');
  });
});
