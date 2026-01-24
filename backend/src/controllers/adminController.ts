import { Request, Response } from 'express';
import User from '../models/User';
import Workspace from '../models/Workspace';
import Testimonial from '../models/Testimonial';
import UsageLog from '../models/UsageLog';
import Membership from '../models/Membership';
import Alert from '../models/Alert';
import { sendError, sendSuccess } from '../utils/response';

const DAYS_BACK = 30;

const buildDateLabels = () => {
    const labels: string[] = [];
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

const mapAggregateToSeries = (labels: string[], data: { _id: string; value: number }[]) => {
    const map = new Map<string, number>();
    data.forEach((entry) => map.set(entry._id, entry.value));
    return labels.map((label) => map.get(label) || 0);
};

export const getAdminOverview = async (_req: Request, res: Response) => {
    try {
        const [totalUsers, activeTenants, pendingReviews, totalTokens, workspaceUsage] = await Promise.all([
            User.countDocuments({}),
            Workspace.countDocuments({}),
            Testimonial.countDocuments({ isApproved: false }),
            UsageLog.aggregate([{ $group: { _id: null, total: { $sum: '$tokens' } } }]),
            UsageLog.aggregate([
                { $group: { _id: '$workspaceId', totalTokens: { $sum: '$tokens' }, requestCount: { $sum: 1 } } },
                { $sort: { totalTokens: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'workspaces',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'workspace'
                    }
                },
                { $unwind: '$workspace' },
                {
                    $project: {
                        _id: 1,
                        totalTokens: 1,
                        requestCount: 1,
                        workspaceName: '$workspace.name'
                    }
                }
            ])
        const [totalUsers, activeTenants, pendingReviews, totalTokens] = await Promise.all([
            User.countDocuments({}),
            Workspace.countDocuments({}),
            Testimonial.countDocuments({ isApproved: false }),
            UsageLog.aggregate([{ $group: { _id: null, total: { $sum: '$tokens' } } }])
        ]);

        const labels = buildDateLabels();
        const startDate = new Date(labels[0]);

        const [usageAgg, userAgg, workspaceAgg] = await Promise.all([
            UsageLog.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        value: { $sum: '$tokens' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            User.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        value: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Workspace.aggregate([
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

        return sendSuccess(res, { overview, charts }, 'Admin overview fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const getAdminTenants = async (req: Request, res: Response) => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        const regex = search ? new RegExp(search, 'i') : null;

        const pipeline: any[] = [
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

        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $limit: 200 },
            {
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
            }
        );

        const tenants = await Membership.aggregate(pipeline);

        return sendSuccess(res, tenants, 'Tenant directory fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const getAdminTestimonials = async (req: Request, res: Response) => {
    try {
        const status = typeof req.query.status === 'string' ? req.query.status : 'pending';
        const isApproved = status === 'approved';
        const testimonials = await Testimonial.find({ isApproved })
            .sort({ createdAt: -1 })
            .lean();

        return sendSuccess(res, testimonials, 'Testimonials fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const approveTestimonial = async (req: Request, res: Response) => {
    try {
        const testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );

        if (!testimonial) {
            return sendError(res, 'Testimonial not found', 404);
        }

        return sendSuccess(res, testimonial, 'Testimonial approved');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const rejectTestimonial = async (req: Request, res: Response) => {
    try {
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

        if (!testimonial) {
            return sendError(res, 'Testimonial not found', 404);
        }

        return sendSuccess(res, testimonial, 'Testimonial rejected');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const getSystemConfig = async (_req: Request, res: Response) => {
    try {
        const [totalUsers, totalWorkspaces, totalAlerts, pendingReviews] = await Promise.all([
            User.countDocuments({}),
            Workspace.countDocuments({}),
            Alert.countDocuments({}),
            Testimonial.countDocuments({ isApproved: false })
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

        return sendSuccess(res, config, 'System config fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};
