import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as git from 'isomorphic-git';
import { ingestPackage } from '../src/ingest.ts'; // Adjust the import based on the actual location of the file
import { logMessage } from '../src/utils.js'; // Mock or import the logger
import * as fs from 'fs/promises'; // Import the fs module for mocking
import { cleanUp } from '../src/correctness';

// Mock the fs module
vi.mock('fs/promises', () => ({
  access: vi.fn(async () => {}), // Mock fs.access to simulate directory checking
  mkdir: vi.fn(async () => undefined), // Mock fs.mkdir to simulate directory creation
}));

// Mock the logMessage function
vi.mock('../src/utils.js', () => ({
  logMessage: vi.fn(),
}));

describe('Ingest Package', () => {

  beforeEach(() => {
    // Mock git.clone to simulate cloning repositories
    vi.spyOn(git, 'clone').mockImplementation(async () => {});
  });

  it('should log an error if metrics fail the threshold', async () => {
    const owner = 'testOwner';
    const repo = 'testRepo';
    const repoString = `https://github.com/${owner}/${repo}`;
    const dir = `./ingestedPackages/${repo}`;
    const output = {
      NetScore: 0.4,
      Correctness: 0.3,
      RampUp: 0.7,
    };

    await ingestPackage(output, owner, repo);

    expect(logMessage).toHaveBeenCalledWith('INFO', 'Clamped Correctness @ value: 0.3');
    expect(logMessage).toHaveBeenCalledWith('DEBUG', 'Package not ingested due to failing metrics.');
    expect(git.clone).not.toHaveBeenCalled(); // git.clone should not be called since the metrics failed
    cleanUp(dir);
  });

  it('should clone the repository if metrics meet the threshold', async () => {
    const owner = 'testOwner2';
    const repo = 'testRepo2';
    const dir = `./ingestedPackages/${repo}`;
    const output2 = {
      NetScore: 0.6,
      Correctness: 0.8, // Ensure all metrics meet the threshold
      RampUp: 0.7,
    };
  
    await ingestPackage(output2, owner, repo);
  
    expect(logMessage).toHaveBeenCalledWith('INFO', `Ingesting package for repository: ${repo}`);
    cleanUp(dir);
  });

  it('should handle an existing repository', async () => {
    const owner = 'testOwner3';
    const repo = 'testRepo3';
    const repoString = `https://github.com/${owner}/${repo}`;
    const dir = `./ingestedPackages/${repo}`;
    vi.mocked(fs.access).mockResolvedValueOnce(); // Simulate repository already exists

    const output3 = {
      NetScore: 0.6,
      Correctness: 0.8,
      RampUp: 0.7,
    };

    await ingestPackage(output3, owner, repo);

    expect(logMessage).toHaveBeenCalledWith('INFO', `Repository already exists in directory: ${dir}`);
    expect(git.clone).not.toHaveBeenCalled(); // Should not attempt to clone again
    cleanUp(dir);
  });
});
