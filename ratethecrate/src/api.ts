import * as types from '../../src/apis/types.js';

const URL = 'http://localhost:8081/'

export const getPackageRate = async (id: string): Promise<{ rating: types.PackageRating }> => {
  const response = await fetch(`${URL}package/${id}/rate`);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const data = await response.json();

  return { rating: data }; //Return the rating in the expected format
};