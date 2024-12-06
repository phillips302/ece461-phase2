import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'; 
import * as types from '../ratethecrate/src/api/types';
import { getAllPackages, deletePackages, getPackage, updatePackage, uploadPackage, getPackageRate, getPackageCost, getCertainPackages } from '../ratethecrate/src/api/api';  // Adjust the path accordingly


// Mocking fetch globally
const globalAny: any = global;
globalAny.fetch = vi.fn();

const URL = 'http://localhost:8081/';

// Define mock data
const mockPackageMetadata: types.PackageMetadata = {
  ID: '1',
  Name: 'package1',
  Version: '1.0.0'
};

const mockPackageData: types.PackageData = {
  // Add only the necessary fields according to the types
  Name: 'package1',
  Content: 'content'
};

const mockPackage: types.Package = {
  metadata: mockPackageMetadata,
  data: {} // Provide necessary mock data here
};

describe('API Functions', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getAllPackages', () => {
    it('should fetch all packages successfully', async () => {
      const mockResponse = [mockPackageMetadata];
      globalAny.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getAllPackages('package1', '1.0.0');
      expect(result).toEqual(mockResponse);
    });

    it('should return an error message on fetch failure', async () => {
      globalAny.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Fetch failed'
      });

      const result = await getAllPackages('package1', '1.0.0');
      expect(result).toEqual({ message: 'Fetch failed' });
    });
  });

  describe('deletePackages', () => {
    it('should delete packages successfully', async () => {
      globalAny.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Deleted successfully'
      });

      const result = await deletePackages();
      expect(result).toEqual({ message: 'Deleted successfully' });
    });

    it('should return an error message on delete failure', async () => {
      globalAny.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Delete failed'
      });

      const result = await deletePackages();
      expect(result).toEqual({ message: 'Delete failed' });
    });
  });

  describe('getPackage', () => {
    it('should fetch package details successfully', async () => {
      const mockResponse = mockPackage;
      globalAny.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getPackage('1');
      expect(result).toEqual(mockResponse);
    });

    it('should return an error message on fetch failure', async () => {
      globalAny.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Fetch failed'
      });

      const result = await getPackage('1');
      expect(result).toEqual({ message: 'Fetch failed' });
    });
  });

  describe('updatePackage', () => {
    it('should update package successfully', async () => {
      globalAny.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Updated successfully'
      });

      const updatedPackage: types.Package = {
        metadata: mockPackageMetadata,
        data: {} // Provide necessary mock data here
      };
      const result = await updatePackage(updatedPackage);
      expect(result).toEqual({ message: 'Updated successfully' });
    });

    it('should return an error message on update failure', async () => {
      globalAny.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Update failed'
      });

      const updatedPackage: types.Package = {
        metadata: mockPackageMetadata,
        data: {} // Provide necessary mock data here
      };
      const result = await updatePackage(updatedPackage);
      expect(result).toEqual({ message: 'Update failed' });
    });
  });

  describe('uploadPackage', () => {
    it('should upload package successfully', async () => {
      const mockResponse = mockPackage;
      globalAny.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await uploadPackage(mockPackageData);
      expect(result).toEqual(mockResponse);
    });

    it('should return an error message on upload failure', async () => {
      globalAny.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Upload failed'
      });

      const result = await uploadPackage(mockPackageData);
      expect(result).toEqual({ message: 'Upload failed' });
    });
  });

  describe('getPackageRate', () => {
    it('should fetch package rate successfully', async () => {
      const mockResponse = { rating: 5 };
      globalAny.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getPackageRate('1');
      expect(result).toEqual({ rating: mockResponse });
    });

    it('should return an error message on fetch failure', async () => {
      globalAny.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Fetch failed'
      });

      const result = await getPackageRate('1');
      expect(result).toEqual({ message: 'Fetch failed' });
    });
  });

  describe('getPackageCost', () => {
    it('should fetch package cost successfully', async () => {
      const mockResponse = { cost: 100 };
      globalAny.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getPackageCost('1');
      expect(result).toEqual({ cost: mockResponse });
    });

    it('should return an error message on fetch failure', async () => {
      globalAny.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Fetch failed'
      });

      const result = await getPackageCost('1');
      expect(result).toEqual({ message: 'Fetch failed' });
    });
  });

  describe('getCertainPackages', () => {
    it('should fetch certain packages successfully', async () => {
      const mockResponse = [mockPackageMetadata];
      globalAny.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getCertainPackages('regex');
      expect(result).toEqual(mockResponse);
    });

    it('should return an error message on fetch failure', async () => {
      globalAny.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Fetch failed'
      });

      const result = await getCertainPackages('regex');
      expect(result).toEqual({ message: 'Fetch failed' });
    });
  });
});
