import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import AWSMock from 'aws-sdk-mock';
import { generatePresignedUrl } from '../../src/tools/userDownload.js';


describe('generatePresignedUrl', () => {
    const mockBucketName = 'mock-bucket';
    const mockKey = 'packages/test-package.tar.gz';
    const baseUrl = `https://${mockBucketName}.s3.amazonaws.com/${mockKey}`;
    const mockExpires = 600; // 10 minutes in seconds

    beforeAll(() => {
        // Mock S3 getSignedUrlPromise method with AWS SDK Mock
        AWSMock.mock('S3', 'getSignedUrlPromise', (operation, params, callback) => {
            if (params.Bucket !== mockBucketName || params.Key !== mockKey) {
                return callback(new Error('Invalid bucket or key'));
            }
            // Generate a mock URL with dynamic parameters for testing
            const mockUrl = `${baseUrl}?AWSAccessKeyId=TESTACCESSKEY&Expires=${Date.now() / 1000 + mockExpires}&Signature=MOCKSIGNATURE`;
            callback(null, mockUrl);
        });
    });

    afterAll(() => {
        // Restore AWS SDK methods
        AWSMock.restore('S3');
    });

    it('should generate a valid presigned URL for a given bucket and key', async () => {
        const url = await generatePresignedUrl(mockKey);
        // Ensure URL structure matches expected format, ignoring parameters
        expect(url.startsWith(baseUrl)).toBe(true);
        expect(url).toContain('Expires='); // Ensure Expiration param is present
        expect(url).toContain('Signature='); // Ensure Signature param is present
    });

    it('should throw an error if an invalid bucket or key is provided', async () => {
        // Attempt to generate a presigned URL with an invalid key
        await expect(generatePresignedUrl('invalid-key')).rejects.toThrow('Could not generate presigned URL');
    });

    it('should throw an error if S3 returns an error', async () => {
        // Remock S3 to simulate an error response
        AWSMock.remock('S3', 'getSignedUrlPromise', (operation, params, callback) => {
            callback(new Error('S3 error'));
        });
        // Expect the promise to reject with the error message
        await expect(generatePresignedUrl(mockKey)).rejects.toThrow('Could not generate presigned URL');
    });

    it('should handle missing credentials gracefully', async () => {
        // Simulate missing credentials
        delete process.env.AWS_ACCESS_KEY_ID;
        delete process.env.AWS_SECRET_ACCESS_KEY;
        
        // Expect an error when trying to generate the URL without credentials
        await expect(generatePresignedUrl(mockKey)).rejects.toThrow('Credentials error');
    });
});
