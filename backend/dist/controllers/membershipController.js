"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMember = exports.updateMemberRole = exports.listMembers = exports.acceptInvite = exports.inviteMember = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Membership_1 = __importDefault(require("../models/Membership"));
const User_1 = __importDefault(require("../models/User"));
const Invitation_1 = __importDefault(require("../models/Invitation"));
const response_1 = require("../utils/response");
const emailService_1 = require("../services/emailService");
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d'
    });
};
const inviteMember = async (req, res) => {
    try {
        const { email, role } = req.body;
        const workspaceId = req.workspace?._id;
        if (!email || !['admin', 'member', 'viewer'].includes(role)) {
            return (0, response_1.sendError)(res, 'Valid email and role are required', 400);
        }
        // Check if already a member
        const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            const isMember = await Membership_1.default.findOne({ workspaceId, userId: existingUser._id });
            if (isMember)
                return (0, response_1.sendError)(res, 'User is already a member of this workspace', 400);
        }
        // Generate token
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
        // Create or update invitation
        await Invitation_1.default.findOneAndUpdate({ email: email.toLowerCase(), workspaceId }, {
            token,
            role,
            invitedBy: req.user?._id,
            expiresAt
        }, { upsert: true, new: true });
        // Send Email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const inviteLink = `${frontendUrl}/accept-invite?token=${token}`;
        await (0, emailService_1.sendInviteEmail)(email.toLowerCase(), req.user?.name || 'A colleague', req.workspace?.name || 'a Workspace', inviteLink);
        return (0, response_1.sendSuccess)(res, null, `Invitation sent to ${email}`);
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.inviteMember = inviteMember;
const acceptInvite = async (req, res) => {
    try {
        const { token, password, name } = req.body;
        const invitation = await Invitation_1.default.findOne({ token }).populate('workspaceId');
        if (!invitation || invitation.expiresAt < new Date()) {
            return (0, response_1.sendError)(res, 'Invalid or expired invitation', 400);
        }
        // Check if user exists, else create
        let user = await User_1.default.findOne({ email: invitation.email });
        if (!user) {
            if (!password || !name)
                return (0, response_1.sendError)(res, 'Name and password required to setup account', 400);
            user = await User_1.default.create({
                name,
                email: invitation.email,
                password,
                isVerified: true // They came from email
            });
        }
        // Create membership
        await Membership_1.default.create({
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
        return (0, response_1.sendSuccess)(res, { email: user.email }, 'Successfully joined workspace');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.acceptInvite = acceptInvite;
const listMembers = async (req, res) => {
    try {
        const members = await Membership_1.default.find({ workspaceId: req.workspace?._id })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        return (0, response_1.sendSuccess)(res, members, 'Members fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.listMembers = listMembers;
const updateMemberRole = async (req, res) => {
    try {
        const { membershipId } = req.params;
        const { role } = req.body;
        if (!['admin', 'member', 'viewer'].includes(role)) {
            return (0, response_1.sendError)(res, 'Invalid role', 400);
        }
        const membership = await Membership_1.default.findById(membershipId);
        if (!membership)
            return (0, response_1.sendError)(res, 'Membership not found', 404);
        // Prevent changing owner role or yourself (unless you're owner)
        if (membership.role === 'owner' && req.userRole !== 'owner') {
            return (0, response_1.sendError)(res, 'Cannot modify workspace owner', 403);
        }
        membership.role = role;
        await membership.save();
        return (0, response_1.sendSuccess)(res, membership, 'Role updated');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.updateMemberRole = updateMemberRole;
const removeMember = async (req, res) => {
    try {
        const { membershipId } = req.params;
        const membership = await Membership_1.default.findById(membershipId);
        if (!membership)
            return (0, response_1.sendError)(res, 'Membership not found', 404);
        if (membership.role === 'owner') {
            return (0, response_1.sendError)(res, 'Cannot remove workspace owner', 400);
        }
        await Membership_1.default.findByIdAndDelete(membershipId);
        return (0, response_1.sendSuccess)(res, null, 'Member removed from workspace');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.removeMember = removeMember;
