// Define the schema for PackageQuery, EnumerateOffset, and PackageMetadata

export interface PackageQuery {
    name: string;
    version?: string;
  }
  
  export interface EnumerateOffset {
    offset: number;
  }
  
  export interface PackageMetadata {
    ID: string;
    Name: string;
    Version: string;
  }
  