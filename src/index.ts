import * as fs from 'fs';
import { getScores } from "./score.js";
import { parseGitHubUrl, parseNpmUrl, getUrlsFromFile, getLinkType, logMessage, npmToGitHub } from "./utils.js";
import { fetchVersionHistory } from "./fetchVersion.js";
import { ingestPackage } from "./ingest.js";
import { updatePackage } from './updatePackage.js';
import { exit } from 'process';
import { log } from 'console';

const args = process.argv.slice(2);

if (args.length !== 1) {
  logMessage("ERROR", "Incorrect number of arguments provided");
  process.exit(1);
}

let versionHistory: string = "";
let urlArray: string[] = [];
const input: string = args[0];
let call: string = "";
let ingestCatch: boolean = false;
let updateMode: boolean = false;

// Check for the '-u' flag to trigger the update mode ig: ./run -u "package URL"
if (args[0] === '-u') {
  logMessage("INFO", "Update mode activated");
  updateMode = true;
}


// Check if the argument is a file or a string
if (fs.existsSync(input) && fs.lstatSync(input).isFile()) {
  // The argument is a file, so process it as a file
  logMessage("INFO", "Processing input as a file");
  urlArray = getUrlsFromFile(input);
  call = "file";
} else {
  // The argument is a string, process it as a string
  logMessage("INFO", "Processing input as a string for ingestion");
  urlArray = [input]; // Assuming you're processing a single string into an array
  call = "ingest";
}

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
      "License_Latency": -1,
      "FractionDependencies": -1,
      "FractionDependencies_Latency": -1,
      "prFraction": -1,
      "prFraction_Latency": -1
    };
    output = JSON.stringify(output)
    let ingestCatch = true;
  } else {
    //If it is in update mode, update the package in the directory
    if(updateMode){
      // Update the package if '-u' flag is present
      logMessage("INFO", `Attempting to update package: ${repo}`);
      await updatePackage(repo);
    }
    output = await getScores(owner, repo, url);
    versionHistory = await fetchVersionHistory(owner, repo);
  }

  if (!updateMode && call === "ingest") {
    if (ingestCatch) {
      logMessage("ERROR", `Failed to ingest package for repository: ${url}`);
    } else {
      let temp = JSON.parse(output);
      //temp["BusFactor"] = 0.5;
      await ingestPackage(temp, owner, repo);
      console.log(JSON.stringify(temp));
    }
  } else {
    console.log("Version Range: ", versionHistory); //Currently Outputs version history, may need to change when front end developed
    console.log(output);
  }
}
