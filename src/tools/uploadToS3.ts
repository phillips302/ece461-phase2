import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"; // ES Modules
import { logMessage } from "../tools/utils.js";

const region = process.env.AWS_REGION;
const s3 = new S3Client({ region: region });
const bucketName = "ece461-phase2-bucket";

export async function uploadToS3(key: string, data: any): Promise<string | null> {
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: data,
    };
    const command = new PutObjectCommand(params);
    try {
        const response = await s3.send(command);
        logMessage("INFO", `File uploaded successfully: ${response}`);
        return response.toString();
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
    const command = new GetObjectCommand(params);
    try {
        const response = await s3.send(command);
        logMessage("INFO", `File @ ${key} found in s3.`);
        return response.toString();
    } catch (error) {
        logMessage("DEBUG", "Reading data from s3 failed.");
        return undefined;
    }
}