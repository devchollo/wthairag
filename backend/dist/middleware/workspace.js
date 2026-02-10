"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.workspaceOverlay = void 0;
const Workspace_1 = __importDefault(require("../models/Workspace"));
const Membership_1 = __importDefault(require("../models/Membership"));
const response_1 = require("../utils/response");
const workspaceOverlay = async (req, res, next) => {
    try {
        const workspaceId = req.headers['x-workspace-id'] || req.params.workspaceId;
        if (!workspaceId) {
            return (0, response_1.sendError)(res, 'Workspace ID is required', 400);
        }
        const membership = await Membership_1.default.findOne({
            userId: req.user?._id,
            workspaceId: workspaceId,
        });
        if (!membership) {
            return (0, response_1.sendError)(res, 'You do not have access to this workspace', 403);
        }
        const workspace = await Workspace_1.default.findById(workspaceId);
        if (!workspace) {
            return (0, response_1.sendError)(res, 'Workspace not found', 404);
        }
        req.workspace = workspace;
        req.userRole = membership.role;
        next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Workspace access error', 500);
    }
};
exports.workspaceOverlay = workspaceOverlay;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return (0, response_1.sendError)(res, 'You do not have permission to perform this action', 403);
        }
        next();
    };
};
exports.authorize = authorize;
