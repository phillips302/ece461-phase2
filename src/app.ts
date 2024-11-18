import express, { Application, Request, Response } from 'express';
import JSZip from 'jszip';
import { Buffer } from 'buffer';
import { Package, PackageQuery, PackageMetadata, PackageCost } from './apis/types.js';
import { validatePackageQuerySchema, validatePackageSchema } from './apis/validation.js';
import { v4 as uuidv4 } from 'uuid';
import { getScores } from './tools/score.js';
import { getOwnerRepo } from './tools/utils.js';
import { getCumulativeSize } from './tools/dependencyCost.js';
import queryVersionRoutes from './apis/queryVersion.js';
import { fetchVersionHistory } from './tools/fetchVersion.js';
import { searchPackages } from './tools/searchPackages.js';
import cors from 'cors';

const app: Application = express();
const port = 8081;
app.use(cors());
// app.use(cors({ origin: 'http://localhost:3000' }));

let packageDatabase: Package[] = [];

// Example package to initialize the packageDatabase
const examplePackage: Package = {
  metadata: {
    Name: "example-package",
    ID: '12345',
    Version: "1.0.0"
  },
  data: {
    debloat: false,
    JSProgram: "console.log('Hello, world!');",
    Content: "console.log('Hello, world!');",
    URL: "https://www.npmjs.com/package/browserify"
  }
};

packageDatabase.push(examplePackage);

app.use(express.json());

// Use imported routes
app.use('/', queryVersionRoutes);
//app.use('/package', packageRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the REST API!');
});

app.post('/packages', (req: Request, res: Response) => {
  const pkgqry: PackageQuery[] = req.body;

  for (const q of pkgqry) {
    if (validatePackageQuerySchema(q) !== 0) {
      return res.status(400).send("There is missing field(s) in the PackageQuery or it is formed improperly, or is invalid.");
    }
  }
  const offset = req.params.offset ? parseInt(req.params.offset) : 1; //set offset to 1 if its undefined
  
  let results: PackageMetadata[] = [];
  let counter = 0;

  if (pkgqry.length == 1 && pkgqry[0].Name == '*') { //get all packages, if version is null or defined
    for (let i = 0; i < offset; i++) {
      if(!pkgqry[0].Version || pkgqry[0].Version == packageDatabase[i].metadata.Version) {
        results.push(packageDatabase[i].metadata);
      }
    }
  }

  for (const q of pkgqry) {
    if(!q.Version) { //get specific packages, no version
      for (let i = 0; i < packageDatabase.length && counter < offset; i++) {
        if (packageDatabase[i].metadata.Name == q.Name) {
          results.push(packageDatabase[i].metadata);
          counter++;
        }
      } 
    } else { //get specific packages, with version
      for (let i = 0; i < packageDatabase.length && counter < offset; i++) {
        if (packageDatabase[i].metadata.Name == q.Name && packageDatabase[i].metadata.Version == q.Version) { //check that this gets packages correctly with range
          results.push(packageDatabase[i].metadata);
          counter++;
        }
      } 
    }
  }

  res.status(200).send(results);
});

app.delete('/reset', (req: Request, res: Response) => { 
  packageDatabase = [];
  res.status(200).send("The package database has been reset.");
});

app.get('/package/:id', (req: Request, res: Response) => { //works
  if(!req.params.id) {
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }

  const pkg = packageDatabase.find(p => p.metadata.ID == req.params.id);

  if (!pkg) {
    return res.status(404).send("Package does not exist.");
  }

  res.status(200).json(pkg);
});

app.post('/package/:id', (req: Request, res: Response) => { //update this to populate content
  //assumes all IDs are unique
  if(!req.params.id && !validatePackageSchema(req.body)) { //validate inputs
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }
  
  const pkg = packageDatabase.find(p => p.metadata.ID == req.params.id);

  if (!pkg) {
    return res.status(404).send("Package does not exist.");
  }

  if ((!req.body.data.Content && !req.body.data.URL) || (req.body.data.Content && req.body.data.URL)) { //make sure exactly one of these fields is defined
    return res.status(400).send("There is missing field(s) in the PackageData or it is formed improperly, or is invalid.");
  }

  if ((pkg.metadata.Name != req.body.metadata.Name)) { //make sure name matches
    return res.status(400).send("There is missing field(s) in the PackageData or it is formed improperly, or is invalid.");
  }

  //check version
  if (req.body.metadata.Version == pkg.metadata.Version) {
    return res.status(409).send("Package version already exists.");
  }

  let parts = (req.body.metadata.Version).split('.');
  const newPatchNumber = parts[2]; // Get the third number in the version string
  parts = (pkg.metadata.Version).split('.');
  const currPatchNumber = parts[2]; // Get the third number in the version string

  if (req.body.data.Content && newPatchNumber < currPatchNumber) {
    return res.status(400).send("There is missing field(s) in the PackageData or it is formed improperly, or is invalid.");
  }

  packageDatabase.push(req.body.data);
  res.status(200).send("Version is updated.");
});

