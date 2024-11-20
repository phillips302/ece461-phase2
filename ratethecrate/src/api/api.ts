import * as types from './types';
import { ALB_BASE_URL } from '../constants.js';

const URL = ALB_BASE_URL || 'http://localhost:8081/';

export const getAllPackages = async ( name:string, version:string | undefined ): Promise<types.PackageMetadata[] | { message : string }> => { //works
  try {
    const PackageQuery:types.PackageQuery = {
      Version: version,
      Name: name
    };
  
    const response = await fetch(`${URL}packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([ PackageQuery ])
    });

    if (!response.ok) {
      const message_text = await response.text();
      return { message: message_text };
    }
  
    const data = await response.json();
  
    return data;
  }
  catch (error) {
    return { message: `Error fetching packages: ${error instanceof Error ? error.message : String(error)}` };
  }  
};

export const deletePackages = async (): Promise<{ message : string }> => { //works
  const response = await fetch(`${URL}reset`, { method: 'DELETE' });

  if (!response.ok) {
    const message_text = await response.text();
    return { message: message_text };
  }

  const message_text = await response.text();

  return { message: message_text };
};

export const getPackage = async (id: string): Promise<types.Package | { message:string }> => { //works
  const response = await fetch(`${URL}package/${id}`);

  if (!response.ok) {
    const message_text = await response.text();
    return { message: message_text };
  }

  const data = await response.json();

  return data;
};

export const updatePackage = async (id: string): Promise<{ message: string }> => { //add a screen for user to input new info and working
  const packageMetadata:types.PackageMetadata = {
    Name: `example-package-0`,
    ID: id,
    Version: "1.0.1"
  }
  
  const packageData:types.PackageData = {
    Name: `example-package-0`,
    debloat: false,
    JSProgram: "console.log('Hello, world!');",
    Content: undefined,
    URL: "https://www.npmjs.com/package/browserify"
  };
  
  const foundPackage:types.Package = {
    metadata: packageMetadata,
    data: packageData
  };

  try {
    const response = await fetch(`${URL}package/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(foundPackage)
    });

    if (!response.ok) {
      const message_text = await response.text();
      return { message: message_text };
    }

    const message_text = await response.text();
  
    return { message: message_text };
  }
  catch (error) {
    return { message: `Error updating packages: ${error instanceof Error ? error.message : String(error)}` };
  }  
};

export const uploadPackage = async ( name?:any, content?:string, URL?:string, debloat?:boolean, jsprogram?:string ): Promise<types.Package | { message:string }> => { //need to implement which package to upload (json object upload)
  try {
    const packageData:types.PackageData = {
      Name: name,
      Content: content,
      URL: URL,
      debloat: false,
      JSProgram: jsprogram
    };
  
    const response = await fetch(`${URL}package`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(packageData)
    });

    if (!response.ok) {
      const message_text = await response.text();
      return { message: message_text };
    }
  
    const data = await response.json();
  
    return data;
  }
  catch (error) {
    return { message: `Error uploading packages: ${error instanceof Error ? error.message : String(error)}` };
  }  
};

export const getPackageRate = async (id: string): Promise<{ rating: types.PackageRating}  | { message : string } > => { //works
  const response = await fetch(`${URL}package/${id}/rate`);

  if (!response.ok) {
    const message_text = await response.text();
    return { message: message_text };
  }

  const data = await response.json();

  return { rating: data }; //Return the rating in the expected format
};

export const getPackageCost = async (id: string): Promise<{ cost: types.PackageCost } | { message : string }> => { //fix dependency
  // const owner, const string } = getOwnerRepo()
  // dependency = fetchDependencies(owner, string)

  const response = await fetch(`${URL}package/${id}/cost`);

  if (!response.ok) {
    const message_text = await response.text();
    return { message: message_text };
  }

  const data = await response.json();

  return { cost: data }; //Return the rating in the expected format
};

export const getCertainPackages = async ( reg: string): Promise<types.PackageMetadata[] | {message:string}> => { //cant test fully but handles errors
  try {
    const PackageByRegEx:types.PackageByRegEx = {
      RegEx: reg
    };
  
    const response = await fetch(`${URL}package/byRegEx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(PackageByRegEx)
    });

    if (!response.ok) {
      const message_text = await response.text();
      return { message: message_text };
    }
  
    const data: types.PackageMetadata[] = await response.json();
    return data;
  }
  catch (error) {
    return { message: `Error fetching packages: ${error instanceof Error ? error.message : String(error)}` };
  }  
};

//implement download once Ethan implements download