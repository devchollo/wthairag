import mongoose, { Schema, Document } from 'mongoose';

export interface IResponseCache extends Document {
    workspaceId: mongoose.Types.ObjectId;
    queryHash: string;
    contextHash: string;
    answer: string;
    citations: Array<{ documentId: string; snippet: string; link?: string; title?: string }>;
    tokensUsed: number;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ResponseCacheSchema: Schema = new Schema(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        queryHash: { type: String, required: true },
        contextHash: { type: String, required: true },
        answer: { type: String, required: true },
        citations: [
            {
                documentId: { type: String, required: true },
                snippet: { type: String, required: true },
                link: { type: String },
                title: { type: String },
            }
        ],
        tokensUsed: { type: Number, default: 0 },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

ResponseCacheSchema.index({ workspaceId: 1, queryHash: 1, contextHash: 1 }, { unique: true });
ResponseCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IResponseCache>('ResponseCache', ResponseCacheSchema);
