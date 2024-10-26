import * as fs from 'fs';
import { getScores } from "./tools/score.js";
import { getUrlsFromFile, logMessage, getOwnerRepo } from "./tools/utils.js";
import { fetchVersionHistory } from "./tools/fetchVersion.js";
import { ingestPackage } from "./tools/ingest.js";
import { getPackageNames } from "./tools/fetchPackages.js";
import { updatePackage } from './tools/updatePackage.js';
import { getCumulativeSize } from './tools/dependencyCost.js';
import { searchPackages } from "./searchPackages.js";
import { exit } from 'process';
import { log } from 'console';

const args = process.argv.slice(2);

let versionHistory: string = "";
let packageDirectory: string[] = [];
let urlArray: string[] = [];
let input: string = args[0];
let call: string = "";
let ingestCatch: boolean = false;
let updateMode: boolean = false;
let dependCostMode: boolean = false;

// Check for the '-u' flag to trigger the update mode ig: ./run -u "package URL"
if (args[0] === '-u') {
  logMessage("INFO", "Update mode activated");
  input = args[1];
  updateMode = true;
} else if (args[0] === '-c') {
  logMessage("INFO", "Dependency Cost mode activated");
  dependCostMode = true;
  input = args[1];
} else if (args[0] === '-i') {
  logMessage("INFO", "Ingest mode activated");
  call = "ingest";
  input = args[1];
} else if (args[0] === '-h') {
  log("Usage: ./run [-u] [-c] <package URL>");
  log("Options:");
  log("  -u: Update mode, updates the package in the directory");
  log("  -c: Dependency Cost mode, finds the cumulative size of all dependencies");
  exit(0);
}


// Check if the argument is a file
if (fs.existsSync(input) && fs.lstatSync(input).isFile()) {
  logMessage("INFO", "Processing input as a file");
  urlArray = getUrlsFromFile(input);
  call = "file";
} else {
  // The argument is a string, process it as a string
  if (input.includes("https://")){
    logMessage("INFO", "Processing input as a string for ingestion");
    urlArray = [input]; // Assuming you're processing a single string into an array
    call = "ingest";
  }
  else{
    logMessage("INFO", "Processing input as a string for searching");
    call = "search";
    await searchPackages(input); 
  }
}

for (const url of urlArray) {
  let owner: string | null = null;
  let repo: string | null = null;
  let output;
  
  ({ owner, repo } = await getOwnerRepo(url));

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

  if (call === "ingest") {
    if (ingestCatch) {
      logMessage("ERROR", `Failed to ingest package for repository: ${url}`);
    } else {
      let temp = JSON.parse(output);
      // temp["BusFactor"] = 0.5;
      // temp["prFraction"] = 0.5;
      await ingestPackage(temp, owner, repo);
      packageDirectory = getPackageNames('./ingestedPackages');
      log("Package Directory: ", packageDirectory);
      //console.log(JSON.stringify(temp));
    }
  } else {
    log("Version Range: ", versionHistory); //Currently Outputs version history, may need to change when front end developed
    log(output);
  }
}
