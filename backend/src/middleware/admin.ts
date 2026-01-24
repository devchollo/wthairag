import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const requireOwner = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || (!req.user.isOwner && !req.user.isAdmin)) {
        return sendError(res, 'Owner access required', 403);
    }

    next();
};
