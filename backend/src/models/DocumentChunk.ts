
import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentChunk extends Document {
    workspaceId: mongoose.Types.ObjectId;
    documentId: mongoose.Types.ObjectId;
    content: string;
    embedding: number[];
    chunkIndex: number;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const DocumentChunkSchema: Schema = new Schema(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
        content: { type: String, required: true },
        embedding: [{ type: Number, required: true }],
        chunkIndex: { type: Number, required: true },
        metadata: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

// Indexes for regular querying
DocumentChunkSchema.index({ workspaceId: 1 });
DocumentChunkSchema.index({ documentId: 1 });

export default mongoose.model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);
