/*Questions to ask and notes
1. For now do we want to be able to call from the command line? Answer: Put it in down the line for my own testing
4. Users should be able to download the most up to date package or should they be able to choose the version of the package they want? Answer: Most up to date
5. Will have to factor in how to undebloat in this or if we want to give them the debloated package
6. Must run this command "npm install aws-sdk" Added to the run file under install
*/ 
// //Generate a presigned URL containing package we want to be downloaded by the user
import * as AWS from 'aws-sdk';
//**************************************************Key is path to specific package stored in S3 bucket******************************************** */

// Initialize the S3 client
const s3 = new AWS.S3({
    region: 'us-east-1', // Ensure this is the correct region
    accessKeyId: 'ASIAZVMTU6YJFPLF2GSM',
    secretAccessKey: 'Zc+biIeGVIGEfeC/8gQ4ZY7SmB/R+zPfzqd+LzCF',
});
const bucketName = "ece461-phase2-bucket";
/**
 * Generate a presigned URL for downloading the latest package from S3
 * @param key - The key (path) to the package in the S3 bucket
 * @returns The presigned URL for downloading the package
 */
export const generatePresignedUrl = async (key: string): Promise<string> => {
    const params = {
        Bucket: bucketName,
        Key: key,
        Expires: 60 * 10 // URL expires in 10 minutes
    };

    try {
        // Generate presigned URL
        const url = await s3.getSignedUrlPromise('getObject', params);
        return url;
    } catch (error: any) {
        console.error('Error generating presigned URL', error);
        throw new Error(`Could not generate presigned URL: ${error.message || error}`);
    }
};



// //Lists out the package and user will choose from that: import * as AWS from 'aws-sdk';

// const s3 = new AWS.S3({
//     region: 'us-east-1',
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// const bucketName = "ece461-phase2-bucket";

// /**
//  * List all available packages in the S3 bucket.
//  * @returns A list of package keys (paths) in the S3 bucket
//  */
// export const listPackages = async (): Promise<string[]> => {
//     try {
//         const response = await s3.listObjectsV2({ Bucket: bucketName }).promise();
//         if (!response.Contents) throw new Error('No packages found in the bucket.');

//         // Extract and return keys (paths) of packages
//         return response.Contents.map(item => item.Key!).filter(key => !!key);
//     } catch (error) {
//         console.error('Error listing packages:', error);
//         throw new Error(`Could not list packages: ${error.message || error}`);
//     }
// };

// /**
//  * Generate a presigned URL for downloading a specified package from S3
//  * @param key - The key (path) to the package in the S3 bucket
//  * @returns The presigned URL for downloading the package
//  */
// export const generatePresignedUrl = async (key: string): Promise<string> => {
//     const params = {
//         Bucket: bucketName,
//         Key: key,
//         Expires: 60 * 10 // URL expires in 10 minutes
//     };

//     try {
//         const url = await s3.getSignedUrlPromise('getObject', params);
//         return url;
//     } catch (error) {
//         console.error('Error generating presigned URL:', error);
//         throw new Error(`Could not generate presigned URL: ${error.message || error}`);
//     }
// };
