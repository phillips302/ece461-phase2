
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
    Name?: string;
    Content?: string;
    URL?: string;
    debloat?: boolean;
    JSProgram?: string;
  }

  export interface User {
    name: string;
    isAdmin: boolean;
  }

  export interface UserAuthenticationInfo {
    password: string;
  }

  export interface PackageID {
    PackageID: string;
  }
  
  export interface PackageCost {
    [ID: string]: {
        standaloneCost?: number;
        totalCost: number;
    }
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

  export interface PackageHistoryEntry {
    User: User;
    Date: string;
    PackageMetadata: PackageMetadata;
    Action: string;
  }

  export interface PackageName {
    PackageName: string;
  }

  export interface AuthenticationRequest{
    User: User;
    Secret:	UserAuthenticationInfo
  }

  export interface SemverRange {
    SemverRange: string;
  }

  export interface PackageQuery {
    Version?: string;
    Name: string;
  }
  
  export interface EnumerateOffset {
    offset: number;
  }

  export interface PackageByRegEx {
    RegEx: string;
  }
  