"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadUrl = exports.getDownloadUrl = exports.deleteFile = exports.uploadFile = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3Client = new client_s3_1.S3Client({
    endpoint: process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
    region: process.env.B2_REGION || 'us-east-005',
    credentials: {
        accessKeyId: process.env.B2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || '',
    },
});
const uploadFile = async (bucket, key, body, contentType) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
    });
    return s3Client.send(command);
};
exports.uploadFile = uploadFile;
const deleteFile = async (bucket, key) => {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    return s3Client.send(command);
};
exports.deleteFile = deleteFile;
const getDownloadUrl = async (bucket, key) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    return (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
};
exports.getDownloadUrl = getDownloadUrl;
const getUploadUrl = async (bucket, key, contentType) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
    });
    return (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
};
exports.getUploadUrl = getUploadUrl;
