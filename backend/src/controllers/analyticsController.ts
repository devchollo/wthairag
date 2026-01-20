import { Request, Response } from 'express';
import UsageLog from '../models/UsageLog';
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

        // Most Queried Topics (simple frequency of exact queries for now)
        const topQueries = await UsageLog.aggregate([
            { $match: { userId, workspaceId } },
            { $group: { _id: "$query", count: { $sum: 1 }, lastUsed: { $max: "$createdAt" } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        return sendSuccess(res, {
            totalTokens: totalTokens[0]?.total || 0,
            topQueries: topQueries.map(q => ({ query: q._id, count: q.count, lastUsed: q.lastUsed }))
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

        // Check if admin? The middleware likely handles role checks, but we can double check
        // assuming route usage: router.get('/workspace', requireWorkspaceRole('admin'), ...)

        // Total Tokens
        const totalTokens = await UsageLog.aggregate([
            { $match: { workspaceId } },
            { $group: { _id: null, total: { $sum: "$tokens" } } }
        ]);

        // Top Queries (Workspace Wide)
        const topQueries = await UsageLog.aggregate([
            { $match: { workspaceId } },
            { $group: { _id: "$query", count: { $sum: 1 }, lastUsed: { $max: "$createdAt" } } },
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

        return sendSuccess(res, {
            totalTokens: totalTokens[0]?.total || 0,
            topQueries: topQueries.map(q => ({ query: q._id, count: q.count, lastUsed: q.lastUsed })),
            topUsers
        }, 'Workspace stats fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};
