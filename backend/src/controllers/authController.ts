import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import nodeCrypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Workspace from '../models/Workspace';
import Membership from '../models/Membership';
import Verification from '../models/Verification';
import { sendVerificationEmail, sendResetPasswordEmail } from '../services/emailService';
import { sendSuccess, sendError } from '../utils/response';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('Invalid email format').trim(),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

const initiateSignupSchema = z.object({
    email: z.string().email('Invalid email format').trim()
});

const completeSignupSchema = z.object({
    signupToken: z.string(),
    name: z.string().min(2, 'Name too short').max(50, 'Name too long').trim(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    orgName: z.string().max(100, 'Organization name too long').optional()
});

const getOwnerEmails = () => {
    const envList = process.env.APP_OWNER_EMAILS || process.env.OWNER_EMAIL || '';
    return envList
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(Boolean);
};

const isOwnerEmail = (email: string) => {
    const normalized = email.trim().toLowerCase();
    const ownerEmails = getOwnerEmails();
    return ownerEmails.includes(normalized);
};

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const initiateSignup = async (req: Request, res: Response) => {
    try {
        const validated = initiateSignupSchema.safeParse(req.body);
        if (!validated.success) {
            return sendError(res, validated.error.issues[0].message, 400);
        }
        const { email } = validated.data;

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
        const validated = completeSignupSchema.safeParse(req.body);
        if (!validated.success) {
            return sendError(res, validated.error.issues[0].message, 400);
        }
        const { signupToken, name, password, orgName } = validated.data;

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
            isAdmin: false,
            isOwner: isOwnerEmail(email)
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

        // Set httpOnly cookie
        const token = generateToken(user._id.toString());
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/', // Ensure cookie is available site-wide
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Return user data (NO TOKEN in response)
        return sendSuccess(res, {
            _id: user._id,
            name: user.name,
            email: user.email,
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
        const validated = loginSchema.safeParse(req.body);
        if (!validated.success) {
            return sendError(res, validated.error.issues[0].message, 400);
        }
        const { email, password } = validated.data;
        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
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

        if (isOwnerEmail(user.email) && !user.isOwner) {
            user.isOwner = true;
            await user.save();
        }

        // Set httpOnly cookie
        const token = generateToken(user._id.toString());
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/', // Ensure cookie is available site-wide
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Return user data (NO TOKEN in response)
        return sendSuccess(res, {
            _id: user._id,
            name: user.name,
            email: user.email,
        }, 'Login successful');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        // Clear the auth cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });
        return sendSuccess(res, {}, 'Logged out successfully');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?._id).select('-password');
        if (user && isOwnerEmail(user.email) && !user.isOwner) {
            user.isOwner = true;
            await user.save();
        }
        const memberships = await Membership.find({ userId: user?._id }).populate('workspaceId');

        return sendSuccess(res, { user, memberships }, 'User profile fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const updateMe = async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;

        // Basic validation
        if (!name && !email) return sendError(res, 'Nothing to update', 400);

        const updates: any = {};
        if (name) updates.name = name;
        if (email) {
            // Check if email already taken
            const existing = await User.findOne({ email, _id: { $ne: req.user?._id } });
            if (existing) return sendError(res, 'Email already in use', 400);
            updates.email = email;
        }

        const user = await User.findByIdAndUpdate(req.user?._id, updates, { new: true }).select('-password');
        return sendSuccess(res, user, 'Profile updated');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return sendError(res, 'Email is required', 400);

        const user = await User.findOne({ email });
        if (!user) return sendError(res, 'User not found', 404);

        const resetToken = nodeCrypto.randomBytes(32).toString('hex');
        const resetTokenHash = nodeCrypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        // Send email
        await sendResetPasswordEmail(user.email, resetUrl);
        console.log(`Reset link sent to ${user.email}`);

        return sendSuccess(res, null, 'Password reset email sent');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return sendError(res, 'Token and Password required', 400);

        const resetTokenHash = nodeCrypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return sendError(res, 'Invalid or expired token', 400);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return sendSuccess(res, null, 'Password reset successful');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const updatePassword = async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) return sendError(res, 'Passwords required', 400);
        if (newPassword.length < 8) return sendError(res, 'New password must be at least 8 characters', 400);

        const user = await User.findById(req.user?._id);
        if (!user || !user.password) return sendError(res, 'User not found', 404);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return sendError(res, 'Invalid current password', 401);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return sendSuccess(res, {}, 'Password updated successfully');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};
