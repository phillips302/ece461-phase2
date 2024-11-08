const API_URL = 'http://localhost:8081/api/hello';

export const getHelloMessage = async (): Promise<{ message: string }> => {
  const response = await fetch(API_URL); // Use API_URL directly if it already has /hello
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  
  return await response.json(); // Complete the return statement
};