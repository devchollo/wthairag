import { Request, Response } from 'express';
import Chat from '../models/Chat';
import Alert from '../models/Alert';
import { sendSuccess, sendError } from '../utils/response';
import { AIService } from '../services/aiService';

export const queryChat = async (req: Request, res: Response) => {
    try {
        const { chatId, query } = req.body;
        const workspaceId = req.workspace?._id;

        let chat;
        if (chatId) {
            chat = await Chat.findOne({ _id: chatId, workspaceId });
        }

        if (!chat) {
            chat = await Chat.create({
                workspaceId,
                userId: req.user?._id,
                messages: [],
            });
        }

        // RAG logic: fetch context
        // For now, static context placeholder
        const context = "Global context for the workspace...";

        // Check for resolved alerts to mention
        const resolvedAlerts = await Alert.find({ workspaceId, status: 'resolved' }).limit(3);
        let alertDisclosure = "";
        if (resolvedAlerts.length > 0) {
            alertDisclosure = "\n\nNote: The following alerts have been marked as resolved: " +
                resolvedAlerts.map(a => a.title).join(", ") + ".";
        }

        // Call AI Service
        const aiResponse = await AIService.getQueryResponse(query, context, workspaceId as any);

        const userMessage = { role: 'user', content: query, createdAt: new Date() };
        const assistantMessage = {
            role: 'assistant',
            content: aiResponse.answer + alertDisclosure,
            citations: aiResponse.citations,
            createdAt: new Date()
        };

        chat.messages.push(userMessage as any);
        chat.messages.push(assistantMessage as any);
        await chat.save();

        return sendSuccess(res, { chat, response: assistantMessage }, 'Query processed');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const getChats = async (req: Request, res: Response) => {
    try {
        const chats = await Chat.find({ workspaceId: req.workspace?._id, userId: req.user?._id }).sort('-updatedAt');
        return sendSuccess(res, chats, 'Chats fetched');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};
