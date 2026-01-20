"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelDeleteWorkspace = exports.deleteWorkspaceRequest = exports.updateWorkspace = exports.getWorkspace = void 0;
const Workspace_1 = __importDefault(require("../models/Workspace"));
const Membership_1 = __importDefault(require("../models/Membership"));
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
        const pendingDeletionAt = new Date();
        pendingDeletionAt.setDate(pendingDeletionAt.getDate() + 7);
        const workspace = await Workspace_1.default.findByIdAndUpdate(req.workspace?._id, { pendingDeletionAt }, { new: true });
        return (0, response_1.sendSuccess)(res, workspace, 'Workspace scheduled for deletion in 7 days');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.deleteWorkspaceRequest = deleteWorkspaceRequest;
const cancelDeleteWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace_1.default.findByIdAndUpdate(req.workspace?._id, { $unset: { pendingDeletionAt: 1 } }, { new: true });
        return (0, response_1.sendSuccess)(res, workspace, 'Workspace deletion cancelled');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.cancelDeleteWorkspace = cancelDeleteWorkspace;
