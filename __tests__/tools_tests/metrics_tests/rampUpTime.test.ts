import { describe, it, expect, vi, afterEach } from 'vitest';
import { getDocumentationScore, calculateRampUpScore } from '../../../src/tools/metrics/rampUpTime'; // Adjust the import path
import * as utils from '../../../src/tools/utils';

vi.mock('./utils.js', () => ({
  gitHubRequest: vi.fn(),
  logMessage: vi.fn(),
}));

const mockRepoOwner = "testOwner";
const mockRepoName = "testRepo";

describe('Documentation Scoring', () => {
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return the correct documentation score when a README-like file is found', async () => {
    const mockResponse = {
      repository: {
        object: {
          entries: [
            {
              name: "README.md",
              type: "blob",
              object: {
                text: "# Project\n\n## Installation\n\nInstructions for installation.\n## Usage\n\nHow to use the project.\n## API\n\nAPI documentation.\n## Examples\n\nCode examples."
              }
            }
          ]
        }
      }
    };

    vi.spyOn(utils, 'gitHubRequest').mockResolvedValue(mockResponse);

    const score = await getDocumentationScore(mockRepoOwner, mockRepoName);
    
    expect(score).toBeCloseTo(0.66666); // All keywords present, so score is about 0.6666666
  });

  it('should return DEFAULT_SCORE when no README-like file is found', async () => {
    const mockResponse = {
      repository: {
        object: {
          entries: []
        }
      }
    };

    vi.spyOn(utils, 'gitHubRequest').mockResolvedValue(mockResponse);

    const score = await getDocumentationScore(mockRepoOwner, mockRepoName);

    expect(score).toBe(0); // No README-like file found, score is DEFAULT_SCORE
  });

  it('should handle errors gracefully and return DEFAULT_SCORE', async () => {
    vi.spyOn(utils, 'gitHubRequest').mockRejectedValue(new Error("Network error"));

    const score = await getDocumentationScore(mockRepoOwner, mockRepoName);

    expect(score).toBe(0); // Error occurred, score is DEFAULT_SCORE
  });

  it('should calculate the overall Ramp-Up Time Score', async () => {
    const mockResponse = {
      repository: {
        object: {
          entries: [
            {
              name: "README.md",
              type: "blob",
              object: {
                text: "# Project\n\n## Installation\n\nInstructions for installation.\n## Usage\n\nHow to use the project."
              }
            }
          ]
        }
      }
    };

    vi.spyOn(utils, 'gitHubRequest').mockResolvedValue(mockResponse);

    const score = await calculateRampUpScore(mockRepoOwner, mockRepoName);

    expect(score).toBeCloseTo(0.33333333); // Only 2 out of 6 keywords present, so score is about 0.3333333
  });
});
