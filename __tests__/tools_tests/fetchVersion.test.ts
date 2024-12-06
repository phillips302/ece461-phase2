import { describe, it, expect, vi } from "vitest";
import { fetchVersion } from "../../src/tools/fetchVersion.js";
import { gitHubRequest, logMessage } from "../../src/tools/utils.js";

// Mock the gitHubRequest and logMessage functions
vi.mock("../../src/tools/utils.js", () => ({
  gitHubRequest: vi.fn(),
  logMessage: vi.fn(),
}));

describe("fetchVersionHistory", () => {

  it("should return the correct version range when releases are found", async () => {
    const mockResponse = {
      repository: {
        releases: {
          nodes: [
            { tagName: "v1.0.0", publishedAt: "2023-01-01", name: "Initial release", description: "" },
            { tagName: "v1.2.0", publishedAt: "2023-05-01", name: "Minor update", description: "" },
            { tagName: "v2.0.0", publishedAt: "2024-01-01", name: "Major update", description: "" },
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        },
      },
    };

    // Cast gitHubRequest to a mock function that returns a resolved promise
    (gitHubRequest as typeof gitHubRequest & { mockResolvedValue: any }).mockResolvedValue(mockResponse);

    const result = await fetchVersion("owner", "repo");
    expect(result).toBe("2.0.0");
  });

  it("should handle pagination and merge all releases", async () => {
    const mockPage1 = {
      repository: {
        releases: {
          nodes: [
            { tagName: "v1.0.0", publishedAt: "2023-01-01", name: "Initial release", description: "" },
          ],
          pageInfo: {
            hasNextPage: true,
            endCursor: "cursor1",
          },
        },
      },
    };

    const mockPage2 = {
      repository: {
        releases: {
          nodes: [
            { tagName: "v1.1.0", publishedAt: "2023-03-01", name: "Patch update", description: "" },
            { tagName: "v2.0.0", publishedAt: "2024-01-01", name: "Major update", description: "" },
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        },
      },
    };

    // Mock gitHubRequest to return different pages
    (gitHubRequest as typeof gitHubRequest & { mockResolvedValueOnce: any })
      .mockResolvedValueOnce(mockPage1)
      .mockResolvedValueOnce(mockPage2);

    const result = await fetchVersion("owner", "repo");
    expect(result).toBe("2.0.0");
  });

  it("should return 'No version history' when no releases are found", async () => {
    const mockResponse = {
      repository: {
        releases: {
          nodes: [],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        },
      },
    };

    // Mock gitHubRequest to return no releases
    (gitHubRequest as typeof gitHubRequest & { mockResolvedValue: any }).mockResolvedValue(mockResponse);

    const result = await fetchVersion("owner", "repo");

    expect(result).toBe("No version history");
    expect(logMessage).toHaveBeenCalledWith("INFO", "No version history found for owner/repo");
  });
});

