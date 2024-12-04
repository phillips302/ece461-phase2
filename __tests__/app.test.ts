import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'; //app.test.ts not fully working yet, but works for now 1234444444444
import fetch, { Response } from 'node-fetch';
import app from "../src/app.js"; // Adjust path as necessary 

let server: any;
let baseUrl: string;

// Define expected response types
interface Package {
  Name: string;
  Version: string;
}

interface Rate {
  NetScore: number;
  Maintainability: number;
}

interface Cost {
  totalCost: number;
  standaloneCost: number;
}

beforeEach(async () => {
  server = app.listen(0); // Start app on a random port
  baseUrl = `http://localhost:${(server as any).address().port}`;
});

afterEach(() => {
  if (server) server.close(); // Shut down server after each test
});

// Mock external dependencies
vi.mock('../src/tools/score.js', () => ({
  getScores: vi.fn(() => Promise.resolve({ NetScore: 1, Maintainability: 0.9 })),
}));

vi.mock('../src/tools/utils.js', () => ({
  getOwnerRepo: vi.fn(() => ({ owner: 'owner', repo: 'repo' })),
}));

vi.mock('../src/tools/dependencyCost.js', () => ({
  getCumulativeSize: vi.fn(() => Promise.resolve([100, 200])),
}));

// Helper function to parse JSON safely
async function parseJsonResponse(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error('Response is not valid JSON:', text);
    throw new Error('Invalid JSON response');
  }
}

describe('Enhanced Express App Testing', () => {
  it('GET / should return a welcome message', async () => {
    const response = await fetch(`${baseUrl}/`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe('Welcome to the REST API!');
  });

  it('POST /packages should validate and fetch packages', async () => {
    const packages = [{ Name: 'example-package-0', Version: '1.0.0' }];
    const response = await fetch(`${baseUrl}/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packages),
    });

    expect(response.headers.get('Content-Type')).toContain('application/json');
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data).toBeInstanceOf(Array);
    expect(data[0]).toMatchObject({
      Name: 'example-package-0',
      Version: '1.0.0',
    });
  });

  it('DELETE /reset should reset the package database', async () => {
    const response = await fetch(`${baseUrl}/reset`, { method: 'DELETE' });
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe('The package database has been reset.');
  });

  it('GET /package/:id should return 404 for non-existent ID', async () => {
    const response = await fetch(`${baseUrl}/package/non-existent`);
    expect(response.status).toBe(404);
  });

//   it('GET /package/:id/rate should return ratings for a valid package', async () => {
//     const response = await fetch(`${baseUrl}/package/12340/rate`);
//     expect(response.headers.get('Content-Type')).toContain('Hello');
//     const data = await parseJsonResponse(response);

//     if (response.status === 404) {
//       expect(data).toEqual('Package does not exist.');
//     } else {
//       expect(response.status).toBe(200);
//       expect(data).toMatchObject({
//         NetScore: 1,
//         Maintainability: 0.9,
//       });
//     }
//   });

//   it('GET /package/:id/cost should return cost information', async () => {
//     const response = await fetch(`${baseUrl}/package/12340/cost`);
//     expect(response.headers.get('Content-Type')).toContain('application/json');
//     const data = await parseJsonResponse(response);

//     if (response.status === 404) {
//       expect(data).toEqual('Package does not exist.');
//     } else {
//       expect(response.status).toBe(200);
//       expect(data).toMatchObject({
//         totalCost: 200,
//         standaloneCost: 100,
//       });
//     }
//   });

//   it('POST /package/byRegEx should return matching packages', async () => {
//     const response = await fetch(`${baseUrl}/package/byRegEx`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ RegEx: 'example*' }),
//     });

//     expect(response.headers.get('Content-Type')).toContain('application/json');
//     const data = await parseJsonResponse(response);

//     if (response.status === 404) {
//       expect(data).toEqual('Package does not exist.');
//     } else {
//       expect(response.status).toBe(200);
//       expect(data).toBeInstanceOf(Array);
//     }
//   });

  it('should handle invalid requests with proper status codes', async () => {
    const response = await fetch(`${baseUrl}/invalid-route`);
    expect(response.status).toBe(404);
  });
});
