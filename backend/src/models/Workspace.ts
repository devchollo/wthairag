import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspace extends Document {
    name: string;
    slug: string;
    ownerId: mongoose.Types.ObjectId;
    logo?: string;
    config: {
        accentColor: string;
        theme: 'light' | 'dark' | 'system';
    };
    pendingDeletionAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const WorkspaceSchema: Schema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        logo: { type: String },
        config: {
            accentColor: { type: String, default: '#007AFF' },
            theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
        },
        pendingDeletionAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
