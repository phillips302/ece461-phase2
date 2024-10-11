import { getScores } from "./score.js";
import { parseGitHubUrl, parseNpmUrl, getUrlsFromFile, getLinkType, logMessage, npmToGitHub } from "./utils.js";
import { fetchVersionHistory } from "./fetchVersion.js";

const args = process.argv.slice(2);

if (args.length !== 1) {
  logMessage("ERROR", "Incorrect number of arguments provided");
  console.log('Incorrect number of args')
  process.exit(1);
}

const urlArray = getUrlsFromFile(args[0]);

for (const url of urlArray) {
  logMessage("INFO", `Analyzing repository: ${url}`);

  const linkType = getLinkType(url);

  if (linkType === "Unknown") {
    logMessage("ERROR", `Unknown link type: ${url}`);
  }

  let owner: string | null = null;
  let repo: string | null = null;
  let output;

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

  if (!owner || !repo) {
    output = {
      "URL": url,
      "NetScore": -1,
      "NetScore_Latency": -1,
      "RampUp": -1,
      "RampUp_Latency": -1,
      "Correctness": -1,
      "Correctness_Latency": -1,
      "BusFactor": -1,
      "BusFactor_Latency": -1,
      "ResponsiveMaintainer": -1,
      "ResponsiveMaintainer_Latency": -1,
      "License": -1,
      "License_Latency": -1
    };
    output = JSON.stringify(output)
  } else {
    output = await getScores(owner, repo, url);
    //Fetch the version history of the repository
    const versionHistory = await fetchVersionHistory(owner, repo);
    if(versionHistory.length >= 0){
      // Sort the releases by published date (earliest first)
      const sortedVersionHistory = versionHistory.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());

      // Get the earliest version (first) and the latest version (last)
      const earliestVersion = sortedVersionHistory[0].tagName.replace(/^v/, ''); // Remove leading 'v'
      const latestVersion = sortedVersionHistory[sortedVersionHistory.length - 1].tagName.replace(/^v/, ''); // Remove leading 'v'

      // Log the version history in the desired format (earliest - latest)
      console.log(`Version History: "${earliestVersion} - ${latestVersion}"`); 
    }else{
      logMessage("INFO", `No version history found for ${owner}/${repo}`);
    }

  }

  console.log(output);
}
