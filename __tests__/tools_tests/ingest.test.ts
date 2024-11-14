import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ingestPackage } from '../../src/tools/ingest.ts'; // Adjust the import based on the actual location of the file
import { logMessage } from '../../src/tools/utils.js';
import * as fs from 'fs/promises';
import simpleGit, { SimpleGit } from 'simple-git';

vi.mock('fs/promises', () => ({
  access: vi.fn(async () => {}), 
  mkdir: vi.fn(async () => undefined), 
}));

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
}));

describe('Ingest Package', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test to reset state
  });

  it('should log an error if metrics fail the threshold', async () => {
    const owner = 'testOwner';
    const repo = 'testRepo';
    const output = {
      URL: 'http://example.com',
      NetScore: 0.4,
      Correctness: 0.3,
      RampUp: 0.7,
      Stability_Latency: 0.2 // This should be ignored based on filtering criteria
    };

    await ingestPackage(output, owner, repo);

    expect(logMessage).toHaveBeenCalledWith('INFO', 'Clamped Correctness @ value: 0.3');
    expect(logMessage).toHaveBeenCalledWith('DEBUG', 'Package not ingested due to failing metrics.');
    expect(mockGitInstance.clone).not.toHaveBeenCalled();
  });

  it('should clone the repository if metrics meet the threshold', async () => {
    const owner = 'testOwner2';
    const repo = 'testRepo2';
    const output = {
      Correctness: 0.8, 
      RampUp: 0.7,
    };
  
    await ingestPackage(output, owner, repo);
  
    expect(logMessage).toHaveBeenCalledWith('INFO', `Ingesting package for repository: ${repo}`);
  });

  it('should handle an existing repository', async () => {
    const owner = 'testOwner3';
    const repo = 'testRepo3';
    const dir = `./ingestedPackages/${repo}`;
    vi.mocked(fs.access).mockResolvedValueOnce(); 

    const output = {
      Correctness: 0.8,
      RampUp: 0.7,
    };

    await ingestPackage(output, owner, repo);

    expect(logMessage).toHaveBeenCalledWith('INFO', `Repository already exists in directory: ${dir}`);
    expect(mockGitInstance.clone).not.toHaveBeenCalled();
  });
});
