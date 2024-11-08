import * as types from '../../src/apis/types.js';

const API_URL = 'http://localhost:8081/api/hello'
const URL = 'http://localhost:8081/'

export const getHelloMessage = async (): Promise<{ message: string }> => {
  const response = await fetch(API_URL); // Use API_URL directly if it already has /hello
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  return await response.json(); // Complete the return statement
};

export const getPackageRate = async (id: string): Promise<{ rating: types.PackageRating }> => {
  //const response = await fetch(`${URL}package/${id}/rate`);
  const response = await fetch(`http://localhost:8081/package/12345/rate`);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  return await response.json(); // Complete the return statement
};