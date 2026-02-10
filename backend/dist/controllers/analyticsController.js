"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceStats = exports.getUserStats = void 0;
const UsageLog_1 = __importDefault(require("../models/UsageLog"));
const Document_1 = __importDefault(require("../models/Document"));
const Alert_1 = __importDefault(require("../models/Alert"));
const User_1 = __importDefault(require("../models/User"));
const UsageSummary_1 = __importDefault(require("../models/UsageSummary"));
const response_1 = require("../utils/response");
const buildDailySeries = (raw, days) => {
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const start = new Date(todayUtc);
    start.setUTCDate(todayUtc.getUTCDate() - (days - 1));
    const valuesByDate = new Map(raw.map(item => [item._id, item.value]));
    const labels = [];
    const values = [];
    for (let i = 0; i < days; i += 1) {
        const current = new Date(start);
        current.setUTCDate(start.getUTCDate() + i);
        const key = current.toISOString().slice(0, 10);
        labels.push(current.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }));
        values.push(valuesByDate.get(key) || 0);
    }
    return { labels, values };
};
const buildTopTopics = async (match, limit = 20) => {
    return UsageLog_1.default.aggregate([
        { $match: match },
        {
            $project: {
                normalizedQuery: { $toLower: { $trim: { input: "$query" } } },
                displayQuery: { $trim: { input: "$query" } },
                createdAt: 1,
                citedDocuments: 1,
                inputTokens: { $ifNull: ["$inputTokens", 0] },
                outputTokens: { $ifNull: ["$outputTokens", 0] }
            }
        },
        { $match: { normalizedQuery: { $ne: "" } } },
        {
            $group: {
                _id: "$normalizedQuery",
                query: { $first: "$displayQuery" },
                count: { $sum: 1 },
                lastUsed: { $max: "$createdAt" },
                citedDocuments: { $first: "$citedDocuments" },
                inputTokens: { $sum: "$inputTokens" },
                outputTokens: { $sum: "$outputTokens" }
            }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
    ]);
};
const toDailyEntries = (dailyTokens) => {
    if (!dailyTokens) {
        return [];
    }
    if (dailyTokens instanceof Map) {
        return Array.from(dailyTokens.entries()).map(([key, value]) => ({ _id: key, value }));
    }
    return Object.entries(dailyTokens).map(([key, value]) => ({
        _id: key,
        value: typeof value === 'number' ? value : Number(value) || 0
    }));
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
const toTitleCase = (value) => value
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
const deriveTopicFromQuery = (query, citedDocuments) => {
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
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const findRecentItemByTitles = async (workspaceId, titles) => {
    if (!titles.length) {
        return null;
    }
    const [documents, alerts] = await Promise.all([
        Document_1.default.find({ workspaceId, title: { $in: titles } })
            .select('title updatedAt')
            .lean(),
        Alert_1.default.find({ workspaceId, title: { $in: titles } })
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
const buildRecentViewedItems = async (workspaceId, titles, viewedAtByTitle) => {
    if (!titles.length) {
        return [];
    }
    const [documents, alerts] = await Promise.all([
        Document_1.default.find({ workspaceId, title: { $in: titles } })
            .select('title updatedAt')
            .lean(),
        Alert_1.default.find({ workspaceId, title: { $in: titles } })
            .select('title updatedAt severity status')
            .lean()
    ]);
    const documentMap = new Map(documents.map(doc => [doc.title, doc]));
    const alertMap = new Map(alerts.map(alert => [alert.title, alert]));
    return titles.map(title => {
        const viewedAt = viewedAtByTitle.get(title);
        const document = documentMap.get(title);
        const alert = alertMap.get(title);
        if (document) {
            return {
                type: 'knowledge',
                title: document.title,
                updatedAt: document.updatedAt,
                link: '/workspace/knowledge',
                viewedAt
            };
        }
        if (alert) {
            return {
                type: 'alert',
                title: alert.title,
                updatedAt: alert.updatedAt,
                link: '/workspace/alerts',
                severity: alert.severity,
                status: alert.status,
                viewedAt
            };
        }
        return {
            type: 'query',
            title,
            updatedAt: viewedAt,
            viewedAt
        };
    });
};
const getUserStats = async (req, res) => {
    try {
        const userId = req.user?._id;
        const workspaceId = req.workspace?._id;
        if (!userId || !workspaceId) {
            return (0, response_1.sendError)(res, 'User or Workspace context missing', 400);
        }
        const usageSummary = await UsageSummary_1.default.findOne({ userId, workspaceId });
        // Total Tokens
        const totalTokens = usageSummary
            ? [{ total: usageSummary.totalTokens }]
            : await UsageLog_1.default.aggregate([
                { $match: { userId, workspaceId, eventType: 'query' } },
                { $group: { _id: null, total: { $sum: "$tokens" } } }
            ]);
        // Most Queried Topics (using Cited Documents now)
        const topQueries = usageSummary
            ? usageSummary.topQueries.slice(0, 20)
            : await buildTopTopics({ userId, workspaceId, eventType: 'query' }, 20);
        // Chart Data (Daily Tokens for last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const chartDataRaw = usageSummary
            ? toDailyEntries(usageSummary.dailyTokens)
            : await UsageLog_1.default.aggregate([
                { $match: { userId, workspaceId, eventType: 'query', createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        tokens: { $sum: "$tokens" }
                    }
                },
                { $sort: { _id: 1 } }
            ]).then(raw => raw.map(item => ({ _id: item._id, value: item.tokens })));
        const usageSeries = buildDailySeries(chartDataRaw, 30);
        const recentUsage = !usageSummary?.lastViewed
            ? await UsageLog_1.default.findOne({
                userId,
                workspaceId,
                eventType: { $in: ['query', 'view'] }
            })
                .sort('-createdAt')
                .select('citedDocuments createdAt query')
                .lean()
            : null;
        let recentItem = usageSummary?.lastViewed ?? null;
        const citedTitles = recentUsage?.citedDocuments?.filter(Boolean) || [];
        if (!recentItem) {
            recentItem = await findRecentItemByTitles(workspaceId.toString(), citedTitles);
        }
        if (!recentItem && recentUsage?.query) {
            const queryTitle = recentUsage.query.trim();
            if (queryTitle) {
                const regex = new RegExp(`^${escapeRegExp(queryTitle)}$`, 'i');
                const [document, alert] = await Promise.all([
                    Document_1.default.findOne({ workspaceId, title: regex })
                        .select('title updatedAt')
                        .lean(),
                    Alert_1.default.findOne({ workspaceId, title: regex })
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
                }
                else if (alert) {
                    recentItem = {
                        type: 'alert',
                        title: alert.title,
                        updatedAt: alert.updatedAt,
                        link: '/workspace/alerts',
                        severity: alert.severity,
                        status: alert.status
                    };
                }
                else {
                    recentItem = {
                        type: 'query',
                        title: queryTitle,
                        updatedAt: recentUsage.createdAt
                    };
                }
            }
        }
        const recentViews = await UsageLog_1.default.find({
            userId,
            workspaceId,
            eventType: 'view'
        })
            .sort('-createdAt')
            .limit(10)
            .select('query createdAt')
            .lean();
        const recentViewTitles = recentViews.map(view => view.query).filter(Boolean);
        const viewedAtByTitle = new Map(recentViews.map(view => [view.query, view.createdAt]));
        const recentItems = await buildRecentViewedItems(workspaceId.toString(), recentViewTitles, viewedAtByTitle);
        const [recentKnowledgeRaw, recentAlertsRaw, recentKnowledgeItems, recentAlertItems] = await Promise.all([
            Document_1.default.aggregate([
                { $match: { workspaceId, createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Alert_1.default.aggregate([
                { $match: { workspaceId, createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Document_1.default.find({ workspaceId })
                .sort('-createdAt')
                .limit(5)
                .select('title createdAt')
                .lean(),
            Alert_1.default.find({ workspaceId })
                .sort('-createdAt')
                .limit(5)
                .select('title createdAt severity status')
                .lean()
        ]);
        const knowledgeSeries = buildDailySeries(recentKnowledgeRaw.map(item => ({ _id: item._id, value: item.count })), 30);
        const alertSeries = buildDailySeries(recentAlertsRaw.map(item => ({ _id: item._id, value: item.count })), 30);
        return (0, response_1.sendSuccess)(res, {
            totalTokens: totalTokens[0]?.total || 0,
            topQueries: topQueries.map(q => ({
                query: q.query ?? q._id,
                topic: deriveTopicFromQuery(q.query ?? q._id, q.citedDocuments),
                count: q.count,
                lastUsed: q.lastUsed,
                inputTokens: q.inputTokens ?? 0,
                outputTokens: q.outputTokens ?? 0
            })),
            chartData: { labels: usageSeries.labels, tokens: usageSeries.values },
            recentItem,
            recentItems,
            recentKnowledgeBase: { labels: knowledgeSeries.labels, counts: knowledgeSeries.values, items: recentKnowledgeItems },
            recentAlerts: { labels: alertSeries.labels, counts: alertSeries.values, items: recentAlertItems }
        }, 'User stats fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.getUserStats = getUserStats;
const getWorkspaceStats = async (req, res) => {
    try {
        const workspaceId = req.workspace?._id;
        if (!workspaceId) {
            return (0, response_1.sendError)(res, 'Workspace context missing', 400);
        }
        const usageSummary = await UsageSummary_1.default.findOne({ workspaceId, userId: null });
        // Total Tokens
        const totalTokens = usageSummary
            ? [{ total: usageSummary.totalTokens }]
            : await UsageLog_1.default.aggregate([
                { $match: { workspaceId, eventType: 'query' } },
                { $group: { _id: null, total: { $sum: "$tokens" } } }
            ]);
        // Top Queries (using Cited Documents)
        const topQueries = usageSummary
            ? usageSummary.topQueries.slice(0, 20)
            : await buildTopTopics({ workspaceId, eventType: 'query' }, 20);
        // Usage by User (Top 5 Users)
        const topUsers = usageSummary
            ? await UsageSummary_1.default.find({ workspaceId, userId: { $ne: null } })
                .sort({ totalTokens: -1 })
                .limit(10)
                .then(async (summaries) => {
                const userIds = summaries.map(summary => summary.userId).filter(Boolean);
                const users = await User_1.default.find({ _id: { $in: userIds } })
                    .select('name email')
                    .lean();
                const userMap = new Map(users.map(user => [user._id.toString(), user]));
                return summaries.map(summary => {
                    const user = summary.userId ? userMap.get(summary.userId.toString()) : null;
                    return {
                        _id: summary.userId,
                        totalTokens: summary.totalTokens,
                        requestCount: summary.totalQueries,
                        name: user?.name,
                        email: user?.email
                    };
                });
            })
            : await UsageLog_1.default.aggregate([
                { $match: { workspaceId, eventType: 'query' } },
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
        const chartDataRaw = usageSummary
            ? toDailyEntries(usageSummary.dailyTokens)
            : await UsageLog_1.default.aggregate([
                { $match: { workspaceId, eventType: 'query', createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        tokens: { $sum: "$tokens" }
                    }
                },
                { $sort: { _id: 1 } }
            ]).then(raw => raw.map(item => ({ _id: item._id, value: item.tokens })));
        const usageSeries = buildDailySeries(chartDataRaw, 30);
        const [recentKnowledgeRaw, recentAlertsRaw, recentKnowledgeItems, recentAlertItems] = await Promise.all([
            Document_1.default.aggregate([
                { $match: { workspaceId, createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Alert_1.default.aggregate([
                { $match: { workspaceId, createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Document_1.default.find({ workspaceId })
                .sort('-createdAt')
                .limit(5)
                .select('title createdAt')
                .lean(),
            Alert_1.default.find({ workspaceId })
                .sort('-createdAt')
                .limit(5)
                .select('title createdAt severity status')
                .lean()
        ]);
        const knowledgeSeries = buildDailySeries(recentKnowledgeRaw.map(item => ({ _id: item._id, value: item.count })), 30);
        const alertSeries = buildDailySeries(recentAlertsRaw.map(item => ({ _id: item._id, value: item.count })), 30);
        return (0, response_1.sendSuccess)(res, {
            totalTokens: totalTokens[0]?.total || 0,
            topQueries: topQueries.map(q => ({
                query: q.query ?? q._id,
                topic: deriveTopicFromQuery(q.query ?? q._id, q.citedDocuments),
                count: q.count,
                lastUsed: q.lastUsed,
                inputTokens: q.inputTokens ?? 0,
                outputTokens: q.outputTokens ?? 0
            })),
            topUsers,
            chartData: { labels: usageSeries.labels, tokens: usageSeries.values },
            recentKnowledgeBase: { labels: knowledgeSeries.labels, counts: knowledgeSeries.values, items: recentKnowledgeItems },
            recentAlerts: { labels: alertSeries.labels, counts: alertSeries.values, items: recentAlertItems }
        }, 'Workspace stats fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.getWorkspaceStats = getWorkspaceStats;
