import { gql } from 'graphql-request';
import { JSDOM } from 'jsdom';
import { gitHubRequest, logMessage } from '../utils.js';

const KEYWORDS = ["installation", "usage", "api", "examples", "run", "load"]; //Added keywords after examples
const DEFAULT_SCORE = 0; // Default score when no documentation is found

// Helper function to calculate the documentation score
function calculateScore(text: string): number {
    const lowerCaseText = text.toLowerCase();
    const keywordCount = KEYWORDS.reduce((count, keyword) => 
        count + (lowerCaseText.includes(keyword) ? 1 : 0), 0
    );
    return KEYWORDS.length > 0 ? keywordCount / KEYWORDS.length : DEFAULT_SCORE;
}

// 1. Analyze Documentation (presence of README.md, tutorials, etc.)
export async function getDocumentationScore(repoOwner: string, repoName: string): Promise<number> {
    const query = gql`
        query GetReadme($repoOwner: String!, $repoName: String!) {
            repository(owner: $repoOwner, name: $repoName) {
                object(expression: "HEAD:") {
                    ... on Tree {
                        entries {
                            name
                            type
                            object {
                                ... on Blob {
                                    text
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        const data = await gitHubRequest(query, { repoOwner, repoName }) as any;
        const readmeEntry = data.repository?.object?.entries?.find((entry: any) => {
            return entry.type === 'blob' && entry.name.toLowerCase().includes('readme');
        });
        if (!readmeEntry) {
            logMessage('INFO', `No README-like file found in ${repoOwner}/${repoName}`);
            return DEFAULT_SCORE;
        }
        logMessage('INFO', `README-like file found in ${repoOwner}/${repoName}`);

        const readmeContent = readmeEntry.object?.text || '';
        const dom = new JSDOM(readmeContent);
        const text = dom.window.document.body.textContent || '';
        return calculateScore(text);
    } catch (err) {
        logMessage('ERROR', `Error fetching README for ${repoOwner}/${repoName}`);
        return DEFAULT_SCORE;
    }
}


// Main function to calculate the overall Ramp-Up Time Score
export async function calculateRampUpScore(owner: string, name: string): Promise<number> {
    const documentationScore = await getDocumentationScore(owner, name);
    return documentationScore;
}
