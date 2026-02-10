"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelDeleteWorkspace = exports.deleteWorkspaceRequest = exports.updateWorkspace = exports.getWorkspace = void 0;
const Workspace_1 = __importDefault(require("../models/Workspace"));
const Membership_1 = __importDefault(require("../models/Membership"));
const Document_1 = __importDefault(require("../models/Document"));
const Alert_1 = __importDefault(require("../models/Alert"));
const Chat_1 = __importDefault(require("../models/Chat"));
const UsageLog_1 = __importDefault(require("../models/UsageLog"));
const Invitation_1 = __importDefault(require("../models/Invitation"));
const s3Service_1 = require("../services/s3Service");
const response_1 = require("../utils/response");
const getWorkspace = async (req, res) => {
    try {
        const { slug } = req.params;
        const workspace = await Workspace_1.default.findOne({ slug });
        if (!workspace) {
            return (0, response_1.sendError)(res, 'Workspace not found', 404);
        }
        // Check if user has access
        const membership = await Membership_1.default.findOne({
            userId: req.user?._id,
            workspaceId: workspace._id,
        });
        if (!membership) {
            return (0, response_1.sendError)(res, 'You do not have access to this workspace', 403);
        }
        return (0, response_1.sendSuccess)(res, { workspace, role: membership.role }, 'Workspace fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.getWorkspace = getWorkspace;
const updateWorkspace = async (req, res) => {
    try {
        const { name, config } = req.body;
        const workspace = await Workspace_1.default.findByIdAndUpdate(req.workspace?._id, { name, config }, { new: true });
        return (0, response_1.sendSuccess)(res, workspace, 'Workspace updated');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.updateWorkspace = updateWorkspace;
const deleteWorkspaceRequest = async (req, res) => {
    try {
        const workspaceId = req.workspace?._id;
        if (!workspaceId)
            return (0, response_1.sendError)(res, 'Workspace context missing', 400);
        // 1. Delete associated files from storage (S3/B2)
        const documents = await Document_1.default.find({ workspaceId });
        const fileDeletionPromises = documents
            .filter(doc => doc.fileKey)
            .map(doc => (0, s3Service_1.deleteFile)(process.env.B2_BUCKET || 'worktoolshub', doc.fileKey).catch(err => {
            console.error(`Failed to delete file ${doc.fileKey}:`, err);
        }));
        await Promise.all(fileDeletionPromises);
        // 2. Delete all related database records
        await Promise.all([
            Document_1.default.deleteMany({ workspaceId }),
            Alert_1.default.deleteMany({ workspaceId }),
            Chat_1.default.deleteMany({ workspaceId }),
            UsageLog_1.default.deleteMany({ workspaceId }),
            Invitation_1.default.deleteMany({ workspaceId }),
            Membership_1.default.deleteMany({ workspaceId }) // Removes all members including owner
        ]);
        // 3. Delete the workspace itself
        await Workspace_1.default.findByIdAndDelete(workspaceId);
        return (0, response_1.sendSuccess)(res, null, 'Workspace and all associated data have been permanently terminated.');
    }
    catch (error) {
        console.error('Workspace termination failed:', error);
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.deleteWorkspaceRequest = deleteWorkspaceRequest;
const cancelDeleteWorkspace = async (req, res) => {
    return (0, response_1.sendError)(res, 'Workspace deletion is now immediate and cannot be cancelled.', 400);
};
exports.cancelDeleteWorkspace = cancelDeleteWorkspace;
