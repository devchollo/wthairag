"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.updateMe = exports.getMe = exports.logout = exports.login = exports.completeSignup = exports.verifyEmail = exports.initiateSignup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
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
const getOwnerEmails = () => {
    const envList = process.env.APP_OWNER_EMAILS || process.env.OWNER_EMAIL || '';
    return envList
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(Boolean);
};
const isOwnerEmail = (email) => {
    const normalized = email.trim().toLowerCase();
    const ownerEmails = getOwnerEmails();
    return ownerEmails.includes(normalized);
};
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
            isAdmin: false,
            isOwner: isOwnerEmail(email)
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
            secure: true,
            sameSite: 'none',
            path: '/', // Ensure cookie is available site-wide
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
        const normalizedEmail = email.toLowerCase();
        const user = await User_1.default.findOne({ email: normalizedEmail });
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
            secure: true,
            sameSite: 'none',
            path: '/'
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
        if (user && isOwnerEmail(user.email) && !user.isOwner) {
            user.isOwner = true;
            await user.save();
        }
        const memberships = await Membership_1.default.find({ userId: user?._id }).populate('workspaceId');
        return (0, response_1.sendSuccess)(res, { user, memberships }, 'User profile fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.getMe = getMe;
const updateMe = async (req, res) => {
    try {
        const { name, email } = req.body;
        // Basic validation
        if (!name && !email)
            return (0, response_1.sendError)(res, 'Nothing to update', 400);
        const updates = {};
        if (name)
            updates.name = name;
        if (email) {
            // Check if email already taken
            const existing = await User_1.default.findOne({ email, _id: { $ne: req.user?._id } });
            if (existing)
                return (0, response_1.sendError)(res, 'Email already in use', 400);
            updates.email = email;
        }
        const user = await User_1.default.findByIdAndUpdate(req.user?._id, updates, { new: true }).select('-password');
        return (0, response_1.sendSuccess)(res, user, 'Profile updated');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.updateMe = updateMe;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return (0, response_1.sendError)(res, 'Email is required', 400);
        const user = await User_1.default.findOne({ email });
        if (!user)
            return (0, response_1.sendError)(res, 'User not found', 404);
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenHash = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        // Send email
        await (0, emailService_1.sendResetPasswordEmail)(user.email, resetUrl);
        console.log(`Reset link sent to ${user.email}`);
        return (0, response_1.sendSuccess)(res, null, 'Password reset email sent');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password)
            return (0, response_1.sendError)(res, 'Token and Password required', 400);
        const resetTokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await User_1.default.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user)
            return (0, response_1.sendError)(res, 'Invalid or expired token', 400);
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return (0, response_1.sendSuccess)(res, null, 'Password reset successful');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.resetPassword = resetPassword;
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword)
            return (0, response_1.sendError)(res, 'Passwords required', 400);
        if (newPassword.length < 8)
            return (0, response_1.sendError)(res, 'New password must be at least 8 characters', 400);
        const user = await User_1.default.findById(req.user?._id);
        if (!user || !user.password)
            return (0, response_1.sendError)(res, 'User not found', 404);
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch)
            return (0, response_1.sendError)(res, 'Invalid current password', 401);
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(newPassword, salt);
        await user.save();
        return (0, response_1.sendSuccess)(res, {}, 'Password updated successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.updatePassword = updatePassword;
