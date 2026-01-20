"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.completeSignup = exports.verifyEmail = exports.initiateSignup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Workspace_1 = __importDefault(require("../models/Workspace"));
const Membership_1 = __importDefault(require("../models/Membership"));
const Verification_1 = __importDefault(require("../models/Verification"));
const emailService_1 = require("../services/emailService");
const response_1 = require("../utils/response");
const zod_1 = require("zod");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format').trim(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters')
});
const initiateSignupSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format').trim()
});
const completeSignupSchema = zod_1.z.object({
    signupToken: zod_1.z.string(),
    name: zod_1.z.string().min(2, 'Name too short').max(50, 'Name too long').trim(),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    orgName: zod_1.z.string().max(100, 'Organization name too long').optional()
});
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};
const initiateSignup = async (req, res) => {
    try {
        const validated = initiateSignupSchema.safeParse(req.body);
        if (!validated.success) {
            return (0, response_1.sendError)(res, validated.error.issues[0].message, 400);
        }
        const { email } = validated.data;
        // Check if user already exists
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return (0, response_1.sendError)(res, 'Email is already registered. Please login.', 400);
        }
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        // Save verification code (upsert)
        await Verification_1.default.findOneAndUpdate({ email }, {
            code,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }, { upsert: true, new: true });
        // Send email
        await (0, emailService_1.sendVerificationEmail)(email, code);
        return (0, response_1.sendSuccess)(res, { email }, 'Verification code sent');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.initiateSignup = initiateSignup;
const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const record = await Verification_1.default.findOne({ email, code });
        if (!record) {
            return (0, response_1.sendError)(res, 'Invalid or expired verification code', 400);
        }
        // Generate temporary signup token
        const signupToken = jsonwebtoken_1.default.sign({ email, scope: 'signup' }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '30m'
        });
        // Delete verification record
        await Verification_1.default.deleteOne({ _id: record._id });
        return (0, response_1.sendSuccess)(res, { signupToken }, 'Email verified');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.verifyEmail = verifyEmail;
const completeSignup = async (req, res) => {
    try {
        const validated = completeSignupSchema.safeParse(req.body);
        if (!validated.success) {
            return (0, response_1.sendError)(res, validated.error.issues[0].message, 400);
        }
        const { signupToken, name, password, orgName } = validated.data;
        if (!signupToken)
            return (0, response_1.sendError)(res, 'Signup token required', 400);
        // Verify signup token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(signupToken, process.env.JWT_SECRET || 'secret');
            if (decoded.scope !== 'signup')
                throw new Error('Invalid token scope');
        }
        catch (e) {
            return (0, response_1.sendError)(res, 'Invalid or expired signup token', 401);
        }
        const { email } = decoded;
        // Double check user doesn't exist (race condition)
        const userExists = await User_1.default.findOne({ email });
        if (userExists)
            return (0, response_1.sendError)(res, 'User already registered', 400);
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Create User
        const user = await User_1.default.create({
            email,
            password: hashedPassword,
            name,
            isVerified: true,
            isAdmin: true // User is admin of their own workspace
        });
        // Create Workspace
        const cleanOrgName = orgName || `${name}'s Workspace`;
        const slug = cleanOrgName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 6);
        const workspace = await Workspace_1.default.create({
            name: cleanOrgName,
            slug,
            ownerId: user._id,
        });
        // Create Membership (Owner)
        await Membership_1.default.create({
            userId: user._id,
            workspaceId: workspace._id,
            role: 'owner',
        });
        // Set httpOnly cookie
        const token = generateToken(user._id.toString());
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
        // Return user data (NO TOKEN in response)
        return (0, response_1.sendSuccess)(res, {
            _id: user._id,
            name: user.name,
            email: user.email,
        }, 'Account created successfully', 201);
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.completeSignup = completeSignup;
// Rate limit middleware should handle this, but adding a small artificial delay helps
const login = async (req, res) => {
    // Basic anti-timing attack measure
    const minTime = 300; // ms
    const start = Date.now();
    try {
        const validated = loginSchema.safeParse(req.body);
        if (!validated.success) {
            return (0, response_1.sendError)(res, validated.error.issues[0].message, 400);
        }
        const { email, password } = validated.data;
        const user = await User_1.default.findOne({ email });
        if (!user || !user.password) {
            return (0, response_1.sendError)(res, 'Invalid credentials', 401);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            const elapsed = Date.now() - start;
            if (elapsed < minTime)
                await new Promise(r => setTimeout(r, minTime - elapsed));
            return (0, response_1.sendError)(res, 'Invalid credentials', 401);
        }
        const elapsed = Date.now() - start;
        if (elapsed < minTime)
            await new Promise(r => setTimeout(r, minTime - elapsed));
        // Set httpOnly cookie
        const token = generateToken(user._id.toString());
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
        // Return user data (NO TOKEN in response)
        return (0, response_1.sendSuccess)(res, {
            _id: user._id,
            name: user.name,
            email: user.email,
        }, 'Login successful');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        // Clear the auth cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        return (0, response_1.sendSuccess)(res, {}, 'Logged out successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id).select('-password');
        const memberships = await Membership_1.default.find({ userId: user?._id }).populate('workspaceId');
        return (0, response_1.sendSuccess)(res, { user, memberships }, 'User profile fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.getMe = getMe;
