"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceStats = exports.getUserStats = void 0;
const UsageLog_1 = __importDefault(require("../models/UsageLog"));
const response_1 = require("../utils/response");
const getUserStats = async (req, res) => {
    try {
        const userId = req.user?._id;
        const workspaceId = req.workspace?._id;
        if (!userId || !workspaceId) {
            return (0, response_1.sendError)(res, 'User or Workspace context missing', 400);
        }
        // Total Tokens
        const totalTokens = await UsageLog_1.default.aggregate([
            { $match: { userId, workspaceId } },
            { $group: { _id: null, total: { $sum: "$tokens" } } }
        ]);
        // Most Queried Topics (using Cited Documents now)
        const topQueries = await UsageLog_1.default.aggregate([
            { $match: { userId, workspaceId } },
            { $unwind: "$citedDocuments" },
            { $group: { _id: "$citedDocuments", count: { $sum: 1 }, lastUsed: { $max: "$createdAt" } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        // Chart Data (Daily Tokens for last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const chartData = await UsageLog_1.default.aggregate([
            { $match: { userId, workspaceId, createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    tokens: { $sum: "$tokens" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        return (0, response_1.sendSuccess)(res, {
            totalTokens: totalTokens[0]?.total || 0,
            topQueries: topQueries.map(q => ({ query: q._id, count: q.count, lastUsed: q.lastUsed })),
            chartData // Frontend expects { tokens: number[], labels: string[] } mapping logic locally or here? 
            // Frontend page.tsx maps `chartData.tokens`. Let's return formatted if needed or raw.
            // Existing frontend logic: (stats?.chartData?.tokens || [])
            // So we should format it here.
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
        // Total Tokens
        const totalTokens = await UsageLog_1.default.aggregate([
            { $match: { workspaceId } },
            { $group: { _id: null, total: { $sum: "$tokens" } } }
        ]);
        // Top Queries (using Cited Documents)
        const topQueries = await UsageLog_1.default.aggregate([
            { $match: { workspaceId } },
            { $unwind: "$citedDocuments" },
            { $group: { _id: "$citedDocuments", count: { $sum: 1 }, lastUsed: { $max: "$createdAt" } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        // Usage by User (Top 5 Users)
        const topUsers = await UsageLog_1.default.aggregate([
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
        const chartDataRaw = await UsageLog_1.default.aggregate([
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
        return (0, response_1.sendSuccess)(res, {
            totalTokens: totalTokens[0]?.total || 0,
            topQueries: topQueries.map(q => ({ query: q._id, count: q.count, lastUsed: q.lastUsed })),
            topUsers,
            chartData: { labels, tokens }
        }, 'Workspace stats fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.getWorkspaceStats = getWorkspaceStats;
