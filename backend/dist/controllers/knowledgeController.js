"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordKnowledgeView = exports.deleteDocument = exports.updateManualDocument = exports.listDocuments = exports.createManualDocument = exports.uploadDocument = exports.downloadDocument = void 0;
const Document_1 = __importDefault(require("../models/Document"));
const DocumentChunk_1 = __importDefault(require("../models/DocumentChunk"));
const UsageLog_1 = __importDefault(require("../models/UsageLog"));
const response_1 = require("../utils/response");
const s3Service_1 = require("../services/s3Service");
const aiService_1 = require("../services/aiService");
const usageSummaryService_1 = require("../services/usageSummaryService");
const buildSummary = (text, maxLength) => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized)
        return '';
    if (normalized.length <= maxLength)
        return normalized;
    return `${normalized.slice(0, maxLength).trim()}...`;
};
const validateFileSignature = (buffer, mimetype) => {
    if (!buffer || buffer.length < 4)
        return false;
    const signature = buffer.slice(0, 4).toString('hex').toUpperCase();
    // PDF: %PDF- -> 25504446
    if (mimetype === 'application/pdf') {
        return signature.startsWith('25504446');
    }
    // DOCX/MS Word (ZIP-based): PK.. -> 504B0304
    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword') {
        return signature.startsWith('504B');
    }
    // TXT/CSV: Pure text check
    if (mimetype === 'text/plain' || mimetype === 'text/csv') {
        const sample = buffer.slice(0, 1024).toString();
        // Check for common non-printable binary characters
        return !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(sample);
    }
    return true;
};
const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Document_1.default.findOne({ _id: id, workspaceId: req.workspace?._id });
        if (!doc) {
            return (0, response_1.sendError)(res, 'Document not found', 404);
        }
        if (!doc.fileKey) {
            return (0, response_1.sendError)(res, 'This is a manual record and cannot be downloaded as a file', 400);
        }
        const url = await (0, s3Service_1.getDownloadUrl)(process.env.B2_BUCKET || 'worktoolshub', doc.fileKey);
        return (0, response_1.sendSuccess)(res, { url }, 'Download link generated');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.downloadDocument = downloadDocument;
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return (0, response_1.sendError)(res, 'No file uploaded', 400);
        }
        const file = req.file;
        // Validation: 10MB limit
        if (file.size > 10 * 1024 * 1024) {
            return (0, response_1.sendError)(res, 'File size exceeds 10MB limit', 400);
        }
        // Validation: Types
        const allowedTypes = [
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/csv'
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            return (0, response_1.sendError)(res, 'Unsupported file type. Please upload PDF, TXT, DOCX, or CSV.', 400);
        }
        // Security: Magic Number Check
        if (!validateFileSignature(file.buffer, file.mimetype)) {
            return (0, response_1.sendError)(res, 'File content does not match its extension. Possible spoofing detected.', 400);
        }
        let extractedText = '';
        try {
            if (file.mimetype === 'application/pdf') {
                const pdf = require('pdf-parse');
                const data = await pdf(file.buffer);
                extractedText = data.text;
            }
            else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const mammoth = require('mammoth');
                const result = await mammoth.extractRawText({ buffer: file.buffer });
                extractedText = result.value;
            }
            else if (file.mimetype === 'text/plain' || file.mimetype === 'text/csv') {
                extractedText = file.buffer.toString('utf-8');
            }
            else {
                extractedText = 'Content extraction not supported for this file type yet.';
            }
        }
        catch (err) {
            console.error('Text extraction failed:', err);
            extractedText = 'Failed to extract text from file.';
        }
        const { title, metadata } = req.body;
        const metadataObj = typeof metadata === 'string' ? JSON.parse(metadata || '{}') : metadata;
        const doc = await Document_1.default.create({
            workspaceId: req.workspace?._id,
            title: title || file.originalname,
            content: extractedText || 'No printable content found.',
            summary: buildSummary(extractedText || 'No printable content found.', 600),
            mimeType: file.mimetype,
            fileKey: `workspaces/${req.workspace?._id}/vault/${Date.now()}-${file.originalname}`,
            metadata: metadataObj,
            createdBy: req.user?._id,
            updatedBy: req.user?._id,
        });
        // CHUNKING & EMBEDDING
        // Simple chunking strategy: Split by ~1000 characters with overlap
        const chunkSize = 1000;
        const overlap = 200;
        const textToChunk = extractedText.length > 0 ? extractedText : 'No content';
        // Only embed if we have meaningful content
        if (textToChunk.length > 50) {
            const chunks = [];
            for (let i = 0; i < textToChunk.length; i += (chunkSize - overlap)) {
                chunks.push(textToChunk.substring(i, i + chunkSize));
            }
            // Process chunks in parallel (limit concurrency if needed, but for single file strictly okay)
            await Promise.all(chunks.map(async (chunkText, index) => {
                try {
                    const embedding = await aiService_1.AIService.generateEmbedding(chunkText);
                    await DocumentChunk_1.default.create({
                        workspaceId: req.workspace?._id,
                        documentId: doc._id,
                        content: chunkText,
                        summary: buildSummary(chunkText, 240),
                        embedding: embedding,
                        chunkIndex: index,
                        metadata: doc.metadata
                    });
                }
                catch (e) {
                    console.error(`Failed to embed chunk ${index} for doc ${doc._id}`, e);
                }
            }));
        }
        // Upload to B2
        await (0, s3Service_1.uploadFile)(process.env.B2_BUCKET || 'worktoolshub', doc.fileKey, file.buffer, file.mimetype);
        return (0, response_1.sendSuccess)(res, doc, 'Document vaulted successfully', 201);
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.uploadDocument = uploadDocument;
const createManualDocument = async (req, res) => {
    try {
        const { title, content, metadata } = req.body;
        if (!title || !content) {
            return (0, response_1.sendError)(res, 'Title and content are required', 400);
        }
        const doc = await Document_1.default.create({
            workspaceId: req.workspace?._id,
            title,
            content,
            summary: buildSummary(content, 600),
            mimeType: 'text/plain',
            metadata: metadata || {},
            createdBy: req.user?._id,
            updatedBy: req.user?._id,
        });
        // CHUNKING & EMBEDDING
        const chunkSize = 1000;
        const overlap = 200;
        if (content.length > 0) {
            const chunks = [];
            for (let i = 0; i < content.length; i += (chunkSize - overlap)) {
                chunks.push(content.substring(i, i + chunkSize));
            }
            await Promise.all(chunks.map(async (chunkText, index) => {
                try {
                    const embedding = await aiService_1.AIService.generateEmbedding(chunkText);
                    await DocumentChunk_1.default.create({
                        workspaceId: req.workspace?._id,
                        documentId: doc._id,
                        content: chunkText,
                        summary: buildSummary(chunkText, 240),
                        embedding: embedding,
                        chunkIndex: index,
                        metadata: doc.metadata
                    });
                }
                catch (e) {
                    console.error(`Failed to embed chunk ${index} for doc ${doc._id}`, e);
                }
            }));
        }
        return (0, response_1.sendSuccess)(res, doc, 'Knowledge record created', 201);
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.createManualDocument = createManualDocument;
const listDocuments = async (req, res) => {
    try {
        const docs = await Document_1.default.find({ workspaceId: req.workspace?._id })
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort('-createdAt');
        return (0, response_1.sendSuccess)(res, docs, 'Documents fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.listDocuments = listDocuments;
const updateManualDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        if (!title || !content) {
            return (0, response_1.sendError)(res, 'Title and content are required', 400);
        }
        const doc = await Document_1.default.findOne({ _id: id, workspaceId: req.workspace?._id });
        if (!doc) {
            return (0, response_1.sendError)(res, 'Document not found', 404);
        }
        if (doc.fileKey) {
            return (0, response_1.sendError)(res, 'Only manual records can be edited', 400);
        }
        doc.title = title;
        doc.content = content;
        doc.summary = buildSummary(content, 600);
        doc.updatedBy = req.user?._id;
        await doc.save();
        await DocumentChunk_1.default.deleteMany({ documentId: doc._id });
        const chunkSize = 1000;
        const overlap = 200;
        if (content.length > 0) {
            const chunks = [];
            for (let i = 0; i < content.length; i += (chunkSize - overlap)) {
                chunks.push(content.substring(i, i + chunkSize));
            }
            await Promise.all(chunks.map(async (chunkText, index) => {
                try {
                    const embedding = await aiService_1.AIService.generateEmbedding(chunkText);
                    await DocumentChunk_1.default.create({
                        workspaceId: req.workspace?._id,
                        documentId: doc._id,
                        content: chunkText,
                        summary: buildSummary(chunkText, 240),
                        embedding: embedding,
                        chunkIndex: index,
                        metadata: doc.metadata
                    });
                }
                catch (e) {
                    console.error(`Failed to embed chunk ${index} for doc ${doc._id}`, e);
                }
            }));
        }
        return (0, response_1.sendSuccess)(res, doc, 'Knowledge record updated');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.updateManualDocument = updateManualDocument;
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
        // Delete all associated chunks
        await DocumentChunk_1.default.deleteMany({ documentId: doc._id });
        return (0, response_1.sendSuccess)(res, null, 'Document deleted');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.deleteDocument = deleteDocument;
const recordKnowledgeView = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Document_1.default.findOne({ _id: id, workspaceId: req.workspace?._id })
            .select('title updatedAt')
            .lean();
        if (!doc) {
            return (0, response_1.sendError)(res, 'Document not found', 404);
        }
        if (!req.user?._id) {
            return (0, response_1.sendError)(res, 'User context missing', 400);
        }
        await UsageLog_1.default.create({
            workspaceId: req.workspace?._id,
            userId: req.user?._id,
            tokens: 0,
            inputTokens: 0,
            outputTokens: 0,
            query: doc.title,
            citedDocuments: [doc.title],
            eventType: 'view'
        });
        await (0, usageSummaryService_1.recordUsageSummaryForView)({
            workspaceId: req.workspace?._id.toString(),
            userId: req.user?._id.toString(),
            lastViewed: {
                type: 'knowledge',
                title: doc.title,
                updatedAt: doc.updatedAt,
                link: '/workspace/knowledge'
            }
        });
        return (0, response_1.sendSuccess)(res, null, 'Knowledge view recorded');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.recordKnowledgeView = recordKnowledgeView;
