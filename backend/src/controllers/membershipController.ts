import { Request, Response } from 'express';
import Membership from '../models/Membership';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/response';

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
