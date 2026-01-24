import { Request, Response } from 'express';
import Alert from '../models/Alert';
import UsageLog from '../models/UsageLog';
import { sendSuccess, sendError } from '../utils/response';
import { recordUsageSummaryForView } from '../services/usageSummaryService';

export const createAlert = async (req: Request, res: Response) => {
    try {
        const { title, description, severity } = req.body;
        const alert = await Alert.create({
            workspaceId: req.workspace?._id,
            title,
            description,
            severity,
        });
        return sendSuccess(res, alert, 'Alert created', 201);
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const listAlerts = async (req: Request, res: Response) => {
    try {
        const alerts = await Alert.find({ workspaceId: req.workspace?._id }).sort('-createdAt');
        return sendSuccess(res, alerts, 'Alerts fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const resolveAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const alert = await Alert.findOneAndUpdate(
            { _id: id, workspaceId: req.workspace?._id },
            {
                status: 'resolved',
                resolvedAt: new Date(),
                resolvedBy: req.user?._id
            },
            { new: true }
        );

        if (!alert) {
            return sendError(res, 'Alert not found', 404);
        }

        return sendSuccess(res, alert, 'Alert resolved');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const updateAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, severity } = req.body;
        const alert = await Alert.findOneAndUpdate(
            { _id: id, workspaceId: req.workspace?._id },
            { title, description, severity },
            { new: true, runValidators: true }
        );

        if (!alert) return sendError(res, 'Alert not found', 404);
        return sendSuccess(res, alert, 'Alert updated');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const deleteAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const alert = await Alert.findOneAndDelete({ _id: id, workspaceId: req.workspace?._id });
        if (!alert) return sendError(res, 'Alert not found', 404);
        return sendSuccess(res, null, 'Alert deleted');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const recordAlertView = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const workspaceId = req.workspace?._id;
        const alert = await Alert.findOne({ _id: id, workspaceId: req.workspace?._id })
            .select('title updatedAt severity status')
            .lean();

        if (!alert) {
            return sendError(res, 'Alert not found', 404);
        }

        if (!req.user?._id) {
            return sendError(res, 'User context missing', 400);
        }

        if (!workspaceId) {
            return sendError(res, 'Workspace context missing', 400);
        }

        await UsageLog.create({
            workspaceId,
            userId: req.user?._id,
            tokens: 0,
            query: alert.title,
            citedDocuments: [alert.title],
            eventType: 'view'
        });
        await recordUsageSummaryForView({
            workspaceId: workspaceId.toString(),
            userId: req.user?._id.toString(),
            lastViewed: {
                type: 'alert',
                title: alert.title,
                updatedAt: alert.updatedAt,
                link: '/workspace/alerts',
                severity: alert.severity,
                status: alert.status
            }
        });

        return sendSuccess(res, null, 'Alert view recorded');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};
