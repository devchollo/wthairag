"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChats = exports.queryChat = void 0;
const Chat_1 = __importDefault(require("../models/Chat"));
const Alert_1 = __importDefault(require("../models/Alert"));
const Document_1 = __importDefault(require("../models/Document"));
const UsageLog_1 = __importDefault(require("../models/UsageLog"));
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
        // RAG logic: fetch context from Documents and Alerts
        const [documents, alerts] = await Promise.all([
            Document_1.default.find({ workspaceId }).sort('-createdAt').limit(5),
            Alert_1.default.find({ workspaceId }).sort('-createdAt').limit(5)
        ]);
        let context = "Knowledge Base Information:\n";
        documents.forEach(doc => {
            const snippet = doc.content ? doc.content.substring(0, 1500) : 'No content';
            context += `- ${doc.title}: ${snippet}...\n`;
        });
        context += "\nSecurity Alerts:\n";
        alerts.forEach(alert => {
            context += `- ${alert.title} [${alert.severity}]: ${alert.description || 'No description'} (Status: ${alert.status})\n`;
        });
        const systemPrompt = `You are an AI assistant for a technical workspace. Use the provided Knowledge Base and Security Alert context to answer questions. 
         IMPORTANT: 
         - Provide complete, detailed technical answers. Do not truncate or summarize too briefly.
         - Ensure the topic is within the scope of the provided context or general technical support. If it is unsupported 3rd party software not present in the context, kindly inform the user.
         - DO NOT include inline citations like [1] or [Source 1] or "According to document...". 
         - Simply answer the question naturally based on the context. The system will handle tagging sources below your message.`;
        // Call AI Service
        const aiResponse = await aiService_1.AIService.getQueryResponse(query, context, workspaceId, systemPrompt);
        // Map citations to real internal links FIRST
        const enhancedCitations = aiResponse.citations.map(cit => {
            const foundDoc = documents.find(d => d.title.toLowerCase().includes(cit.documentId.toLowerCase()));
            if (foundDoc)
                return { ...cit, documentId: foundDoc._id, link: `/workspace/knowledge`, title: foundDoc.title };
            const foundAlert = alerts.find(a => a.title.toLowerCase().includes(cit.documentId.toLowerCase()));
            if (foundAlert)
                return { ...cit, documentId: foundAlert._id, link: `/workspace/alerts`, title: foundAlert.title };
            return cit;
        });
        // Collect titles for UsageLog
        // We look for titles in enhancedCitations, or fallback to the raw documentId if it looks like a title
        const citedTitles = enhancedCitations
            .map(c => c.title || c.documentId)
            .filter(t => t && t !== 'Recent Knowledge'); // Filter out generic mock IDs if any
        // Log Usage
        if (req.user && workspaceId) {
            await UsageLog_1.default.create({
                workspaceId,
                userId: req.user._id,
                tokens: aiResponse.tokensUsed || 0,
                query: query.substring(0, 500),
                citedDocuments: citedTitles,
                aiModel: 'gpt-4o'
            }).catch(err => console.error('Failed to log usage:', err));
        }
        const userMessage = { role: 'user', content: query, createdAt: new Date() };
        // enhancedCitations already calculated above
        const assistantMessage = {
            role: 'assistant',
            content: aiResponse.answer,
            citations: enhancedCitations,
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
