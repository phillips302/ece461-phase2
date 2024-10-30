import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

const app = express();

// Middleware
app.use(bodyParser.json());

// In-memory storage for packages (you can replace this with a database)
let packages: { id: string; content: string; jsProgram: string; debloat: boolean }[] = [];

// Package Data Schema
interface PackageData {
  id: string;
  content: string;
  jsProgram: string;
  debloat: boolean;
}

// Create a new package
app.post('/', (req: Request, res: Response) => {
  const packageData: PackageData = req.body;

  if (!packageData.id || !packageData.content || !packageData.jsProgram) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  packages.push(packageData);
  return res.status(201).json(packageData);
});

// Get package by ID
app.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const packageData = packages.find(pkg => pkg.id === id);

  if (!packageData) {
    return res.status(404).json({ error: 'Package not found' });
  }

  return res.status(200).json(packageData);
});
