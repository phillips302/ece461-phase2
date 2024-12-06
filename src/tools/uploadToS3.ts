import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"; // ES Modules
import { logMessage } from "../tools/utils.js";
import { Readable } from "stream";

const region = 'us-east-2';
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
    const params = {
        Bucket: bucketName,
        Key: key
    };
    const command = new GetObjectCommand(params);
    try {
        const data = await s3.send(command);
        logMessage("INFO", `File @ ${key} found in s3.`);
        if (data.Body) {
            const bodyString = await streamToString(data.Body as Readable);
            return bodyString;
        } else {
            console.log('No content found in S3 object');
            return undefined;
        }
    } catch (error) {
        logMessage("DEBUG", "Reading data from s3 failed.");
        return undefined;
    }
}

async function streamToString(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
}

export async function deleteFromS3(key: string): Promise<string | null> {
    const params = {
        Bucket: bucketName,
        Key: key,
    };
    const command = new DeleteObjectCommand(params);
    try {
        const response = await s3.send(command);
        logMessage("INFO", `File deleted successfully: ${key}`);
        return response.toString();
    } catch (error) {
        logMessage("DEBUG", `Error deleting data from S3: ${error}`);
        return null;
    }
}
