import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    name: string;
    isVerified: boolean;
    isAdmin: boolean;
    avatar?: string;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: false }, // Optional for SSO if added later
        name: { type: String, required: true },
        isVerified: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false },
        avatar: { type: String },
        resetPasswordToken: { type: String },
        resetPasswordExpire: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
