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

