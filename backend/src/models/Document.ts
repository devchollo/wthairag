import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
    workspaceId: mongoose.Types.ObjectId;
    title: string;
    content: string; // The full text or chunked text
    summary?: string;
    sourceUrl?: string;
    fileKey?: string; // Backblaze B2 key
    mimeType?: string;
    metadata: Record<string, any>;
    embeddingId?: string; // Reference to vector DB if needed
    expiresAt?: Date; // For temporary files
    createdAt: Date;
    updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        summary: { type: String },
        sourceUrl: { type: String },
        fileKey: { type: String },
        mimeType: { type: String },
        metadata: { type: Schema.Types.Mixed, default: {} },
        embeddingId: { type: String },
        expiresAt: { type: Date },
    },
    { timestamps: true }
);

DocumentSchema.index({ workspaceId: 1 });

export default mongoose.model<IDocument>('Document', DocumentSchema);
