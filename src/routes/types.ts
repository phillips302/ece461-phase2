// Define the schema for PackageQuery, EnumerateOffset, and PackageMetadata

  export interface PackageQuery {
    Version?: string;
    Name: string;
  }
  
  export interface EnumerateOffset {
    offset: number;
  }

  export interface Package {
    metadata: PackageMetadata;
    data: PackageData;
  }
  
  export interface PackageMetadata {
    Name: string;
    ID: string;
    Version: string;
  }

  export interface PackageData {
    content: string;
    URL: string;
    debloat: boolean;
    JSProgram: string;
  }

  export interface PackageRating {
    BusFactor: number;
    BusFactorLatency: number;
    Correctness: number;
    CorrectnessLatency: number;
    RampUp: number;
    RampUpLatency: number;
    ResponsiveMaintainer: number;
    ResponsiveMaintainerLatency: number;
    LicenseScore: number;
    LicenseScoreLatency: number;
    GoodPinningPractice: number;
    GoodPinningPracticeLatency: number;
    PullRequest: number;
    PullRequestLatency: number;
    NetScore: number;
    NetScoreLatency: number;
  }

  export interface PackageCost {
    ID: string;
    standaloneCost: number;
    totalCost: number;
  }

  export interface PackageByRegEx {
    RegEx: string;
  }
  