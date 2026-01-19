import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    endpoint: process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
    region: process.env.B2_REGION || 'us-east-005',
    credentials: {
        accessKeyId: process.env.B2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || '',
    },
});

export const uploadFile = async (bucket: string, key: string, body: Buffer, contentType: string) => {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
    });
    return s3Client.send(command);
};

export const deleteFile = async (bucket: string, key: string) => {
    const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    return s3Client.send(command);
};

export const getDownloadUrl = async (bucket: string, key: string) => {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
