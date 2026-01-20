"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAlert = exports.listAlerts = exports.createAlert = void 0;
const Alert_1 = __importDefault(require("../models/Alert"));
const response_1 = require("../utils/response");
const createAlert = async (req, res) => {
    try {
        const { title, description, severity } = req.body;
        const alert = await Alert_1.default.create({
            workspaceId: req.workspace?._id,
            title,
            description,
            severity,
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
        const alerts = await Alert_1.default.find({ workspaceId: req.workspace?._id }).sort('-createdAt');
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
            resolvedBy: req.user?._id
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
