import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Workspace from '../models/Workspace';
import Membership from '../models/Membership';
import { sendSuccess, sendError } from '../utils/response';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, orgName } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return sendError(res, 'User already exists', 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            email,
            password: hashedPassword,
            name,
        });

        // Automatically create a workspace for the new user if orgName is provided
        if (orgName) {
            const slug = orgName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const workspace = await Workspace.create({
                name: orgName,
                slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`,
                ownerId: user._id,
            });

            await Membership.create({
                userId: user._id,
                workspaceId: workspace._id,
                role: 'owner',
            });
        }

        return sendSuccess(res, {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id.toString()),
        }, 'User registered successfully', 201);
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

// Rate limit middleware should handle this, but adding a small artificial delay helps
export const login = async (req: Request, res: Response) => {
    // Basic anti-timing attack measure
    const minTime = 300; // ms
    const start = Date.now();

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return sendError(res, 'Invalid credentials', 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const elapsed = Date.now() - start;
            if (elapsed < minTime) await new Promise(r => setTimeout(r, minTime - elapsed));
            return sendError(res, 'Invalid credentials', 401);
        }

        const elapsed = Date.now() - start;
        if (elapsed < minTime) await new Promise(r => setTimeout(r, minTime - elapsed));

        return sendSuccess(res, {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id.toString()),
        }, 'Login successful');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?._id).select('-password');
        const memberships = await Membership.find({ userId: user?._id }).populate('workspaceId');

        return sendSuccess(res, { user, memberships }, 'User profile fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};
