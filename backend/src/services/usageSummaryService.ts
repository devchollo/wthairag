import UsageSummary, { IUsageSummaryLastViewed } from '../models/UsageSummary';

const normalizeQuery = (query: string) => query.trim().toLowerCase();

const getDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const updateSummaryForQuery = async ({
    workspaceId,
    userId,
    tokens,
    inputTokens,
    outputTokens,
    query,
    citedDocuments
}: {
    workspaceId: string;
    userId: string | null;
    tokens: number;
    inputTokens: number;
    outputTokens: number;
    query: string;
    citedDocuments: string[];
}) => {
    const normalizedQuery = normalizeQuery(query);
    const now = new Date();
    const dateKey = getDateKey(now);

    const summary = await UsageSummary.findOneAndUpdate(
        { workspaceId, userId },
        {
            $setOnInsert: { workspaceId, userId },
            $inc: {
                totalTokens: tokens,
                totalQueries: 1,
                [`dailyTokens.${dateKey}`]: tokens
            },
            $set: {
                lastViewed: {
                    type: 'query',
                    title: query,
                    updatedAt: now
                }
            }
        },
        { upsert: true, new: true }
    );

    if (!summary) {
        return;
    }

    const existing = summary.topQueries.find(item => item.normalizedQuery === normalizedQuery);
    if (existing) {
        existing.count += 1;
        existing.lastUsed = now;
        existing.query = query;
        existing.citedDocuments = citedDocuments;
        existing.inputTokens = (existing.inputTokens || 0) + inputTokens;
        existing.outputTokens = (existing.outputTokens || 0) + outputTokens;
    } else {
        summary.topQueries.push({
            normalizedQuery,
            query,
            count: 1,
            lastUsed: now,
            inputTokens,
            outputTokens,
            citedDocuments
        });
    }

    summary.topQueries = summary.topQueries
        .sort((a, b) => {
            if (b.count !== a.count) {
                return b.count - a.count;
            }
            return (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0);
        })
        .slice(0, 25);

    await summary.save();
};

export const recordUsageSummaryForQuery = async ({
    workspaceId,
    userId,
    tokens,
    inputTokens,
    outputTokens,
    query,
    citedDocuments
}: {
    workspaceId: string;
    userId: string;
    tokens: number;
    inputTokens: number;
    outputTokens: number;
    query: string;
    citedDocuments: string[];
}) => {
    await Promise.all([
        updateSummaryForQuery({
            workspaceId,
            userId,
            tokens,
            inputTokens,
            outputTokens,
            query,
            citedDocuments
        }),
        updateSummaryForQuery({
            workspaceId,
            userId: null,
            tokens,
            inputTokens,
            outputTokens,
            query,
            citedDocuments
        })
    ]);
};

export const recordUsageSummaryForView = async ({
    workspaceId,
    userId,
    lastViewed
}: {
    workspaceId: string;
    userId: string;
    lastViewed: IUsageSummaryLastViewed;
}) => {
    await UsageSummary.findOneAndUpdate(
        { workspaceId, userId },
        {
            $setOnInsert: { workspaceId, userId },
            $set: { lastViewed }
        },
        { upsert: true, new: true }
    );
};
