import { Request, Response, NextFunction } from 'express';
import Workspace from '../models/Workspace';
import Membership from '../models/Membership';
import { sendError } from '../utils/response';

export const workspaceOverlay = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const workspaceId = req.headers['x-workspace-id'] || req.params.workspaceId;

        if (!workspaceId) {
            return sendError(res, 'Workspace ID is required', 400);
        }

        const membership = await Membership.findOne({
            userId: req.user?._id,
            workspaceId: workspaceId,
        });

        if (!membership) {
            return sendError(res, 'You do not have access to this workspace', 403);
        }

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return sendError(res, 'Workspace not found', 404);
        }



        req.workspace = workspace;
        req.userRole = membership.role;
        next();
    } catch (error) {
        return sendError(res, 'Workspace access error', 500);
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return sendError(res, 'You do not have permission to perform this action', 403);
        }
        next();
    };
};
