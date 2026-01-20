import { Request, Response } from 'express';
import Document from '../models/Document';
import { sendSuccess, sendError } from '../utils/response';
import { uploadFile, deleteFile } from '../services/s3Service';

export const uploadDocument = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return sendError(res, 'No file uploaded', 400);
        }

        const { title, metadata } = req.body;
        const file = req.file;

        // In a real app, you would chunk and embed here
        // For now, storing as a document
        const metadataObj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

        // Handle auto-deletion if requested
        let expiresAt: Date | undefined;
        if (metadataObj?.autoDelete === true || metadataObj?.expiresIn === '30m') {
            expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }

        const doc = await Document.create({
            workspaceId: req.workspace?._id,
            title: title || file.originalname,
            content: 'File content placeholder. In production, this would be the extracted text.',
            mimeType: file.mimetype,
            fileKey: `workspaces/${req.workspace?._id}/${Date.now()}-${file.originalname}`,
            metadata: metadataObj,
            expiresAt
        });

        // Upload to B2
        await uploadFile(
            process.env.B2_BUCKET || 'worktoolshub',
            doc.fileKey!,
            file.buffer,
            file.mimetype
        );

        return sendSuccess(res, doc, 'Document uploaded successfully', 201);
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const listDocuments = async (req: Request, res: Response) => {
    try {
        const docs = await Document.find({ workspaceId: req.workspace?._id }).sort('-createdAt');
        return sendSuccess(res, docs, 'Documents fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const doc = await Document.findOne({ _id: id, workspaceId: req.workspace?._id });

        if (!doc) {
            return sendError(res, 'Document not found', 404);
        }

        if (doc.fileKey) {
            await deleteFile(process.env.B2_BUCKET || 'worktoolshub', doc.fileKey);
        }

        await doc.deleteOne();

        return sendSuccess(res, null, 'Document deleted');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};
