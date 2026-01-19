import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendError } from '../utils/response';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return sendError(res, 'Not authorized to access this route', 401);
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        const user = await User.findById(decoded.id);

        if (!user) {
            return sendError(res, 'User not found', 404);
        }

        req.user = user;
        next();
    } catch (error) {
        return sendError(res, 'Not authorized to access this route', 401);
    }
};
