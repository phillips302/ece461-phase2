import AWS from "aws-sdk";
import { logMessage } from "../tools/utils.js";

const s3 = new AWS.S3();
const bucketName = "ece461-phase2-bucket";

export async function uploadToS3(key: string, data: any): Promise<string | null> {
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: data,
    };
    try {
        const response = await s3.upload(params).promise();
        logMessage("INFO", `File uploaded successfully at ${response.Location}`);
        return response.Location;
    } catch (error) {
        logMessage("DEBUG", `Error uploading data to S3: ${error}`);
        return null;
    }
}

export async function readFromS3(key: string): Promise<string | undefined> {
    var params = {
        Bucket: bucketName,
        Key: key
    };
    try {
        const response = await s3.getObject(params).promise();
        logMessage("INFO", `File @ ${key} found in s3.`);
        return response.Body?.toString();
    } catch (error) {
        logMessage("DEBUG", "Reading data from s3 failed.");
        return undefined;
    }
}