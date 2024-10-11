import { gql } from 'graphql-request';
import { logMessage, gitHubRequest } from './utils.js';

// Define the dependency response based on the GraphQL query
type DependencyResponse = {
    [packageName: string]: string;
};

type GraphQLResponse = {
    repository: {
        object: {
            text: string;
        };
    };
};

/**
 * Fetches the dependencies of a given GitHub repository.
 *
 * @param owner - The owner of the repository.
 * @param name - The name of the repository.h * @returns A promise that resolves to a list of dependencies. *
 * @throws Will log an error message if the request fails and return an empty array. * * @example * ```typescript * const contributors = await fetchRepoContributors('octocat', 'Hello-World'); * console.log(contributors); * ```
 */
export async function fetchDependencies(owner: string, name: string): Promise<DependencyResponse[]> {
    const query = `
        query($owner: String!, $name: String!) {
            repository(owner: $owner, name: $name) {
                object(expression: "HEAD:package.json") {
                    ... on Blob {
                        text
                    }
                }
            }
        }
    `;

    try {
        //query to find the package.json and it's text
        const response: GraphQLResponse = await gitHubRequest(query, { owner, name }) as GraphQLResponse;
        const packageJsonContent = response.repository.object.text;

        //parse the package.json to grab a list of dependencies
        const packageJson = JSON.parse(packageJsonContent);
        const dependencies: DependencyResponse[] = {
            ...(packageJson.dependencies || {}),
            // ...(packageJson.devDependencies || {})
        };

        return dependencies;
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error occurred';
        logMessage('ERROR', `Error fetching fraction of dependencies: ${errorMessage}`);
        return [];
    }
}

/**
 * Calculates the fractionDependency score based on a given list of dependencies.
 * 
 * This function calculates the score by evaluating the major and minor versions of the dependencies. If the the version is
 * specfic on it's major and minor version the score is resulted in a 0. Then at the end the average score is found based on
 * each dependency's score
 * 
 *  * 
 * @param dependencies - An array of `DependencyResponse` objects representing the dependecies found.
 * @returns The score based on the average score of each dependecy found
 */
function calculateDependencyScore(dependencies: DependencyResponse[]): number {
    let result = 0
    let totalDependencies = Object.keys(dependencies).length

    //check that the list is empty, if so return 1
    if (totalDependencies == 0) {
        return 1
    }

    //iterate through each dependency found
    Object.entries(dependencies).forEach(([packageName, version]) => {
        //checks that the version is not #.0.0
        const split_version = String(version).split('.')
        if (!(split_version[1] == '0' && split_version[2] == '0')) {
            result++;  // Increment the count of pinned dependencies
        }
    });

    //find the average of all dependencies to determine the score
    result = result / totalDependencies

    return parseFloat(result.toFixed(2));
}

/**
 * Calculates the dependency fraction for a given repository.
 * The dependency fraction is the score based on the average of each dependency and their fixed major and minor version.
 * 
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @returns A promise that resolves to the fraction dependency, a number between 0 and 1.
 */
export async function getDependencyFraction(owner: string, repo: string): Promise<number> {
    const dependencies = await fetchDependencies(owner, repo);
    const score = calculateDependencyScore(dependencies);
    return score;
}