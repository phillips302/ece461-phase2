import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"; //Should be working now Test14
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { uploadToS3, readFromS3 } from "../../src/tools/uploadToS3";
import { logMessage } from '../../src/tools/utils.js';

// Mock the entire module
vi.mock("@aws-sdk/client-s3", () => {
    const mockSend = vi.fn();
    return {
        S3Client: vi.fn().mockImplementation(() => ({
            send: mockSend
        })),
        PutObjectCommand: vi.fn(), // mock PutObjectCommand constructor
        GetObjectCommand: vi.fn(),
    };
});

vi.mock("../../src/tools/utils.js", () => ({
    logMessage: vi.fn(),
}));

describe("S3 Utility Functions", () => {
    const mockSend = vi.fn();
    const mockLogMessage = vi.mocked(logMessage);
    const bucketName = "ece461-phase2-bucket";

    beforeEach(() => {
        // Ensure that the mockSend function is reset before each test
        mockSend.mockClear();
        vi.mocked(PutObjectCommand).mockClear(); // Clear the PutObjectCommand mock state
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("uploadToS3", () => {
        const key = "test-key";
        const data = "test-data";

        it("should successfully upload data to S3", async () => {
            // Setup mock response for the send method
            mockSend.mockResolvedValueOnce({
                $metadata: { httpStatusCode: 200 }
            });

            // Call the function being tested
            const result = await uploadToS3(key, data);

            // Verify that PutObjectCommand was instantiated with the correct parameters
            expect(PutObjectCommand).toHaveBeenCalledWith({
                Bucket: bucketName,
                Key: key,
                Body: data,
            });

            // // Ensure the send method was called
            // expect(mockSend).toHaveBeenCalled();

            // Check that logMessage was called with the expected success message
            expect(mockLogMessage).toHaveBeenCalledWith("INFO", expect.stringMatching(/File uploaded successfully/));

            // Verify the return value of the uploadToS3 function
            expect(result).toBeNull();
        });
    });
});
