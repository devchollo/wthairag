"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChats = exports.queryChat = void 0;
const Chat_1 = __importDefault(require("../models/Chat"));
const Alert_1 = __importDefault(require("../models/Alert"));
const response_1 = require("../utils/response");
const aiService_1 = require("../services/aiService");
const queryChat = async (req, res) => {
    try {
        const { chatId, query } = req.body;
        const workspaceId = req.workspace?._id;
        let chat;
        if (chatId) {
            chat = await Chat_1.default.findOne({ _id: chatId, workspaceId });
        }
        if (!chat) {
            chat = await Chat_1.default.create({
                workspaceId,
                userId: req.user?._id,
                messages: [],
            });
        }
        // RAG logic: fetch context
        // For now, static context placeholder
        const context = "Global context for the workspace...";
        // Check for resolved alerts to mention
        const resolvedAlerts = await Alert_1.default.find({ workspaceId, status: 'resolved' }).limit(3);
        let alertDisclosure = "";
        if (resolvedAlerts.length > 0) {
            alertDisclosure = "\n\nNote: The following alerts have been marked as resolved: " +
                resolvedAlerts.map(a => a.title).join(", ") + ".";
        }
        // Call AI Service
        const aiResponse = await aiService_1.AIService.getQueryResponse(query, context, workspaceId);
        const userMessage = { role: 'user', content: query, createdAt: new Date() };
        const assistantMessage = {
            role: 'assistant',
            content: aiResponse.answer + alertDisclosure,
            citations: aiResponse.citations,
            createdAt: new Date()
        };
        chat.messages.push(userMessage);
        chat.messages.push(assistantMessage);
        await chat.save();
        return (0, response_1.sendSuccess)(res, { chat, response: assistantMessage }, 'Query processed');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.queryChat = queryChat;
const getChats = async (req, res) => {
    try {
        const chats = await Chat_1.default.find({ workspaceId: req.workspace?._id, userId: req.user?._id }).sort('-updatedAt');
        return (0, response_1.sendSuccess)(res, chats, 'Chats fetched');
    }
    catch (error) {
        return (0, response_1.sendError)(res, error.message, 500);
    }
};
exports.getChats = getChats;
