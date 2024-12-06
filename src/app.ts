import express, { Application, Request, Response } from 'express';
import { Package, PackageQuery, PackageMetadata, PackageCost, PackageRating } from './apis/types.js';
import { validatePackageSchema, validateDataSchema } from './apis/validation.js';
import { v4 as uuidv4 } from 'uuid';
import { getScores } from './tools/score.js';
import { getOwnerRepo } from './tools/utils.js';
import { getCumulativeSize } from './tools/dependencyCost.js';
import queryVersionRoutes from './apis/queryVersion.js';
import { fetchVersion } from './tools/fetchVersion.js';
import { searchPackages, searchPackagesRDS } from './tools/searchPackages.js';
import { contentToURL, urlToContent } from './apis/helpers.js';
import { storePackage, readAllPackages, readPackage, readPackageRating, deleteAllPackages, downloadPackageContent } from './rds/index.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFromS3, deleteFromS3 } from './tools/uploadToS3.js';

const app: Application = express();
const port = 8081;

const corsOptions = {
  origin: 'https://prod.d1k3s8at0zz65i.amplifyapp.com',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Set a higher limit for the request body size
app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json());

// Use imported routes
app.use('/', queryVersionRoutes);
//app.use('/package', packageRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the REST API!');
});

app.get('/health', async (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.post('/packages', async (req: Request, res: Response) => { //works
  //account for Too many packages returned error when you switch over storage methods
  const pkgqry: PackageQuery[] = req.body;

  if (!pkgqry[0]) {
    return res.status(400).send("There is missing field(s) in the PackageQuery or it is formed improperly, or is invalid.");
  }

  for (let i = 0; i < pkgqry.length; i++) {
    if (!pkgqry[i].Name) {
      return res.status(400).send("There is missing field(s) in the PackageQuery (Name is undefined)");
    }
  }
  const offset = req.params.offset ? parseInt(req.params.offset) : 8; //set offset to 8 if its undefined
  
  const packageArray = await readAllPackages(); //might need to change this for offset
  if (!packageArray) {
    return res.status(500).send("Failed to read packages from RDS.");
  }

  let results: PackageMetadata[] = [];
  let counter = 0;

  if (pkgqry.length == 1 && pkgqry[0].Name == '*') { //get all packages, if version is null or defined
    for (let i = 0; i < packageArray.length && counter < offset; i++) {
      if (!pkgqry[0].Version || pkgqry[0].Version == packageArray[i].metadata.Version) {
        results.push(packageArray[i].metadata);
        counter++;
      }
    }
  }

  for (let q = 0; q < pkgqry.length; q++) {
    if (!pkgqry[q].Version) { //get specific packages, no version
      for (let i = 0; i < packageArray.length && counter < offset; i++) {
        if (packageArray[i].metadata.Name == pkgqry[q].Name) {
          results.push(packageArray[i].metadata);
          counter++;
        }
      } 
    } else { //get specific packages, with version
      for (let i = 0; i < packageArray.length && counter < offset; i++) {
        if (packageArray[i].metadata.Name == pkgqry[q].Name && packageArray[i].metadata.Version == pkgqry[q].Version) { //check that this gets packages correctly with range
          results.push(packageArray[i].metadata);
          counter++;
        }
      } 
    }
  }

  res.status(200).send(results);
});

app.delete('/reset', async (req: Request, res: Response) => { //works
  const packages = await readAllPackages();
  if (!packages) {
    return res.status(500).send("Failed to read packages from RDS.");
  }

  for (const pkg of packages) {
    let path = `${pkg.metadata.Name}/${pkg.metadata.ID}`;
    await deleteFromS3(path);
  }

  const result = await deleteAllPackages();

  if (!result) {
    return res.status(500).send("Failed to reset the package database.");
  }

  return res.status(200).send("The package database has been reset.");
});

app.get('/package/:id', async (req: Request, res: Response) => {
  if (!req.params.id) {
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }

  const pkg = await readPackage(req.params.id);

  if (!pkg) {
    return res.status(404).send("Package does not exist.");
  }

  if (!pkg.data.Content) {
    if (!pkg.data.URL) {
      return res.status(400).send("Content and URL are both undefined");
    }

    try {
      const content = await urlToContent(pkg.data.URL);
      //const s3path = `${pkg.metadata.Name}/${pkg.metadata.ID}`;
      //const content = await readFromS3(s3path);
      if (content === undefined) {
        return res.status(500).send("Failed to retrieve content.");
      }
      pkg.data.Content = content;
    } catch (error) {
      return res.status(500).send("An error occurred while retrieving content.");
    }
  }
  res.status(200).json(pkg);
});

app.post('/package/byRegEx', async (req: Request, res: Response) => { //connection works
  if (!req.body || !req.body.RegEx) {
    return res.status(400).send("There is missing field(s) in the PackageRegEx or it is formed improperly, or is invalid.");
  }
  const packages = await searchPackagesRDS(req.body.RegEx);

  if (!packages || packages.length == 0) {
    return res.status(404).send("No package found under this regex.");
  }

  let foundPackages: PackageMetadata[] = [];

  for (const pkg of packages) {
    const match = await readPackage(pkg.ID)
    if (match) {
      foundPackages.push(match.metadata);
    }
  }

  res.status(200).json(foundPackages);
});

app.post('/package/:id', async (req: Request, res: Response) => {
  //assumes all IDs are unique
  
  if (!req.params.id || !req.body) { //validate inputs
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }

  const validation = validatePackageSchema(req.body);

  if(validation) {
    return res.status(400).send(validation);
  }
  
  const pkg = await readPackage(req.params.id);
  //const pkgContent = await readFromS3(req.params.id);

  if (!pkg) {
    return res.status(404).send("Package does not exist.");
  }

  if (pkg.metadata.Name != req.body.metadata.Name) { //make sure name matches
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
    return res.status(400).send("Outdated Version.");
  }

  if (req.body.data.Content) {
    const url = await contentToURL(req.body.data.Content);
    if (url == 'Failed to get the url') {
      return res.status(400).send("There is missing field(s) in the Package or it is formed improperly, or is invalid.")
    } else {
      req.body.data.URL = url;
    }
  }

  //check rating before ingesting
  const { owner, repo } = await getOwnerRepo(req.body.data.URL);
  if (!owner || !repo) {
    return res.status(500).send("Failed to retrieve owner and repo.");
  }

  let scores = await getScores(owner, repo, req.body.data.URL);
  const filteredOutput = Object.entries(scores)
    .filter(([key]) => 
        !key.includes('_Latency') && 
        key !== 'URL' && 
        key !== 'NetScore'
    );

  filteredOutput.forEach(([key, value]) => {
    if (typeof value === 'number' && value < 0.5) {
      return res.status(424).send("Package is not updated due to the disqualified rating.");
    }
  });

  let newPackage: Package = { metadata: { Name: pkg.metadata.Name, ID: uuidv4(), Version: req.body.metadata.Version }, data: req.body.data };

  const result = await storePackage(newPackage, JSON.parse(scores));

  if (!result) {
    return res.status(500).send("Failed to update package.");
  }

  res.status(200).send("Version is updated.");
});

app.post('/package', async (req: Request, res: Response) => {
  if (!req.body) {
    return res.status(400).send("There is missing field(s) in the Package or it is formed improperly, or is invalid.");
  }

  const validation = validateDataSchema(req.body);

  if(validation) {
    return res.status(400).send(validation);
  }

  if (req.body.Content) {
    const url = await contentToURL(req.body.Content);
    if (url == 'Failed to get the url') {
      return res.status(500).send("Failed to retrieve data from Content.");
    }
    req.body.URL = url;
  }

  const { owner, repo } = await getOwnerRepo(req.body.URL);
  if (!owner || !repo) {
    return res.status(500).send("Failed to retrieve owner and repo.");
  }
  
  let version = await fetchVersion(owner, repo);
  if (!version) {
    version = '1.0.0';
  }

  const packages = await readAllPackages();

  if ( packages && (packages.find(p => p.metadata.Name == repo && p.metadata.Version == version) || packages.find(p => p.metadata.Name == req.body.Name && p.metadata.Version == version)) ) {
    return res.status(409).send("Package exists already.");
  }

  const ID = uuidv4();
  let newPackage: Package = { metadata: { Name: req.body.Name || repo, ID: ID, Version: version }, data: req.body };

  let scores = await getScores(owner, repo, req.body.URL);
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

  const result = await storePackage(newPackage, JSON.parse(scores));
  if (!result) {
    return res.status(500).send("Failed to store package.");
  }

  return res.status(201).json(newPackage);
});

app.get('/package/:id/rate', async (req: Request, res: Response) => { //works
  if (!req.params.id) {
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }

  const pkg = await readPackage(req.params.id);

  if (!pkg) {
    return res.status(404).send("Package does not exist.");
  }
  
  if (!pkg.data.URL) {
    return res.status(400).send("There is missing field(s) in the PackageData or it is formed improperly, or is invalid.");
  }

  const scores = await readPackageRating(pkg.metadata.ID);

  if (!scores) {
    return res.status(500).send("Failed to read package rating.");
  }

  res.status(200).json(scores);
});

app.get('/package/:id/cost', async (req: Request, res: Response) => { //works
  if (!req.params.id) {
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }

  const pkg = await readPackage(req.params.id);

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

app.get('/package/:id/download', async (req: Request, res: Response) => {
  if (!req.params.id) {
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }

  const pkg = await readPackage(req.params.id);

  if (!pkg) {
    return res.status(404).send("Package does not exist.");
  }

  if (!pkg.data.URL) {
    return res.status(400).send("There is missing field(s) in the PackageData or it is formed improperly, or is invalid.");
  }

  const response = await downloadPackageContent(pkg.metadata.ID);

  if (response === null) {
    return res.status(500).send("Failed to retrieve content.");
  } else if (response.includes('Failed')) {
      return res.status(500).send(response);
  }
  return res.status(200).send(response);

});

app.get('/tracks', (req: Request, res: Response) => {
  try {
    res.status(200).json({ plannedTracks: ['Performance track'] })
  } catch (error) {
    res.status(500).json({ message: "The system encountered an error while retrieving the student's track information." });
  }
});

app.listen(port, () => {
  //console.log(`Express is listening exposed at: http://ec2-18-118-106-80.us-east-2.compute.amazonaws.com:${port}`);
  console.log(`Express is listening at https://api.ratethecratebackend.com/`);
});

export default app;
