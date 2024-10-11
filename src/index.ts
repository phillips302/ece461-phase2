import { getScores } from "./score.js";
import { parseGitHubUrl, parseNpmUrl, getUrlsFromFile, getLinkType, logMessage, npmToGitHub } from "./utils.js";

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
  }

  console.log(output);
}
