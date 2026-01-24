import { Request, Response } from 'express';
import UsageLog from '../models/UsageLog';
import Document from '../models/Document';
import Alert from '../models/Alert';
import { sendSuccess, sendError } from '../utils/response';

const buildDailySeries = (
    raw: Array<{ _id: string; value: number }>,
    days: number
) => {
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const start = new Date(todayUtc);
    start.setUTCDate(todayUtc.getUTCDate() - (days - 1));

    const valuesByDate = new Map(raw.map(item => [item._id, item.value]));
    const labels: string[] = [];
    const values: number[] = [];

    for (let i = 0; i < days; i += 1) {
        const current = new Date(start);
        current.setUTCDate(start.getUTCDate() + i);
        const key = current.toISOString().slice(0, 10);
        labels.push(current.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }));
        values.push(valuesByDate.get(key) || 0);
    }

    return { labels, values };
};

const buildTopTopics = async (match: Record<string, unknown>) => {
    return UsageLog.aggregate([
        { $match: match },
        {
            $project: {
                normalizedQuery: { $toLower: { $trim: { input: "$query" } } },
                displayQuery: { $trim: { input: "$query" } },
                createdAt: 1,
                citedDocuments: 1
            }
        },
        { $match: { normalizedQuery: { $ne: "" } } },
        {
            $group: {
                _id: "$normalizedQuery",
                query: { $first: "$displayQuery" },
                count: { $sum: 1 },
                lastUsed: { $max: "$createdAt" },
                citedDocuments: { $first: "$citedDocuments" }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);
};

const stopWords = new Set([
    'a',
    'about',
    'after',
    'all',
    'am',
    'an',
    'and',
    'are',
    'as',
    'at',
    'be',
    'been',
    'but',
    'by',
    'can',
    'could',
    'do',
    'does',
    'for',
    'from',
    'get',
    'had',
    'has',
    'have',
    'how',
    'i',
    'if',
    'in',
    'is',
    'it',
    'like',
    'me',
    'my',
    'of',
    'on',
    'or',
    'our',
    'please',
    'the',
    'their',
    'to',
    'we',
    'what',
    'when',
    'where',
    'who',
    'why',
    'with',
    'you',
    'your'
]);

const toTitleCase = (value: string) =>
    value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

const deriveTopicFromQuery = (query: string, citedDocuments?: string[]) => {
    const citedTopic = citedDocuments?.find(Boolean);
    if (citedTopic) {
        return citedTopic;
    }

    const cleaned = query
        .replace(/[^\w\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

    if (!cleaned) {
        return query;
    }

    const keywords = cleaned
        .split(' ')
        .filter(word => !stopWords.has(word) && word.length > 2);

    if (!keywords.length) {
        return query.trim();
    }

    return toTitleCase(keywords.slice(0, 4).join(' '));
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findRecentItemByTitles = async (workspaceId: string, titles: string[]) => {
    if (!titles.length) {
        return null;
    }

    const [documents, alerts] = await Promise.all([
        Document.find({ workspaceId, title: { $in: titles } })
            .select('title updatedAt')
            .lean(),
        Alert.find({ workspaceId, title: { $in: titles } })
            .select('title updatedAt severity status')
            .lean()
    ]);

    const documentMap = new Map(documents.map(doc => [doc.title, doc]));
    const alertMap = new Map(alerts.map(alert => [alert.title, alert]));

    const matchedTitle = titles.find(title => documentMap.has(title) || alertMap.has(title));
    if (!matchedTitle) {
        return null;
    }

    const document = documentMap.get(matchedTitle);
    const alert = alertMap.get(matchedTitle);

    if (document) {
        return {
            type: 'knowledge',
            title: document.title,
            updatedAt: document.updatedAt,
            link: '/workspace/knowledge'
        };
    }

    if (alert) {
        return {
            type: 'alert',
            title: alert.title,
            updatedAt: alert.updatedAt,
            link: '/workspace/alerts',
            severity: alert.severity,
            status: alert.status
        };
    }

    return null;
};

export const getUserStats = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const workspaceId = req.workspace?._id;

        if (!userId || !workspaceId) {
            return sendError(res, 'User or Workspace context missing', 400);
        }

        // Total Tokens
        const totalTokens = await UsageLog.aggregate([
            { $match: { userId, workspaceId } },
            { $group: { _id: null, total: { $sum: "$tokens" } } }
        ]);

        // Most Queried Topics (using Cited Documents now)
        const topQueries = await buildTopTopics({ userId, workspaceId });

        // Chart Data (Daily Tokens for last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const chartDataRaw = await UsageLog.aggregate([
            { $match: { userId, workspaceId, createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    tokens: { $sum: "$tokens" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const usageSeries = buildDailySeries(
            chartDataRaw.map(item => ({ _id: item._id, value: item.tokens })),
            30
        );

        const recentUsage = await UsageLog.findOne({
            userId,
            workspaceId
        })
            .sort('-createdAt')
            .select('citedDocuments createdAt query')
            .lean();

        let recentItem = null;

        const citedTitles = recentUsage?.citedDocuments?.filter(Boolean) || [];
        recentItem = await findRecentItemByTitles(workspaceId.toString(), citedTitles);

        if (!recentItem && recentUsage?.query) {
            const queryTitle = recentUsage.query.trim();
            if (queryTitle) {
                const regex = new RegExp(`^${escapeRegExp(queryTitle)}$`, 'i');
                const [document, alert] = await Promise.all([
                    Document.findOne({ workspaceId, title: regex })
                        .select('title updatedAt')
                        .lean(),
                    Alert.findOne({ workspaceId, title: regex })
                        .select('title updatedAt severity status')
                        .lean()
                ]);

                if (document) {
                    recentItem = {
                        type: 'knowledge',
                        title: document.title,
                        updatedAt: document.updatedAt,
                        link: '/workspace/knowledge'
                    };
                } else if (alert) {
                    recentItem = {
                        type: 'alert',
                        title: alert.title,
                        updatedAt: alert.updatedAt,
                        link: '/workspace/alerts',
                        severity: alert.severity,
                        status: alert.status
                    };
                } else {
                    recentItem = {
                        type: 'query',
                        title: queryTitle,
                        updatedAt: recentUsage.createdAt
                    };
                }
            }
        }

        const [recentKnowledgeRaw, recentAlertsRaw, recentKnowledgeItems, recentAlertItems] = await Promise.all([
            Document.aggregate([
                { $match: { workspaceId, createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Alert.aggregate([
                { $match: { workspaceId, createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Document.find({ workspaceId })
                .sort('-createdAt')
                .limit(5)
                .select('title createdAt')
                .lean(),
            Alert.find({ workspaceId })
                .sort('-createdAt')
                .limit(5)
                .select('title createdAt severity status')
                .lean()
        ]);

        const knowledgeSeries = buildDailySeries(
            recentKnowledgeRaw.map(item => ({ _id: item._id, value: item.count })),
            30
        );
        const alertSeries = buildDailySeries(
            recentAlertsRaw.map(item => ({ _id: item._id, value: item.count })),
            30
        );

        return sendSuccess(res, {
            totalTokens: totalTokens[0]?.total || 0,
            topQueries: topQueries.map(q => ({
                query: q.query ?? q._id,
                topic: deriveTopicFromQuery(q.query ?? q._id, q.citedDocuments),
                count: q.count,
                lastUsed: q.lastUsed
            })),
            chartData: { labels: usageSeries.labels, tokens: usageSeries.values },
            recentItem,
            recentKnowledgeBase: { labels: knowledgeSeries.labels, counts: knowledgeSeries.values, items: recentKnowledgeItems },
            recentAlerts: { labels: alertSeries.labels, counts: alertSeries.values, items: recentAlertItems }
        }, 'User stats fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const getWorkspaceStats = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.workspace?._id;

        if (!workspaceId) {
            return sendError(res, 'Workspace context missing', 400);
        }

        // Total Tokens
        const totalTokens = await UsageLog.aggregate([
            { $match: { workspaceId } },
            { $group: { _id: null, total: { $sum: "$tokens" } } }
        ]);

        // Top Queries (using Cited Documents)
        const topQueries = await buildTopTopics({ workspaceId });

        // Usage by User (Top 5 Users)
        const topUsers = await UsageLog.aggregate([
            { $match: { workspaceId } },
            { $group: { _id: "$userId", totalTokens: { $sum: "$tokens" }, requestCount: { $sum: 1 } } },
            { $sort: { totalTokens: -1 } },
            { $limit: 10 },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $project: { _id: 1, totalTokens: 1, requestCount: 1, name: "$user.name", email: "$user.email" } }
        ]);

        // Chart Data (Daily Tokens for last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const chartDataRaw = await UsageLog.aggregate([
            { $match: { workspaceId, createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    tokens: { $sum: "$tokens" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const usageSeries = buildDailySeries(
            chartDataRaw.map(item => ({ _id: item._id, value: item.tokens })),
            30
        );

        const [recentKnowledgeRaw, recentAlertsRaw, recentKnowledgeItems, recentAlertItems] = await Promise.all([
            Document.aggregate([
                { $match: { workspaceId, createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Alert.aggregate([
                { $match: { workspaceId, createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Document.find({ workspaceId })
                .sort('-createdAt')
                .limit(5)
                .select('title createdAt')
                .lean(),
            Alert.find({ workspaceId })
                .sort('-createdAt')
                .limit(5)
                .select('title createdAt severity status')
                .lean()
        ]);

        const knowledgeSeries = buildDailySeries(
            recentKnowledgeRaw.map(item => ({ _id: item._id, value: item.count })),
            30
        );
        const alertSeries = buildDailySeries(
            recentAlertsRaw.map(item => ({ _id: item._id, value: item.count })),
            30
        );

        return sendSuccess(res, {
            totalTokens: totalTokens[0]?.total || 0,
            topQueries: topQueries.map(q => ({
                query: q.query ?? q._id,
                topic: deriveTopicFromQuery(q.query ?? q._id, q.citedDocuments),
                count: q.count,
                lastUsed: q.lastUsed
            })),
            topUsers,
            chartData: { labels: usageSeries.labels, tokens: usageSeries.values },
            recentKnowledgeBase: { labels: knowledgeSeries.labels, counts: knowledgeSeries.values, items: recentKnowledgeItems },
            recentAlerts: { labels: alertSeries.labels, counts: alertSeries.values, items: recentAlertItems }
        }, 'Workspace stats fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};