app.post('/package', async (req: Request, res: Response) => {
  if(!req.body) {
    return res.status(400).send("There is missing field(s) in the Package or it is formed improperly, or is invalid.");
  }

  if((!req.body.Content && !req.body.URL) || (req.body.Content && req.body.URL)) { //should i be concerned about URL being dark blue
    return res.status(400).send("There is missing field(s) in the PackageData or it is formed improperly, or is invalid.");
  }

  if(req.body.Content) {
    const buffer = Buffer.from(req.body.Content, 'base64');

    // Load the zip content
    const zip = await JSZip.loadAsync(buffer);

    // Locate and read package.json
    const packageJsonFile = zip.file('package.json');
    if (packageJsonFile) {
      const packageJsonContent = await packageJsonFile.async('string');
      const packageData = JSON.parse(packageJsonContent);

      // Access the homepage URL
      if (packageData.homepage) {
        req.body.URL = packageData.homepage;
      } else {
        return res.status(400).send("There is missing field(s) in the Package or it is formed improperly, or is invalid.");
      }
    } else {
      return res.status(400).send("There is missing field(s) in the Package or it is formed improperly, or is invalid.");
    }
  }

  const { owner, repo } = await getOwnerRepo(req.body.data.URL);
  if (!owner || !repo) {
    return res.status(500).send("Failed to retrieve owner and repo.");
  }
  
  let versionHistory = await fetchVersionHistory(owner, repo);
  if (versionHistory == 'No version history') {
    versionHistory = '1.0.0';
  }

  const pkg = packageDatabase.find(p => p.metadata.Name == repo);
  if (pkg) {
    return res.status(409).send("Package exists already.");
  }

  let newPackage: Package = { metadata: { Name: repo, ID: uuidv4(), Version: versionHistory }, data: req.body.data };

  let scores = await getScores(owner, repo, req.body.data.URL);
  const filteredOutput = Object.entries(scores)
    .filter(([key]) => 
        !key.includes('_Latency') && 
        key !== 'URL' && 
        key !== 'NetScore'
    );

  filteredOutput.forEach(([key, value]) => {
    if (typeof value === 'number' && value < 0.5) {
      return res.status(424).send("Package is not uploaded due to the disqualified rating.");
    }
  });
  
  packageDatabase.push(newPackage);
  res.status(201).json(newPackage);
});

app.get('/package/:id/rate', async (req: Request, res: Response) => { //works
  if(!req.params.id) {
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }

  const pkg = packageDatabase.find(p => p.metadata.ID === req.params.id);

  if (!pkg) {
    return res.status(404).send("Package does not exist.");
  }
  
  if (!pkg.data.URL) {
    return res.status(400).send("There is missing field(s) in the PackageData or it is formed improperly, or is invalid.");
  }

  const { owner, repo } = await getOwnerRepo(pkg.data.URL);
  let scores;
  if (owner && repo) {
    scores = await getScores(owner, repo, pkg.data.URL);
  }
  if (!scores) {
    return res.status(500).send("Failed to retrieve scores.");
  }
  const obj = JSON.parse(scores);

  for (const key in obj) {
    if (obj[key] == -1) {
      return res.status(500).send("The package rating system choked on at least one of the metrics.");
    }
  }

  res.status(200).json(obj);
});

app.get('/package/:id/cost', async (req: Request, res: Response) => { //works
  if(!req.params.id) {
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }

  const pkg = packageDatabase.find(p => p.metadata.ID === req.params.id);

  if (!pkg) {
    return res.status(404).send("Package does not exist.");
  }

  const pkgCost: PackageCost = { [pkg.metadata.ID]: { standaloneCost: 0, totalCost: 0 } };

  if (!pkg.data.URL) {
    return res.status(400).send("There is missing field(s) in the PackageData or it is formed improperly, or is invalid.");
  }

  if (req.query.dependency == 'true') {
    [ pkgCost[pkg.metadata.ID].standaloneCost, pkgCost[pkg.metadata.ID].totalCost] = await getCumulativeSize(pkg.data.URL, true);
  } else {
    [ pkgCost[pkg.metadata.ID].totalCost, pkgCost[pkg.metadata.ID].standaloneCost] = await getCumulativeSize(pkg.data.URL, false);
  }

  const temp = pkgCost[pkg.metadata.ID].standaloneCost as number;
  pkgCost[pkg.metadata.ID].standaloneCost = parseFloat(temp.toFixed(2));
  if (req.query.dependency != 'true') {
    pkgCost[pkg.metadata.ID].standaloneCost = undefined;
  }

  pkgCost[pkg.metadata.ID].totalCost = parseFloat(pkgCost[pkg.metadata.ID].totalCost.toFixed(2));

  res.status(200).json(pkgCost);
});

app.post('/package/byRegEx', async (req: Request, res: Response) => {
  if (!req.body.RegEx) {
    return res.status(400).send("There is missing field(s) in the PackageRegEx or it is formed improperly, or is invalid.");
  }
  const packages = await searchPackages(req.body.RegEx as string);

  if (!packages || packages.length == 0) {
    return res.status(404).send("No package found under this regex.");
  }

  let foundPackages: PackageMetadata[] = [];

  for (const pkg of packages) {
    const match = packageDatabase.find(p => p.metadata.Name === pkg.Name);
    if (match) {
      foundPackages.push(match.metadata);
    }
  }

  res.status(200).json(foundPackages);
});

app.get('/tracks', (req: Request, res: Response) => {
  try {
    res.status(200).json({ plannedTracks: ['Performance track'] })
  } catch (error) {
    res.status(500).json({ message: "The system encountered an error while retrieving the student's track information." });
  }
});

//non-baseline apis
app.delete('/package/:id', (req: Request, res: Response) => { 
  if(!req.params.id) {
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }

  const pkg = packageDatabase.find(p => p.metadata.ID == req.params.id);

  if (!pkg) {
    return res.status(404).send("Package does not exist.");
  }

  packageDatabase = packageDatabase.filter(p => p.metadata.ID !== req.params.id);
  res.status(200).send("The package has been deleted.");
});

app.listen(port, () => {
  //console.log(`Express is listening exposed at: http://ec2-18-118-106-80.us-east-2.compute.amazonaws.com:${port}`);
  console.log(`Express is listening at http://localhost:${port}`);
});
