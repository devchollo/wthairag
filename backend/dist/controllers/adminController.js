"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemConfig = exports.rejectTestimonial = exports.approveTestimonial = exports.getAdminTestimonials = exports.getAdminTenants = exports.getAdminOverview = void 0;
const User_1 = __importDefault(require("../models/User"));
const Workspace_1 = __importDefault(require("../models/Workspace"));
const Testimonial_1 = __importDefault(require("../models/Testimonial"));
const UsageLog_1 = __importDefault(require("../models/UsageLog"));
const Membership_1 = __importDefault(require("../models/Membership"));
const Alert_1 = __importDefault(require("../models/Alert"));
const response_1 = require("../utils/response");
const DAYS_BACK = 30;
const buildDateLabels = () => {
    const labels = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (DAYS_BACK - 1));
    for (let i = 0; i < DAYS_BACK; i += 1) {
        const current = new Date(start);
        current.setDate(start.getDate() + i);
        labels.push(current.toISOString().slice(0, 10));
    }
    return labels;
};
const mapAggregateToSeries = (labels, data) => {
    const map = new Map();
    data.forEach((entry) => map.set(entry._id, entry.value));
    return labels.map((label) => map.get(label) || 0);
};
const getAdminOverview = async (_req, res) => {
    try {
        const [totalUsers, activeTenants, pendingReviews, totalTokens, workspaceUsageRaw] = await Promise.all([
            User_1.default.countDocuments({}),
            Workspace_1.default.countDocuments({}),
            Testimonial_1.default.countDocuments({ isApproved: false }),
            UsageLog_1.default.aggregate([
                { $match: { eventType: 'query' } },
                { $group: { _id: null, total: { $sum: '$tokens' } } }
            ]),
            UsageLog_1.default.aggregate([
                { $match: { eventType: 'query' } },
                { $group: { _id: '$workspaceId', totalTokens: { $sum: '$tokens' }, requestCount: { $sum: 1 } } },
                { $sort: { totalTokens: -1 } },
                { $limit: 5 }
            ])
        ]);
        const workspaceIds = workspaceUsageRaw.map((entry) => entry._id).filter(Boolean);
        const workspaceDocs = await Workspace_1.default.find({ _id: { $in: workspaceIds } })
            .select('name')
            .lean();
        const workspaceMap = new Map(workspaceDocs.map((workspace) => [workspace._id.toString(), workspace.name]));
        const workspaceUsage = workspaceUsageRaw.map((entry) => ({
            _id: entry._id,
            totalTokens: entry.totalTokens,
            requestCount: entry.requestCount,
            workspaceName: entry._id ? workspaceMap.get(entry._id.toString()) || 'Deleted workspace' : 'Unknown workspace'
        }));
        const labels = buildDateLabels();
        const startDate = new Date(labels[0]);
        const [usageAgg, userAgg, workspaceAgg] = await Promise.all([
            UsageLog_1.default.aggregate([
                { $match: { eventType: 'query', createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        value: { $sum: '$tokens' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            User_1.default.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        value: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Workspace_1.default.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        value: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);
        const overview = {
            totalUsers,
            activeTenants,
            pendingReviews,
            totalTokens: totalTokens[0]?.total || 0,
            uptimeSeconds: Math.floor(process.uptime()),
            systemStatus: 'Operational',
            workspaceUsage: workspaceUsage || []
        };
        const charts = {
            labels,
            usageTokens: mapAggregateToSeries(labels, usageAgg),
            newUsers: mapAggregateToSeries(labels, userAgg),
            newWorkspaces: mapAggregateToSeries(labels, workspaceAgg)
        };
        return (0, response_1.sendSuccess)(res, { overview, charts }, 'Admin overview fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.getAdminOverview = getAdminOverview;
const getAdminTenants = async (req, res) => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        const regex = search ? new RegExp(search, 'i') : null;
        const pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'workspaces',
                    localField: 'workspaceId',
                    foreignField: '_id',
                    as: 'workspace'
                }
            },
            { $unwind: '$workspace' }
        ];
        if (regex) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'user.name': regex },
                        { 'user.email': regex },
                        { 'workspace.name': regex }
                    ]
                }
            });
        }
        pipeline.push({ $sort: { createdAt: -1 } }, { $limit: 200 }, {
            $project: {
                _id: 1,
                role: 1,
                createdAt: 1,
                user: {
                    _id: '$user._id',
                    name: '$user.name',
                    email: '$user.email',
                    isVerified: '$user.isVerified'
                },
                workspace: {
                    _id: '$workspace._id',
                    name: '$workspace.name'
                }
            }
        });
        const tenants = await Membership_1.default.aggregate(pipeline);
        return (0, response_1.sendSuccess)(res, tenants, 'Tenant directory fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.getAdminTenants = getAdminTenants;
const getAdminTestimonials = async (req, res) => {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status : 'pending';
        const isApproved = status === 'approved';
        const testimonials = await Testimonial_1.default.find({ isApproved })
            .sort({ createdAt: -1 })
            .lean();
        return (0, response_1.sendSuccess)(res, testimonials, 'Testimonials fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.getAdminTestimonials = getAdminTestimonials;
const approveTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial_1.default.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
        if (!testimonial) {
            return (0, response_1.sendError)(res, 'Testimonial not found', 404);
        }
        return (0, response_1.sendSuccess)(res, testimonial, 'Testimonial approved');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.approveTestimonial = approveTestimonial;
const rejectTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial_1.default.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return (0, response_1.sendError)(res, 'Testimonial not found', 404);
        }
        return (0, response_1.sendSuccess)(res, testimonial, 'Testimonial rejected');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.rejectTestimonial = rejectTestimonial;
const getSystemConfig = async (_req, res) => {
    try {
        const [totalUsers, totalWorkspaces, totalAlerts, pendingReviews] = await Promise.all([
            User_1.default.countDocuments({}),
            Workspace_1.default.countDocuments({}),
            Alert_1.default.countDocuments({}),
            Testimonial_1.default.countDocuments({ isApproved: false })
        ]);
        const config = {
            environment: process.env.NODE_ENV || 'development',
            frontendUrl: process.env.FRONTEND_URL || null,
            apiBaseUrl: process.env.API_URL || null,
            rateLimits: {
                global: '300 requests / 15 min',
                auth: '50 requests / hour',
                ai: '20 requests / hour'
            },
            totals: {
                users: totalUsers,
                workspaces: totalWorkspaces,
                alerts: totalAlerts,
                pendingReviews
            },
            server: {
                uptimeSeconds: Math.floor(process.uptime()),
                nodeVersion: process.version
            }
        };
        return (0, response_1.sendSuccess)(res, config, 'System config fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.getSystemConfig = getSystemConfig;
