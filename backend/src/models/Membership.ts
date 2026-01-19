import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface IMembership extends Document {
    userId: mongoose.Types.ObjectId;
    workspaceId: mongoose.Types.ObjectId;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

const MembershipSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], required: true },
    },
    { timestamps: true }
);

// Ensure a user can only have one membership per workspace
MembershipSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });

export default mongoose.model<IMembership>('Membership', MembershipSchema);
