import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Membership from '../models/Membership';
import User from '../models/User';
import Invitation from '../models/Invitation';
import { sendSuccess, sendError } from '../utils/response';
import { sendInviteEmail } from '../services/emailService';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d'
    });
};

export const inviteMember = async (req: Request, res: Response) => {
    try {
        const { email, role } = req.body;
        const workspaceId = req.workspace?._id;

        if (!email || !['admin', 'member', 'viewer'].includes(role)) {
            return sendError(res, 'Valid email and role are required', 400);
        }

        // Check if already a member
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            const isMember = await Membership.findOne({ workspaceId, userId: existingUser._id });
            if (isMember) return sendError(res, 'User is already a member of this workspace', 400);
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

        // Create or update invitation
        await Invitation.findOneAndUpdate(
            { email: email.toLowerCase(), workspaceId },
            {
                token,
                role,
                invitedBy: req.user?._id,
                expiresAt
            },
            { upsert: true, new: true }
        );

        // Send Email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const inviteLink = `${frontendUrl}/accept-invite?token=${token}`;

        await sendInviteEmail(
            email.toLowerCase(),
            req.user?.name || 'A colleague',
            req.workspace?.name || 'a Workspace',
            inviteLink
        );

        return sendSuccess(res, null, `Invitation sent to ${email}`);
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const acceptInvite = async (req: Request, res: Response) => {
    try {
        const { token, password, name } = req.body;

        const invitation = await Invitation.findOne({ token }).populate('workspaceId');
        if (!invitation || invitation.expiresAt < new Date()) {
            return sendError(res, 'Invalid or expired invitation', 400);
        }

        // Check if user exists, else create
        let user = await User.findOne({ email: invitation.email });
        if (!user) {
            if (!password || !name) return sendError(res, 'Name and password required to setup account', 400);
            user = await User.create({
                name,
                email: invitation.email,
                password,
                isVerified: true // They came from email
            });
        }

        // Create membership
        await Membership.create({
            workspaceId: invitation.workspaceId,
            userId: user._id,
            role: invitation.role
        });

        // Cleanup invitation
        await invitation.deleteOne();

        // Auto-login: generate token and set cookie
        const authToken = generateToken(user._id.toString());
        res.cookie('token', authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        return sendSuccess(res, { email: user.email }, 'Successfully joined workspace');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const listMembers = async (req: Request, res: Response) => {
    try {
        const members = await Membership.find({ workspaceId: req.workspace?._id })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        return sendSuccess(res, members, 'Members fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const updateMemberRole = async (req: Request, res: Response) => {
    try {
        const { membershipId } = req.params;
        const { role } = req.body;

        if (!['admin', 'member', 'viewer'].includes(role)) {
            return sendError(res, 'Invalid role', 400);
        }

        const membership = await Membership.findById(membershipId);
        if (!membership) return sendError(res, 'Membership not found', 404);

        // Prevent changing owner role or yourself (unless you're owner)
        if (membership.role === 'owner' && req.userRole !== 'owner') {
            return sendError(res, 'Cannot modify workspace owner', 403);
        }

        membership.role = role;
        await membership.save();

        return sendSuccess(res, membership, 'Role updated');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const removeMember = async (req: Request, res: Response) => {
    try {
        const { membershipId } = req.params;

        const membership = await Membership.findById(membershipId);
        if (!membership) return sendError(res, 'Membership not found', 404);

        if (membership.role === 'owner') {
            return sendError(res, 'Cannot remove workspace owner', 400);
        }

        await Membership.findByIdAndDelete(membershipId);

        return sendSuccess(res, null, 'Member removed from workspace');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const listPendingInvites = async (req: Request, res: Response) => {
    try {
        const invites = await Invitation.find({ workspaceId: req.workspace?._id })
            .populate('invitedBy', 'name email')
            .sort('-createdAt');
        return sendSuccess(res, invites, 'Pending invites fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const cancelInvite = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const invite = await Invitation.findOne({ _id: id, workspaceId: req.workspace?._id });
        if (!invite) return sendError(res, 'Invitation not found', 404);

        await invite.deleteOne();
        return sendSuccess(res, null, 'Invitation cancelled');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};
