import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    citations?: Array<{
        documentId: string;
        snippet: string;
    }>;
    createdAt: Date;
}

export interface IChat extends Document {
    workspaceId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    messages: IMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    citations: [
        {
            documentId: { type: String },
            snippet: { type: String },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

const ChatSchema: Schema = new Schema(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, default: 'New Chat' },
        messages: [MessageSchema],
    },
    { timestamps: true }
);

ChatSchema.index({ workspaceId: 1, userId: 1 });

export default mongoose.model<IChat>('Chat', ChatSchema);
