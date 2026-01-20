import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Workspace from '../models/Workspace';
import Membership from '../models/Membership';
import Verification from '../models/Verification';
import { sendVerificationEmail } from '../services/emailService';
import { sendSuccess, sendError } from '../utils/response';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const initiateSignup = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return sendError(res, 'Email is required', 400);

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return sendError(res, 'Email is already registered. Please login.', 400);
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Save verification code (upsert)
        await Verification.findOneAndUpdate(
            { email },
            {
                code,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
            },
            { upsert: true, new: true }
        );

        // Send email
        await sendVerificationEmail(email, code);

        return sendSuccess(res, { email }, 'Verification code sent');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;

        const record = await Verification.findOne({ email, code });
        if (!record) {
            return sendError(res, 'Invalid or expired verification code', 400);
        }

        // Generate temporary signup token
        const signupToken = jwt.sign({ email, scope: 'signup' }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '30m'
        });

        // Delete verification record
        await Verification.deleteOne({ _id: record._id });

        return sendSuccess(res, { signupToken }, 'Email verified');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const completeSignup = async (req: Request, res: Response) => {
    try {
        const { signupToken, name, password, orgName } = req.body;

        if (!signupToken) return sendError(res, 'Signup token required', 400);

        // Verify signup token
        let decoded: any;
        try {
            decoded = jwt.verify(signupToken, process.env.JWT_SECRET || 'secret');
            if (decoded.scope !== 'signup') throw new Error('Invalid token scope');
        } catch (e) {
            return sendError(res, 'Invalid or expired signup token', 401);
        }

        const { email } = decoded;

        // Double check user doesn't exist (race condition)
        const userExists = await User.findOne({ email });
        if (userExists) return sendError(res, 'User already registered', 400);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            isVerified: true,
            isAdmin: true // User is admin of their own workspace
        });

        // Create Workspace
        const cleanOrgName = orgName || `${name}'s Workspace`;
        const slug = cleanOrgName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

        const workspace = await Workspace.create({
            name: cleanOrgName,
            slug,
            ownerId: user._id,
        });

        // Create Membership (Owner)
        await Membership.create({
            userId: user._id,
            workspaceId: workspace._id,
            role: 'owner',
        });

        // Return Auth Token
        return sendSuccess(res, {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id.toString()),
        }, 'Account created successfully', 201);

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
