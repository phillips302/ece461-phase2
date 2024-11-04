import express, { Application, Request, Response } from 'express';
import { Package, PackageQuery, PackageMetadata, PackageData, PackageCost } from './routes/types.js';
import { v4 as uuidv4 } from 'uuid';
import { getScores } from './tools/score.js';
import { getOwnerRepo } from './tools/utils.js';
import { getCumulativeSize } from './tools/dependencyCost.js';
import queryVersionRoutes from './routes/queryVersion.js';

const app: Application = express();
const port = 8081;

const validatePackageQuerySchema = (obj: Partial<PackageQuery>): number => {
  const requiredFields: (keyof PackageQuery)[] = ['Name'];
  const missingFields = requiredFields.filter((field) => obj[field] === undefined);
  return missingFields.length;
};

const validatePackageSchema = (obj: Partial<Package>): number => {
  let numMissingFields = 0;

  const requiredFields: (keyof Package)[] = ['metadata', 'data'];
  const missingFields = requiredFields.filter((field) => obj[field] === undefined);
  numMissingFields += missingFields.length;

  if (obj.metadata) {
    const requiredFields2: (keyof PackageMetadata)[] = ['Name', 'ID', 'Version'];
    const missingFields2 = requiredFields2.filter((field) => obj.metadata![field] === undefined);
    numMissingFields += missingFields2.length;
  }

  if (obj.data) {
    numMissingFields += validatePackageDataSchema(obj.data);
  }

  return numMissingFields;
};

const validatePackageDataSchema = (obj: Partial<PackageData>): number => {
  const requiredFields: (keyof PackageData)[] = ['debloat', 'JSProgram'];
  const missingFields = requiredFields.filter((field) => obj[field] === undefined);
  return missingFields.length;
};

let packageDatabase: Package[] = [];

app.use(express.json());
// Use imported routes
app.use('/', queryVersionRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the REST API!');
});

app.post('/packages', (req: Request, res: Response) => {
  const newPackage: PackageQuery = req.body;

  if (validatePackageQuerySchema(newPackage) !== 0) {
    return res.status(400).send("There is missing field(s) in the PackageQuery or it is formed improperly, or is invalid.");
  }
  //figure out functionality for this
});

app.delete('/reset', (req: Request, res: Response) => { 
  packageDatabase = [];
  res.status(200).send("The package database has been reset.");
});

app.get('/package/:id', (req: Request, res: Response) => {
  if(!req.params.id) {
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }

  const pkg = packageDatabase.find(p => p.metadata.ID === req.params.id);

  if (!pkg) {
    return res.status(404).send("Package does not exist.");
  }

  res.status(200).json(pkg);
});

app.put('/package/:id', (req: Request, res: Response) => {
  //assumes all IDs are unique
  if(!req.params.id && !validatePackageSchema(req.body)) {
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }

  if((!req.body.data.Content && !req.body.data.URL) || (!req.body.data.Content && !req.body.data.URL)) { //should i be concerned about URL being dark blue
    return res.status(400).send("There is missing field(s) in the PackageData or it is formed improperly, or is invalid.");
  }

  const pkg = packageDatabase.find(p => p.metadata.ID === req.params.id);

  if (!pkg || req.body.metadata.Version !== pkg.metadata.Version || req.body.metadata.Name !== pkg.metadata.Name) {
    return res.status(404).send("Package does not exist.");
  }

  pkg.data = req.body.data;
  res.status(200).json(pkg);
});

app.post('/package', (req: Request, res: Response) => {
  //revisit description in schema for other cases that are not upload
  if(!validatePackageDataSchema(req.body)) {
    return res.status(400).send("There is missing field(s) in the Package or it is formed improperly, or is invalid.");
  }

  if((!req.body.data.Content && !req.body.data.URL) || (req.body.data.Content && req.body.data.URL)) { //should i be concerned about URL being dark blue
    return res.status(400).send("There is missing field(s) in the PackageData or it is formed improperly, or is invalid.");
  }

  //keep working here on ingest package next line prolly not gon work gotta ingest then check name??
  const pkg = packageDatabase.find(p => p.metadata.Name === req.params.name);

  if(req.body.data.URL) {

  }

  const newPackageId = uuidv4(); // Generates a unique ID

  //not finished

});

app.get('/package/:id/rate', async (req: Request, res: Response) => {
  if(!req.params.id) {
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }

  const pkg = packageDatabase.find(p => p.metadata.ID === req.params.id);

  if (!pkg) {
    return res.status(404).send("Package does not exist.");
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

app.get('/package/:id/cost', async (req: Request, res: Response) => {
  if(!req.params.id) {
    return res.status(400).send("There is missing field(s) in the PackageID or it is formed improperly, or is invalid.");
  }

  const pkg = packageDatabase.find(p => p.metadata.ID === req.params.id);

  if (!pkg) {
    return res.status(404).send("Package does not exist.");
  }

  const pkgCost: PackageCost = { [pkg.metadata.ID]: { standaloneCost: undefined, totalCost: 0 } };

  pkgCost.ID.totalCost = await getCumulativeSize([pkg.data.URL]);

  if(req.query.dependency) {
    //not finished
  }

  res.status(200).json(pkgCost);
});

app.get('/package/byRegEx', (req: Request, res: Response) => {
  //implement
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
  console.log(`Express is listening at http://localhost:${port}`);
});
