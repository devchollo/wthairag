import { Request, Response } from 'express';
import Document from '../models/Document';
import DocumentChunk from '../models/DocumentChunk';
import { sendSuccess, sendError } from '../utils/response';
import { uploadFile, deleteFile, getDownloadUrl } from '../services/s3Service';
import { AIService } from '../services/aiService';

const buildSummary = (text: string, maxLength: number) => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) return '';
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength).trim()}...`;
};

const validateFileSignature = (buffer: Buffer, mimetype: string): boolean => {
    if (!buffer || buffer.length < 4) return false;
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

export const downloadDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const doc = await Document.findOne({ _id: id, workspaceId: (req as any).workspace?._id });

        if (!doc) {
            return sendError(res, 'Document not found', 404);
        }

        if (!doc.fileKey) {
            return sendError(res, 'This is a manual record and cannot be downloaded as a file', 400);
        }

        const url = await getDownloadUrl(process.env.B2_BUCKET || 'worktoolshub', doc.fileKey);
        return sendSuccess(res, { url }, 'Download link generated');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const uploadDocument = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return sendError(res, 'No file uploaded', 400);
        }

        const file = req.file;

        // Validation: 10MB limit
        if (file.size > 10 * 1024 * 1024) {
            return sendError(res, 'File size exceeds 10MB limit', 400);
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
            return sendError(res, 'Unsupported file type. Please upload PDF, TXT, DOCX, or CSV.', 400);
        }

        // Security: Magic Number Check
        if (!validateFileSignature(file.buffer, file.mimetype)) {
            return sendError(res, 'File content does not match its extension. Possible spoofing detected.', 400);
        }

        let extractedText = '';
        try {
            if (file.mimetype === 'application/pdf') {
                const pdf = require('pdf-parse');
                const data = await pdf(file.buffer);
                extractedText = data.text;
            } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const mammoth = require('mammoth');
                const result = await mammoth.extractRawText({ buffer: file.buffer });
                extractedText = result.value;
            } else if (file.mimetype === 'text/plain' || file.mimetype === 'text/csv') {
                extractedText = file.buffer.toString('utf-8');
            } else {
                extractedText = 'Content extraction not supported for this file type yet.';
            }
        } catch (err) {
            console.error('Text extraction failed:', err);
            extractedText = 'Failed to extract text from file.';
        }

        const { title, metadata } = req.body;
        const metadataObj = typeof metadata === 'string' ? JSON.parse(metadata || '{}') : metadata;

        const doc = await Document.create({
            workspaceId: (req as any).workspace?._id,
            title: title || file.originalname,
            content: extractedText || 'No printable content found.',
            summary: buildSummary(extractedText || 'No printable content found.', 600),
            mimeType: file.mimetype,
            fileKey: `workspaces/${(req as any).workspace?._id}/vault/${Date.now()}-${file.originalname}`,
            metadata: metadataObj,

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
                    const embedding = await AIService.generateEmbedding(chunkText);
                    await DocumentChunk.create({
                        workspaceId: (req as any).workspace?._id,
                        documentId: doc._id,
                        content: chunkText,
                        summary: buildSummary(chunkText, 240),
                        embedding: embedding,
                        chunkIndex: index,
                        metadata: doc.metadata
                    });
                } catch (e) {
                    console.error(`Failed to embed chunk ${index} for doc ${doc._id}`, e);
                }
            }));
        }

        // Upload to B2
        await uploadFile(
            process.env.B2_BUCKET || 'worktoolshub',
            doc.fileKey!,
            file.buffer,
            file.mimetype
        );

        return sendSuccess(res, doc, 'Document vaulted successfully', 201);
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const createManualDocument = async (req: Request, res: Response) => {
    try {
        const { title, content, metadata } = req.body;

        if (!title || !content) {
            return sendError(res, 'Title and content are required', 400);
        }

        const doc = await Document.create({
            workspaceId: (req as any).workspace?._id,
            title,
            content,
            summary: buildSummary(content, 600),
            mimeType: 'text/plain',
            metadata: metadata || {},

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
                    const embedding = await AIService.generateEmbedding(chunkText);
                    await DocumentChunk.create({
                        workspaceId: (req as any).workspace?._id,
                        documentId: doc._id,
                        content: chunkText,
                        summary: buildSummary(chunkText, 240),
                        embedding: embedding,
                        chunkIndex: index,
                        metadata: doc.metadata
                    });
                } catch (e) {
                    console.error(`Failed to embed chunk ${index} for doc ${doc._id}`, e);
                }
            }));
        }

        return sendSuccess(res, doc, 'Knowledge record created', 201);
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const listDocuments = async (req: Request, res: Response) => {
    try {
        const docs = await Document.find({ workspaceId: (req as any).workspace?._id }).sort('-createdAt');
        return sendSuccess(res, docs, 'Documents fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const doc = await Document.findOne({ _id: id, workspaceId: (req as any).workspace?._id });

        if (!doc) {
            return sendError(res, 'Document not found', 404);
        }

        if (doc.fileKey) {
            await deleteFile(process.env.B2_BUCKET || 'worktoolshub', doc.fileKey);
        }

        await doc.deleteOne();

        // Delete all associated chunks
        await DocumentChunk.deleteMany({ documentId: doc._id });

        return sendSuccess(res, null, 'Document deleted');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};
