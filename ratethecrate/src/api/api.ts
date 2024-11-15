import * as types from '../../../src/apis/types.js';

const URL = 'http://localhost:8081/'

export const getAllPackages = async ( name:string, version:string | undefined ): Promise<types.PackageMetadata[]> => { //works
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
      throw new Error(`Failed to fetch packages: ${response.statusText}`);
    }
  
    const data = await response.json();
  
    return data;
  }
  catch (error) {
    throw new Error(`Error fetching packages: ${error}`);
  }  
};

export const deletePackages = async (): Promise<{ message : string }> => { //works
  const response = await fetch(`${URL}reset`, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(`Failed to delete packages: ${response.statusText}`);
  }

  const message_text = await response.text();

  return { message: message_text };
};

export const getPackage = async (id: string): Promise<types.Package> => { //works
  const response = await fetch(`${URL}package/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch package: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};

export const updatePackage = async (id: string): Promise<void> => { //not working
  const foundPackage = await getPackage(id)
  try {
    const PackageMetadata:types.PackageMetadata = {
      Name: foundPackage.metadata.Name,
      ID: foundPackage.metadata.ID,
      Version: foundPackage.metadata.Version
    }

    const PackageData:types.PackageData = {
      Name: foundPackage.data?.Name ?? undefined,
      Content: foundPackage.data?.Content ?? undefined,
      URL: foundPackage.data?.URL ?? undefined,
      debloat: foundPackage.data?.debloat ?? undefined,
      JSProgram: foundPackage.data?.JSProgram ?? undefined
    }

    const thisPackage:types.Package = {
      metadata: PackageMetadata,
      data: PackageData
    };
  
    const response = await fetch(`${URL}package/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([ thisPackage ])
    });

    if (!response.ok) {
      throw new Error(`Failed to update package: ${response.statusText}`);
    }
  
    return;
  }
  catch (error) {
    throw new Error(`Error updating packages: ${error}`);
  }  
};

export const uploadPackage = async (): Promise<types.Package> => { //need to implement which package to upload also download included?
  try {
    const packageData:types.PackageData = {
      Name: "",
      Content: "",
      URL: "",
      debloat: false,
      JSProgram: ""
    };
  
    const response = await fetch(`${URL}package`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([ packageData ])
    });

    if (!response.ok) {
      throw new Error(`Failed to upload packages: ${response.statusText}`);
    }
  
    const data = await response.json();
  
    return data;
  }
  catch (error) {
    throw new Error(`Error fetching packages: ${error}`);
  }  
};

export const getPackageRate = async (id: string): Promise<{ rating: types.PackageRating }> => { //works
  const response = await fetch(`${URL}package/${id}/rate`);

  if (!response.ok) {
    throw new Error(`Failed to fetch rate: ${response.statusText}`);
  }

  const data = await response.json();

  return { rating: data }; //Return the rating in the expected format
};

export const getPackageCost = async (id: string): Promise<{ cost: types.PackageCost }> => { //fix dependency
  // const owner, const string } = getOwnerRepo()
  // dependency = fetchDependencies(owner, string)

  const response = await fetch(`${URL}package/${id}/cost`);

  if (!response.ok) {
    throw new Error(`Failed to fetch cost: ${response.statusText}`);
  }

  const data = await response.json();

  return { cost: data }; //Return the rating in the expected format
};

export const getCertainPackages = async ( reg: string): Promise<types.PackageMetadata[]> => { //not working
  try {
    const PackageByRegEx:types.PackageByRegEx = {
      RegEx: reg
    };
  
    const response = await fetch(`${URL}package/byRegEx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([ PackageByRegEx ])
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch packages: ${response.statusText}`);
    }
  
    const data = await response.json();
  
    return data;
  }
  catch (error) {
    throw new Error(`Error fetching packages: ${error}`);
  }  
};
