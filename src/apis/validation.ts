import { Package, PackageQuery, PackageMetadata, PackageData } from './types.js';

export const validatePackageQuerySchema = (obj: Partial<PackageQuery>): number => {
    const requiredFields: (keyof PackageQuery)[] = ['Name'];
    const missingFields = requiredFields.filter((field) => obj[field] === undefined);
    return missingFields.length;
  };
  
export const validatePackageSchema = (obj: Partial<Package>): number => {
    let numMissingFields = 0;
  
    const requiredFields: (keyof Package)[] = ['metadata', 'data'];
    const missingFields = requiredFields.filter((field) => obj[field] === undefined);
    numMissingFields += missingFields.length;
  
    if (obj.metadata) {
      const requiredFields2: (keyof PackageMetadata)[] = ['Name', 'ID', 'Version'];
      const missingFields2 = requiredFields2.filter((field) => obj.metadata![field] === undefined);
      numMissingFields += missingFields2.length;
    }
  
    // if (obj.data) {
    //   numMissingFields += validatePackageDataSchema(obj.data);
    // }
  
    return numMissingFields;
};
  
// export const validatePackageDataSchema = (obj: Partial<PackageData>): number => {
//     const requiredFields: (keyof PackageData)[] = ['debloat', 'JSProgram'];
//     const missingFields = requiredFields.filter((field) => obj[field] === undefined);
//     return missingFields.length;
// };