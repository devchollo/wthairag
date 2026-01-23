import mongoose, { Schema, Document } from 'mongoose';

export interface IUsageLog extends Document {
    workspaceId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    tokens: number;
    query: string;
    citedDocuments: string[];
    aiModel: string;
    createdAt: Date;
}

const UsageLogSchema: Schema = new Schema(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        tokens: { type: Number, required: true },
        query: { type: String, required: true },
        citedDocuments: [{ type: String }], // Document Titles
        aiModel: { type: String, default: 'gpt-4o-mini' },
    },
    { timestamps: true }
);

UsageLogSchema.index({ workspaceId: 1, createdAt: -1 });
UsageLogSchema.index({ userId: 1, createdAt: -1 });
UsageLogSchema.index({ citedDocuments: 1 });

export default mongoose.model<IUsageLog>('UsageLog', UsageLogSchema);
