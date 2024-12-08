import request from 'supertest';
import app from '../src/app.ts';
import { expect, describe, it, vi } from 'vitest';

// Mock the external dependencies
vi.mock('../rds/index.js', () => ({
  readAllPackages: vi.fn(),
  storePackage: vi.fn(),
  deleteAllPackages: vi.fn(),
}));

vi.mock('../tools/uploadToS3.js', () => ({
  deleteFromS3: vi.fn(),
}));

describe('App Endpoints', () => {
  it('GET /health should return OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('POST /packages should handle missing fields', async () => {
    const res = await request(app)
      .post('/packages')
      .send([]); // Sending an empty array to simulate missing data

    expect(res.status).toBe(400);
    expect(res.text).toContain('There is missing field(s)');
  });

  it('POST /packages should return data when valid request is sent', async () => {
    const mockPackages = [
      { metadata: { Name: 'mockPackage', Version: '1.0.0' }, data: {} },
    ];
    vi.mocked(require('../rds/index.js').readAllPackages).mockResolvedValueOnce(mockPackages);

    const res = await request(app)
      .post('/packages')
      .send([{ Name: 'mockPackage' }]); // Valid query payload

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockPackages.map((pkg) => pkg.metadata));
  });
});