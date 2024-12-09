import request from 'supertest';
import app from '../src/app.ts';
import * as rds from '../src/rds/index';
import * as types from '../ratethecrate/src/api/types';
import { expect, describe, it, vi } from 'vitest';

vi.mock('../src/rds/index', () => ({
    readAllPackages: vi.fn(),
    storePackage: vi.fn(),
    deleteAllPackages: vi.fn(),
    readPackage: vi.fn(),
}));

vi.mock('../src/tools/uploadToS3.ts', () => ({
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

    it('POST /packages should return package metadata for a valid query', async () => {
        const mockPackages: types.Package[] = [
        {
        metadata: {
            Name: 'mockPackage',
            ID: 'mock-id-123',
            Version: '1.0.0',
        },
        data: {},
        },
        ];

        vi.mocked(rds.readAllPackages).mockResolvedValueOnce(mockPackages);

        const PackageQuery:types.PackageQuery = {
            Version: undefined,
            Name: 'mockPackage'
        };

        const res = await request(app)
            .post('/packages')
            .send([PackageQuery]);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1)
        expect(res.body).toEqual([
            {
            Name: 'mockPackage',
            ID: 'mock-id-123',
            Version: '1.0.0',
            },
        ]);
    });

    it('DELETE /reset should reset the package database successfully', async () => {
        const mockPackages: types.Package[] = [
            {
                metadata: {
                    Name: 'mockPackage1',
                    ID: 'mock-id-123',
                    Version: '1.0.0',
                },
                data: {},
            },
        ];

        vi.mocked(rds.readAllPackages).mockResolvedValueOnce(mockPackages);

        const { deleteFromS3 } = await import('../src/tools/uploadToS3.ts');
        const deleteFromS3Mock = vi.mocked(deleteFromS3);

        deleteFromS3Mock.mockResolvedValueOnce('Deleted successfully');
        vi.mocked(rds.deleteAllPackages).mockResolvedValueOnce('All packages deleted successfully');

        const res = await request(app).delete('/reset');

        expect(res.status).toBe(200);
        expect(res.text).toBe("The package database has been reset.");

        expect(deleteFromS3Mock).toHaveBeenCalledTimes(mockPackages.length);
        expect(deleteFromS3Mock).toHaveBeenCalledWith('mockPackage1/mock-id-123'); // This should match the structure

        expect(rds.deleteAllPackages).toHaveBeenCalledTimes(1);
    });

    it('GET /package/:id should return package data for a valid ID', async () => {
        const mockPackage: types.Package = {
            metadata: {
                Name: 'mockPackage',
                ID: 'mock-id-123',
                Version: '1.0.0',
            },
            data: {},
        };

        // Mock the return value of readPackage
        vi.mocked(rds.readPackage).mockResolvedValueOnce(mockPackage);

        const res = await request(app).get('/package/mock-id-123');

        expect(res.status).toBe(200); // Expect a successful response
        expect(res.body).toEqual(mockPackage); // Expect the response body to match the mock package
    });

    it('POST /package/byRegEx should return package metadata for valid regex', async () => {
        const mockPackages: types.Package[] = [
            {
              metadata: {
                Name: 'mockPackage1',
                ID: 'mock-id-123',
                Version: '1.0.0',
              },
              data: {},
            },
            {
              metadata: {
                Name: 'mockPackage2',
                ID: 'mock-id-456',
                Version: '1.1.0',
              },
              data: {},
            },
          ];
      
          // Mock the return value of searchPackagesRDS
          vi.mocked(rds.readAllPackages).mockResolvedValueOnce(mockPackages);
      
          // Mock the return value of readPackage for each package ID
          vi.mocked(rds.readPackage)
            .mockResolvedValueOnce(mockPackages[0]) // For 'mock-id-123'
            .mockResolvedValueOnce(mockPackages[1]); // For 'mock-id-456'
      
          // Define the regex to send in the request
          const regEx: types.PackageByRegEx = {
            RegEx: '^mock.*'
          };
      
          // Make the request
          const res = await request(app).post('/package/byRegEx').send(regEx);
      
          // Expectations
          expect(res.status).toBe(200); // Expect a successful response
          expect(res.body.length).toBe(mockPackages.length); // Expect the length of returned metadata to match the number of mock packages
          expect(res.body).toEqual(mockPackages.map(pkg => pkg.metadata)); // Expect the response body to match the metadata of all mock packages
    });
});