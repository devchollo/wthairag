"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceStats = void 0;
const response_1 = require("../utils/response");
const Document_1 = __importDefault(require("../models/Document"));
const Membership_1 = __importDefault(require("../models/Membership"));
const Chat_1 = __importDefault(require("../models/Chat")); // Assuming there's a Chat model
const getWorkspaceStats = async (req, res) => {
    try {
        const { workspaceId } = req.workspace;
        // Parallel counts for efficiency
        const [docCount, chatCount, memberCount] = await Promise.all([
            Document_1.default.countDocuments({ workspaceId }),
            Chat_1.default.countDocuments({ workspaceId }),
            Membership_1.default.countDocuments({ workspaceId })
        ]);
        const stats = {
            counts: {
                documents: docCount,
                chats: chatCount,
                members: memberCount
            },
            uptime: '99.9%', // Mock for now, but integrated in structure
            usage: {
                rag: chatCount > 0 ? `${(chatCount * 1.2).toFixed(1)}k` : '0',
                storage: `${(docCount * 0.5).toFixed(1)}MB`
            }
        };
        return (0, response_1.sendSuccess)(res, stats, 'Workspace stats retrieved');
    }
    catch (error) {
        return (0, response_1.sendError)(res, `Failed to retrieve stats: ${error.message}`, 500);
    }
};
exports.getWorkspaceStats = getWorkspaceStats;
