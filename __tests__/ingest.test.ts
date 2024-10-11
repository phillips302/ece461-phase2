import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs/promises';
import * as git from 'isomorphic-git';
import { ingestPackage } from '../src/ingest.ts';
import { logMessage } from '../src/utils.js'; // Mock or import the logger

// Mock the logMessage function
vi.mock('../src/utils.js', () => ({
  logMessage: vi.fn(),
}));

describe('Ingest Package', () => {
  const owner = 'testOwner';
  const repo = 'testRepo';
  const repoString = `https://github.com/${owner}/${repo}`;
  const dir = `./ingestedPackages/${repo}`;

  beforeEach(() => {
    // Mock fs and git functions to avoid actual file system and GitHub operations
    vi.spyOn(fs, 'access').mockImplementation(async () => {});
    vi.spyOn(fs, 'mkdir').mockImplementation(async () => undefined);
    vi.spyOn(git, 'clone').mockImplementation(async () => {});
  });

  it('should log an error if metrics fail the threshold', async () => {
    const output = {
      NetScore: 0.4,
      Correctness: 0.3,
      RampUp: 0.7,
    };

    await ingestPackage(output, owner, repo);

    expect(logMessage).toHaveBeenCalledWith('INFO', 'Clamped Correctness @ value: 0.3');
    expect(logMessage).toHaveBeenCalledWith('DEBUG', 'Package not ingested due to failing metrics.');
    expect(git.clone).not.toHaveBeenCalled(); // git.clone should not be called since the metrics failed
  });

  it('should clone the repository if metrics meet the threshold', async () => {
    const output = {
      NetScore: 0.6,
      Correctness: 0.8,
      RampUp: 0.7,
    };

    await ingestPackage(output, owner, repo);

    expect(logMessage).toHaveBeenCalledWith('INFO', `Ingesting package for repository: ${repo}`);
    expect(git.clone).toHaveBeenCalledWith({
      fs,
      http: expect.anything(),
      dir,
      url: repoString,
      singleBranch: true,
    });
    expect(logMessage).toHaveBeenCalledWith('INFO', `Repository cloned successfully in ${dir}`);
  });

  it('should handle an existing repository', async () => {
    vi.spyOn(fs, 'access').mockResolvedValueOnce(); // Simulate repository already exists

    const output = {
      NetScore: 0.6,
      Correctness: 0.8,
      RampUp: 0.7,
    };

    await ingestPackage(output, owner, repo);

    expect(logMessage).toHaveBeenCalledWith('INFO', `Repository already exists in directory: ${dir}`);
    expect(git.clone).not.toHaveBeenCalled(); // Should not attempt to clone again
  });

  it('should log an error if git clone fails', async () => {
    vi.spyOn(git, 'clone').mockRejectedValueOnce(new Error('Git clone failed'));

    const output = {
      NetScore: 0.6,
      Correctness: 0.8,
      RampUp: 0.7,
    };

    await ingestPackage(output, owner, repo);

    expect(logMessage).toHaveBeenCalledWith('DEBUG', 'Failed to clone repository: Error: Git clone failed');
  });
});
