import { parseGitHubUrl, parseNpmUrl, gitHubRequest, getLinkType, logMessage, npmToGitHub } from "./utils.js";
import { gql } from 'graphql-request';

interface PackageMetadata {
  name: string;
  size: number;  // Size in bytes.
  dependencies: string[];
}

async function getPackageMetadata(owner: string | null, name: string | null): Promise<PackageMetadata> {
  // Simulating a call to fetch package metadata from the registry or an API.
    const query = gql`
        query($owner: String!, $name: String!) {
            repository(owner: $owner, name: $name) {
            name
            version
            size
            dependencies {
                name
                size
            }
        }
    }
    `;
    const variables = { owner, name };
    const response: PackageMetadata = await gitHubRequest(query, variables) as PackageMetadata;
  if (!response) {
    logMessage(`DEBUG`, `Failed to fetch metadata for ${name}`);
  }
  return response;
}

async function getPackageSize(owner: string | null, name: string | null, seenPackages: Set<string | null>): Promise<number> {
  // If we've already computed the size for this package, return 0 to avoid double-counting.
  if (seenPackages.has(name)) {
    return 0;
  }

  // Add this package to the set.
  seenPackages.add(name);

  // Fetch package metadata.
  const metadata = await getPackageMetadata(owner, name);
  let totalSize = metadata.size;

  // Recursively get the size of dependencies.
  /*
  for (const dependency of metadata.dependencies) {
    const { owner, repo } = await getOwnerRepo(dependency);
    totalSize += await getPackageSize(owner, repo, seenPackages);
  }
    */

  return totalSize;
}

async function getOwnerRepo(url: string): Promise<{owner: string | null, repo: string | null}> {
    const linkType = getLinkType(url);

    if (linkType === "Unknown") {
      logMessage("ERROR", `Unknown link type: ${url}`);
    }
  
    let owner: string | null = null;
    let repo: string | null = null;
  
    if (linkType === "npm") {
      const packageName = parseNpmUrl(url);
      let repoInfo = null;
      if (!packageName) {
        logMessage("ERROR", `Invalid npm link: ${url}`);
      } else {
        repoInfo = await npmToGitHub(packageName);
      }
  
      if (repoInfo) {
        ({ owner, repo } = repoInfo);
        logMessage("INFO", `GitHub repository found for npm package: ${owner}/${repo}`);
      } else {
        logMessage("ERROR", `No GitHub repository found for npm package: ${owner}/${repo}`);
      }
    } else if (linkType === "GitHub") {
      ({ owner, repo } = parseGitHubUrl(url) || { owner: null, repo: null });
      if(owner && repo){
        logMessage("INFO", `GitHub owner and repo extracted from GitHub link: ${owner}/${repo}`);
      } else {
        logMessage("ERROR", `Invalid GitHub link: ${url}`);
      }
    }
    return { owner, repo };
}

export async function getCumulativeSize(urls: string[]): Promise<number> {
  const seenPackages = new Set<string | null>();
  let cumulativeSize = 0;

  for (const url of urls) {
    const { owner, repo } = await getOwnerRepo(url);
    cumulativeSize += await getPackageSize(owner, repo, seenPackages);
  }

  return cumulativeSize;
}
