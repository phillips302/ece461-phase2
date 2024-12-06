import { Package, PackageData } from './types.js';

export const validatePackageSchema = (obj: Partial<Package>): string | undefined => {
    if(!obj.metadata || !obj.data){
        return "There is missing field(s) in the Package (metadata and data must be defined)";
    }

    if(!obj.metadata.Name || !obj.metadata.ID || !obj.metadata.Version){
      return "There is missing field(s) in the PackageMetadata (Name, ID, and Version must be defined)";
    }

    if (validateDataSchema(obj.data)) { 
        return validateDataSchema(obj.data);
    }
};
  
export const validateDataSchema = (obj: Partial<PackageData>): string | undefined => {
  if(!obj.URL && !obj.Content){
    return "Both Content and URL are undefined.";
  }

  if(obj.URL && obj.Content){
    return "Both Content and URL are defined.";
  }

  // if (obj.Content && !obj.Name) { 
  //   return "If Content is defined Name also must be provided in data.";
  // }
};