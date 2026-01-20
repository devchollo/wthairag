import mongoose, { Schema, Document } from 'mongoose';

export interface IVerification extends Document {
    email: string;
    code: string;
    expiresAt: Date;
    createdAt: Date;
}

const VerificationSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        code: { type: String, required: true },
        expiresAt: { type: Date, required: true, expires: 0 }, // TTL index auto-deletes after expiry
    },
    { timestamps: true }
);

export default mongoose.model<IVerification>('Verification', VerificationSchema);
