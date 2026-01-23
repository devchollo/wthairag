import { Request, Response } from 'express';
import UsageLog from '../models/UsageLog';
import Document from '../models/Document';
import Alert from '../models/Alert';
import { sendSuccess, sendError } from '../utils/response';

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
        const topQueries = await UsageLog.aggregate([
            { $match: { userId, workspaceId } },
            { $unwind: "$citedDocuments" },
            { $group: { _id: "$citedDocuments", count: { $sum: 1 }, lastUsed: { $max: "$createdAt" } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

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

        const labels = chartDataRaw.map(d => new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const tokens = chartDataRaw.map(d => d.tokens);

        const recentUsage = await UsageLog.findOne({
            userId,
            workspaceId,
            citedDocuments: { $exists: true, $ne: [] }
        })
            .sort('-createdAt')
            .select('citedDocuments createdAt')
            .lean();

        let recentItem = null;

        if (recentUsage?.citedDocuments?.length) {
            const titles = recentUsage.citedDocuments.filter(Boolean);
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
            if (matchedTitle) {
                const document = documentMap.get(matchedTitle);
                const alert = alertMap.get(matchedTitle);
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
                }
            }
        }

        return sendSuccess(res, {
            totalTokens: totalTokens[0]?.total || 0,
            topQueries: topQueries.map(q => ({ query: q._id, count: q.count, lastUsed: q.lastUsed })),
            chartData: { labels, tokens },
            recentItem
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
        const topQueries = await UsageLog.aggregate([
            { $match: { workspaceId } },
            { $unwind: "$citedDocuments" },
            { $group: { _id: "$citedDocuments", count: { $sum: 1 }, lastUsed: { $max: "$createdAt" } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

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

        // Format dates to simple labels like "Jan 01"
        const labels = chartDataRaw.map(d => new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const tokens = chartDataRaw.map(d => d.tokens);

        return sendSuccess(res, {
            totalTokens: totalTokens[0]?.total || 0,
            topQueries: topQueries.map(q => ({ query: q._id, count: q.count, lastUsed: q.lastUsed })),
            topUsers,
            chartData: { labels, tokens }
        }, 'Workspace stats fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};
