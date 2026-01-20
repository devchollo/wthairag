import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
    email: string;
    workspaceId: mongoose.Types.ObjectId;
    role: 'admin' | 'member' | 'viewer';
    token: string;
    invitedBy: mongoose.Types.ObjectId;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const InvitationSchema: Schema = new Schema(
    {
        email: { type: String, required: true, lowercase: true, trim: true },
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
        token: { type: String, required: true, unique: true },
        invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

// Expire record after expiresAt
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
InvitationSchema.index({ workspaceId: 1, email: 1 }, { unique: true });

export default mongoose.model<IInvitation>('Invitation', InvitationSchema);
