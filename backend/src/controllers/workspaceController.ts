import { Request, Response } from 'express';
import Workspace from '../models/Workspace';
import Membership from '../models/Membership';
import { sendSuccess, sendError } from '../utils/response';

export const getWorkspace = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const workspace = await Workspace.findOne({ slug });

        if (!workspace) {
            return sendError(res, 'Workspace not found', 404);
        }

        // Check if user has access
        const membership = await Membership.findOne({
            userId: req.user?._id,
            workspaceId: workspace._id,
        });

        if (!membership) {
            return sendError(res, 'You do not have access to this workspace', 403);
        }

        return sendSuccess(res, { workspace, role: membership.role }, 'Workspace fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const updateWorkspace = async (req: Request, res: Response) => {
    try {
        const { name, config } = req.body;
        const workspace = await Workspace.findByIdAndUpdate(
            req.workspace?._id,
            { name, config },
            { new: true }
        );
        return sendSuccess(res, workspace, 'Workspace updated');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const deleteWorkspaceRequest = async (req: Request, res: Response) => {
    try {
        const pendingDeletionAt = new Date();
        pendingDeletionAt.setDate(pendingDeletionAt.getDate() + 7);

        const workspace = await Workspace.findByIdAndUpdate(
            req.workspace?._id,
            { pendingDeletionAt },
            { new: true }
        );

        return sendSuccess(res, workspace, 'Workspace scheduled for deletion in 7 days');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const cancelDeleteWorkspace = async (req: Request, res: Response) => {
    try {
        const workspace = await Workspace.findByIdAndUpdate(
            req.workspace?._id,
            { $unset: { pendingDeletionAt: 1 } },
            { new: true }
        );
        return sendSuccess(res, workspace, 'Workspace deletion cancelled');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};
