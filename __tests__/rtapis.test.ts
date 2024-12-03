import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as types from '../ratethecrate/src/api/types';
import { getAllPackages, deletePackages, getPackage, updatePackage, uploadPackage, getPackageRate, getPackageCost, getCertainPackages } from '../ratethecrate/src/api/api';  // Adjust the path accordingly

// Mocking fetch globally
global.fetch = vi.fn();

// Common URL constant for tests
const URL = 'http://localhost:8081/';

describe('API Functions', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getAllPackages', () => {
    it('should fetch all packages successfully', async () => {
      const mockResponse = [{ name: 'package1', version: '1.0.0' }];
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getAllPackages('package1', '1.0.0');
      expect(result).toEqual(mockResponse);
    });

    it('should return an error message on fetch failure', async () => {
      fetch.mockResolvedValue({
        ok: false,
        text: async () => 'Fetch failed'
      });

      const result = await getAllPackages('package1', '1.0.0');
      expect(result).toEqual({ message: 'Fetch failed' });
    });
  });

  describe('deletePackages', () => {
    it('should delete packages successfully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        text: async () => 'Deleted successfully'
      });

      const result = await deletePackages();
      expect(result).toEqual({ message: 'Deleted successfully' });
    });

    it('should return an error message on delete failure', async () => {
      fetch.mockResolvedValue({
        ok: false,
        text: async () => 'Delete failed'
      });

      const result = await deletePackages();
      expect(result).toEqual({ message: 'Delete failed' });
    });
  });

  describe('getPackage', () => {
    it('should fetch package details successfully', async () => {
      const mockResponse = { id: '1', name: 'package1', version: '1.0.0' };
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getPackage('1');
      expect(result).toEqual(mockResponse);
    });

    it('should return an error message on fetch failure', async () => {
      fetch.mockResolvedValue({
        ok: false,
        text: async () => 'Fetch failed'
      });

      const result = await getPackage('1');
      expect(result).toEqual({ message: 'Fetch failed' });
    });
  });

  describe('updatePackage', () => {
    it('should update package successfully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        text: async () => 'Updated successfully'
      });

      const result = await updatePackage({ metadata: { ID: '1' } });
      expect(result).toEqual({ message: 'Updated successfully' });
    });

    it('should return an error message on update failure', async () => {
      fetch.mockResolvedValue({
        ok: false,
        text: async () => 'Update failed'
      });

      const result = await updatePackage({ metadata: { ID: '1' } });
      expect(result).toEqual({ message: 'Update failed' });
    });
  });

  describe('uploadPackage', () => {
    it('should upload package successfully', async () => {
      const mockResponse = { id: '1', name: 'package1', version: '1.0.0' };
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await uploadPackage({ name: 'package1', content: 'content' });
      expect(result).toEqual(mockResponse);
    });

    it('should return an error message on upload failure', async () => {
      fetch.mockResolvedValue({
        ok: false,
        text: async () => 'Upload failed'
      });

      const result = await uploadPackage({ name: 'package1', content: 'content' });
      expect(result).toEqual({ message: 'Upload failed' });
    });
  });

  describe('getPackageRate', () => {
    it('should fetch package rate successfully', async () => {
      const mockResponse = { rating: 5 };
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getPackageRate('1');
      expect(result).toEqual({ rating: mockResponse });
    });

    it('should return an error message on fetch failure', async () => {
      fetch.mockResolvedValue({
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
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getPackageCost('1');
      expect(result).toEqual({ cost: mockResponse });
    });

    it('should return an error message on fetch failure', async () => {
      fetch.mockResolvedValue({
        ok: false,
        text: async () => 'Fetch failed'
      });

      const result = await getPackageCost('1');
      expect(result).toEqual({ message: 'Fetch failed' });
    });
  });

  describe('getCertainPackages', () => {
    it('should fetch certain packages successfully', async () => {
      const mockResponse = [{ name: 'package1', version: '1.0.0' }];
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getCertainPackages('regex');
      expect(result).toEqual(mockResponse);
    });

    it('should return an error message on fetch failure', async () => {
      fetch.mockResolvedValue({
        ok: false,
        text: async () => 'Fetch failed'
      });

      const result = await getCertainPackages('regex');
      expect(result).toEqual({ message: 'Fetch failed' });
    });
  });
});

