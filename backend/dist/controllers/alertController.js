"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAlertView = exports.deleteAlert = exports.updateAlert = exports.resolveAlert = exports.listAlerts = exports.createAlert = void 0;
const Alert_1 = __importDefault(require("../models/Alert"));
const UsageLog_1 = __importDefault(require("../models/UsageLog"));
const response_1 = require("../utils/response");
const usageSummaryService_1 = require("../services/usageSummaryService");
const createAlert = async (req, res) => {
    try {
        const { title, description, severity } = req.body;
        const alert = await Alert_1.default.create({
            workspaceId: req.workspace?._id,
            title,
            description,
            severity,
            createdBy: req.user?._id,
            updatedBy: req.user?._id,
        });
        return (0, response_1.sendSuccess)(res, alert, 'Alert created', 201);
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.createAlert = createAlert;
const listAlerts = async (req, res) => {
    try {
        const alerts = await Alert_1.default.find({ workspaceId: req.workspace?._id })
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort('-createdAt');
        return (0, response_1.sendSuccess)(res, alerts, 'Alerts fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.listAlerts = listAlerts;
const resolveAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const alert = await Alert_1.default.findOneAndUpdate({ _id: id, workspaceId: req.workspace?._id }, {
            status: 'resolved',
            resolvedAt: new Date(),
            resolvedBy: req.user?._id,
            updatedBy: req.user?._id
        }, { new: true });
        if (!alert) {
            return (0, response_1.sendError)(res, 'Alert not found', 404);
        }
        return (0, response_1.sendSuccess)(res, alert, 'Alert resolved');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.resolveAlert = resolveAlert;
const updateAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, severity } = req.body;
        const alert = await Alert_1.default.findOneAndUpdate({ _id: id, workspaceId: req.workspace?._id }, { title, description, severity, updatedBy: req.user?._id }, { new: true, runValidators: true });
        if (!alert)
            return (0, response_1.sendError)(res, 'Alert not found', 404);
        return (0, response_1.sendSuccess)(res, alert, 'Alert updated');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.updateAlert = updateAlert;
const deleteAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const alert = await Alert_1.default.findOneAndDelete({ _id: id, workspaceId: req.workspace?._id });
        if (!alert)
            return (0, response_1.sendError)(res, 'Alert not found', 404);
        return (0, response_1.sendSuccess)(res, null, 'Alert deleted');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.deleteAlert = deleteAlert;
const recordAlertView = async (req, res) => {
    try {
        const { id } = req.params;
        const workspaceId = req.workspace?._id;
        const alert = await Alert_1.default.findOne({ _id: id, workspaceId: req.workspace?._id })
            .select('title updatedAt severity status')
            .lean();
        if (!alert) {
            return (0, response_1.sendError)(res, 'Alert not found', 404);
        }
        if (!req.user?._id) {
            return (0, response_1.sendError)(res, 'User context missing', 400);
        }
        if (!workspaceId) {
            return (0, response_1.sendError)(res, 'Workspace context missing', 400);
        }
        await UsageLog_1.default.create({
            workspaceId,
            userId: req.user?._id,
            tokens: 0,
            inputTokens: 0,
            outputTokens: 0,
            query: alert.title,
            citedDocuments: [alert.title],
            eventType: 'view'
        });
        await (0, usageSummaryService_1.recordUsageSummaryForView)({
            workspaceId: workspaceId.toString(),
            userId: req.user?._id.toString(),
            lastViewed: {
                type: 'alert',
                title: alert.title,
                updatedAt: alert.updatedAt,
                link: '/workspace/alerts',
                severity: alert.severity,
                status: alert.status
            }
        });
        return (0, response_1.sendSuccess)(res, null, 'Alert view recorded');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.recordAlertView = recordAlertView;
