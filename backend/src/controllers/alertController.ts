import { Request, Response } from 'express';
import Alert from '../models/Alert';
import { sendSuccess, sendError } from '../utils/response';

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
