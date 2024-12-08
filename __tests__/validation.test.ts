import { describe, it, expect } from 'vitest';
import { validatePackageSchema, validateDataSchema } from '../src/apis/validation.js'; // Update the path as necessary
import { Package, PackageData } from '../src/apis/types.js'; // Update the path as necessary

describe('validatePackageSchema', () => {
  it('should return error if metadata or data is missing', () => {
    const result = validatePackageSchema({} as Partial<Package>);
    expect(result).toBe("There is missing field(s) in the Package (metadata and data must be defined)");
  });

  it('should return error if Name, ID, or Version is missing in metadata', () => {
    const result = validatePackageSchema({ metadata: {}, data: {} } as Partial<Package>);
    expect(result).toBe("There is missing field(s) in the PackageMetadata (Name, ID, and Version must be defined)");
  });

  it('should return error from validateDataSchema if there are issues in data', () => {
    const result = validatePackageSchema({
      metadata: { Name: 'name', ID: 'id', Version: 'version' },
      data: {},
    } as Partial<Package>);
    expect(result).toBe("Both Content and URL are undefined.");
  });

  it('should return undefined if schema is valid', () => {
    const result = validatePackageSchema({
      metadata: { Name: 'name', ID: 'id', Version: 'version' },
      data: { URL: 'http://example.com' },
    } as Partial<Package>);
    expect(result).toBeUndefined();
  });
});

describe('validateDataSchema', () => {
  it('should return error if both Content and URL are undefined', () => {
    const result = validateDataSchema({});
    expect(result).toBe("Both Content and URL are undefined.");
  });

  it('should return error if both Content and URL are defined', () => {
    const result = validateDataSchema({ URL: 'http://example.com', Content: 'sample content' });
    expect(result).toBe("Both Content and URL are defined.");
  });

  it('should return undefined if either Content or URL is defined correctly', () => {
    const result = validateDataSchema({ URL: 'http://example.com' });
    expect(result).toBeUndefined();

    const result2 = validateDataSchema({ Content: 'sample content' });
    expect(result2).toBeUndefined();
  });
});
