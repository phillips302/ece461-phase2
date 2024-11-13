import * as types from '../../src/apis/types.js';

const URL = 'http://localhost:8081/'

export const getAllPackages = async ( name:string, version:string | undefined ): Promise<types.PackageMetadata[]> => {
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
      alert(`Failed to fetch packages: ${response.statusText}`);
    }
  
    const data = await response.json();
  
    return data;
  }
  catch (error) {
    alert(`Error fetching packages: ${error}`);
    return []
  }  
};

export const deletePackages = async (): Promise<{ message : string }> => {
  const response = await fetch(`${URL}reset`, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const message_text = await response.text();

  return { message: message_text };
};

export const getPackage = async (id: string): Promise<types.Package> => {
  const response = await fetch(`${URL}package/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch packages: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};

export const updatePackage = async (id: string): Promise<types.Package> => {
  const response = await fetch(`${URL}package/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch packages: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};

export const uploadPackage = async (): Promise<types.Package> => {
  const response = await fetch(`${URL}package`);

  if (!response.ok) {
    throw new Error(`Failed to fetch packages: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};

export const getPackageRate = async (id: string): Promise<{ rating: types.PackageRating }> => {
  const response = await fetch(`${URL}package/${id}/rate`);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const data = await response.json();

  return { rating: data }; //Return the rating in the expected format
};

export const getPackageCost = async (id: string): Promise<{ cost: types.PackageCost }> => {
  // const owner, const string } = getOwnerRepo()
  // dependency = fetchDependencies(owner, string)

  const response = await fetch(`${URL}package/${id}/cost`);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const data = await response.json();

  return { cost: data }; //Return the rating in the expected format
};

export const getCertainPackages = async ( reg: string): Promise<types.PackageMetadata[]> => {
  const response = await fetch(`${URL}package/byRegEx`);

  if (!response.ok) {
    throw new Error(`Failed to fetch packages: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
};
