"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.listDocuments = exports.uploadDocument = void 0;
const Document_1 = __importDefault(require("../models/Document"));
const response_1 = require("../utils/response");
const s3Service_1 = require("../services/s3Service");
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return (0, response_1.sendError)(res, 'No file uploaded', 400);
        }
        const { title, metadata } = req.body;
        const file = req.file;
        // In a real app, you would chunk and embed here
        // For now, storing as a document
        const metadataObj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
        // Handle auto-deletion if requested
        let expiresAt;
        if (metadataObj?.autoDelete === true || metadataObj?.expiresIn === '30m') {
            expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }
        const doc = await Document_1.default.create({
            workspaceId: req.workspace?._id,
            title: title || file.originalname,
            content: 'File content placeholder. In production, this would be the extracted text.',
            mimeType: file.mimetype,
            fileKey: `workspaces/${req.workspace?._id}/${Date.now()}-${file.originalname}`,
            metadata: metadataObj,
            expiresAt
        });
        // Upload to B2
        await (0, s3Service_1.uploadFile)(process.env.B2_BUCKET || 'worktoolshub', doc.fileKey, file.buffer, file.mimetype);
        return (0, response_1.sendSuccess)(res, doc, 'Document uploaded successfully', 201);
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.uploadDocument = uploadDocument;
const listDocuments = async (req, res) => {
    try {
        const docs = await Document_1.default.find({ workspaceId: req.workspace?._id }).sort('-createdAt');
        return (0, response_1.sendSuccess)(res, docs, 'Documents fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.listDocuments = listDocuments;
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Document_1.default.findOne({ _id: id, workspaceId: req.workspace?._id });
        if (!doc) {
            return (0, response_1.sendError)(res, 'Document not found', 404);
        }
        if (doc.fileKey) {
            await (0, s3Service_1.deleteFile)(process.env.B2_BUCKET || 'worktoolshub', doc.fileKey);
        }
        await doc.deleteOne();
        return (0, response_1.sendSuccess)(res, null, 'Document deleted');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.deleteDocument = deleteDocument;
