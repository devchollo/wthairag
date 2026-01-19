import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
    workspaceId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'resolved';
    resolvedAt?: Date;
    resolvedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AlertSchema: Schema = new Schema(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
        status: { type: String, enum: ['open', 'resolved'], default: 'open' },
        resolvedAt: { type: Date },
        resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

AlertSchema.index({ workspaceId: 1 });

export default mongoose.model<IAlert>('Alert', AlertSchema);
