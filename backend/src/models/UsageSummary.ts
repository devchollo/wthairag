import mongoose, { Schema, Document } from 'mongoose';

export interface IUsageSummaryQuery {
    normalizedQuery: string;
    query: string;
    count: number;
    lastUsed: Date;
    citedDocuments?: string[];
}

export interface IUsageSummaryLastViewed {
    type: 'knowledge' | 'alert' | 'query';
    title: string;
    updatedAt?: Date;
    link?: string;
    severity?: string;
    status?: string;
}

export interface IUsageSummary extends Document {
    workspaceId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId | null;
    totalTokens: number;
    totalQueries: number;
    dailyTokens: Map<string, number>;
    topQueries: IUsageSummaryQuery[];
    lastViewed?: IUsageSummaryLastViewed;
}

const UsageSummaryQuerySchema = new Schema<IUsageSummaryQuery>(
    {
        normalizedQuery: { type: String, required: true },
        query: { type: String, required: true },
        count: { type: Number, default: 0 },
        lastUsed: { type: Date, default: Date.now },
        citedDocuments: [{ type: String }]
    },
    { _id: false }
);

const UsageSummaryLastViewedSchema = new Schema<IUsageSummaryLastViewed>(
    {
        type: { type: String, enum: ['knowledge', 'alert', 'query'], required: true },
        title: { type: String, required: true },
        updatedAt: { type: Date },
        link: { type: String },
        severity: { type: String },
        status: { type: String }
    },
    { _id: false }
);

const UsageSummarySchema: Schema = new Schema(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        totalTokens: { type: Number, default: 0 },
        totalQueries: { type: Number, default: 0 },
        dailyTokens: { type: Map, of: Number, default: {} },
        topQueries: { type: [UsageSummaryQuerySchema], default: [] },
        lastViewed: { type: UsageSummaryLastViewedSchema, default: null }
    },
    { timestamps: true }
);

UsageSummarySchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IUsageSummary>('UsageSummary', UsageSummarySchema);
