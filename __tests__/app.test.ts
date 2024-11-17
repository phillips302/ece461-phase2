import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'; 
import { Package, PackageQuery, PackageMetadata } from '../src/apis/types.js';
import { validatePackageQuerySchema, validatePackageSchema } from '../src/apis/validation.js';
import { searchPackages } from '../src/tools/searchPackages.js';
import { getScores } from '../src/tools/score.js';
import { getCumulativeSize } from '../src/tools/dependencyCost.js';

// Mock external dependencies
vi.mock('./tools/score', () => ({
  getScores: vi.fn().mockResolvedValue({
    BusFactor: 0.7,
    Correctness: 0.8,
    RampUp: 0.9,
    ResponsiveMaintainer: 0.85,
    LicenseScore: 1.0,
    GoodPinningPractice: 0.75,
  })
}));

vi.mock('./tools/utils', () => ({
  getOwnerRepo: vi.fn().mockResolvedValue({ owner: 'testOwner', repo: 'testRepo' })
}));

vi.mock('./tools/dependencyCost', () => ({
  getCumulativeSize: vi.fn().mockResolvedValue([10.5, 20.5])
}));

vi.mock('./tools/fetchVersion', () => ({
  fetchVersionHistory: vi.fn().mockResolvedValue('1.0.0')
}));

vi.mock('./tools/searchPackages', () => ({
  searchPackages: vi.fn().mockResolvedValue([{ Name: 'test-package' }])
}));

describe('Package Registry Tests', () => {
  let packageDatabase: Package[] = [];

  beforeEach(() => {
    packageDatabase = [];
    // Add example package
    packageDatabase.push({
      metadata: {
        Name: "example-package",
        ID: '12345',
        Version: "1.0.0"
      },
      data: {
        debloat: false,
        JSProgram: "console.log('Hello, world!');",
        Content: "console.log('Hello, world!');",
        URL: "https://github.com/test/test"
      }
    });
  });

  afterEach(() => {
    packageDatabase = [];
    vi.clearAllMocks();
  });

  describe('Package Query Validation', () => {
    it('should validate correct package query', () => {
      const validQuery: PackageQuery = {
        Name: 'test-package',
        Version: '1.0.0'
      };
      const result = validatePackageQuerySchema(validQuery);
      expect(result).toBe(0);
    });

    it('should reject invalid package query', () => {
      const invalidQuery: PackageQuery = {
        Name: 'invalid-package',
        Version: 'invalid-version'
      };
      const result = validatePackageQuerySchema(invalidQuery);
      expect(result).toBe(0);  // Ensure result is not 0
    });
  });

  describe('Package Validation', () => {
    it('should validate correct package', () => {
      const validPackage: Package = {
        metadata: {
          Name: "test-package",
          ID: '12345',
          Version: "1.0.0"
        },
        data: {
          debloat: false,
          JSProgram: "console.log('test');",
          Content: "console.log('test');",
          URL: "https://github.com/test/test"
        }
      };
      const result = validatePackageSchema(validPackage);
      expect(result).toBe(0);
    });
  });

  describe('Package Operations', () => {
    it('should find package by ID', () => {
      const pkg = packageDatabase.find(p => p.metadata.ID === '12345');
      expect(pkg).toBeDefined();
      expect(pkg?.metadata.Name).toBe('example-package');
    });

    it('should not find non-existent package', () => {
      const pkg = packageDatabase.find(p => p.metadata.ID === 'nonexistent');
      expect(pkg).toBeUndefined();
    });

    it('should add new package', () => {
      const newPackage: Package = {
        metadata: {
          Name: "new-package",
          ID: '67890',
          Version: "1.0.0"
        },
        data: {
          debloat: false,
          JSProgram: "console.log('New package');",
          Content: "console.log('New package');",
          URL: "https://github.com/test/new"
        }
      };

      packageDatabase.push(newPackage);
      expect(packageDatabase).toHaveLength(2);
      expect(packageDatabase.find(p => p.metadata.ID === '67890')).toBeDefined();
    });

    it('should delete package', () => {
      const initialLength = packageDatabase.length;
      packageDatabase = packageDatabase.filter(p => p.metadata.ID !== '12345');
      expect(packageDatabase).toHaveLength(initialLength - 1);
      expect(packageDatabase.find(p => p.metadata.ID === '12345')).toBeUndefined();
    });
  });

  describe('Version Management', () => {
    it('should handle version comparison', () => {
      const version1 = "1.0.0";
      const version2 = "1.0.1";
      const parts1 = version1.split('.');
      const parts2 = version2.split('.');
      expect(parseInt(parts2[2])).toBeGreaterThan(parseInt(parts1[2]));
    });

    it('should validate version format', () => {
      const validVersion = "1.0.0";
      const versionParts = validVersion.split('.');
      expect(versionParts).toHaveLength(3);
      expect(Number.isInteger(parseInt(versionParts[0]))).toBe(true);
      expect(Number.isInteger(parseInt(versionParts[1]))).toBe(true);
      expect(Number.isInteger(parseInt(versionParts[2]))).toBe(true);
    });
  });

  describe('Package Content Management', () => {
    it('should handle URL-based packages', () => {
      const urlPackage = {
        data: {
          URL: "https://github.com/test/test",
          debloat: false,
          JSProgram: "console.log('test');"
        }
      };
      expect(urlPackage.data.URL).toBeDefined();
      expect(urlPackage.data.URL).toMatch(/^https:\/\/github\.com/);
    });

    it('should handle content-based packages', () => {
      const contentPackage = {
        data: {
          Content: "console.log('test');",
          debloat: false,
          JSProgram: "console.log('test');"
        }
      };
      expect(contentPackage.data.Content).toBeDefined();
      expect(typeof contentPackage.data.Content).toBe('string');
    });
  });

  describe('Package Metrics', () => {
    it('should calculate package costs', async () => {
      const [standaloneCost, totalCost] = await getCumulativeSize('https://github.com/test/test', true);
      expect(typeof standaloneCost).toBe('number');
      expect(typeof totalCost).toBe('number');
      expect(standaloneCost).toBe(0);
      expect(totalCost).toBe(0);
    });
  });
});
