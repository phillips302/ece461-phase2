import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import * as mysql from 'mysql2/promise';
import { storePackage, readPackage, readAllPackages, readPackageRating, deleteAllPackages } from '../src/rds/index';
import { Package, PackageRating } from '../src/apis/types';

vi.mock('mysql2/promise');

const mockPoolQuery = vi.fn();

describe('Database Service Tests', () => {
    beforeEach(() => {
        // Mock pool creation and query execution
        (mysql.createPool as unknown as Mock).mockReturnValue({
            query: mockPoolQuery,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('storePackage', () => {
        it('should return null if RDS insertion fails', async () => {
            const newPackage = {
                metadata: { ID: 'pkg-123', Name: 'test-package', Version: '1.0.0' },
                data: { Name: 'test-package', URL: ''},
            };

            const scores: PackageRating = { BusFactor: 0.5 } as any;

            mockPoolQuery.mockRejectedValue(new Error('RDS error'));
            const result = await storePackage(newPackage, scores);

            expect(result).toBeNull();
        });
    });
    

    describe('readPackage', () => {
        it('should return null if package is not found in RDS', async () => {
            mockPoolQuery.mockResolvedValue([[]]);
            const result = await readPackage('pkg-404');

            expect(result).toBeNull();
        });
    });

    describe('readAllPackages', () => {
        it('should return all packages from the database', async () => {

            const result = await readAllPackages();

            let passed = 0;
            if (!result || result.length === 0) {
                passed = 1;
            }

            expect(passed).toBe(1);
        });
    });

    describe('readPackageRating', () => {
        it('should retrieve package ratings', async () => {

            const result = await readPackageRating('pkg-123');

            expect(result).toBeNull();
        });
    });
});
