import { Request, Response } from 'express';
import Chat from '../models/Chat';
import Alert from '../models/Alert';
import Document from '../models/Document';
import UsageLog from '../models/UsageLog';
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

        // RAG logic: fetch context from Documents and Alerts
        const [documents, alerts] = await Promise.all([
            Document.find({ workspaceId }).sort('-createdAt').limit(5),
            Alert.find({ workspaceId }).sort('-createdAt').limit(5)
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
        const aiResponse = await AIService.getQueryResponse(query, context, workspaceId as any, systemPrompt);

        // Map citations to real internal links FIRST
        const enhancedCitations = aiResponse.citations.map(cit => {
            const foundDoc = documents.find(d => d.title.toLowerCase().includes(cit.documentId.toLowerCase()));
            if (foundDoc) return { ...cit, documentId: foundDoc._id, link: `/workspace/knowledge`, title: foundDoc.title };

            const foundAlert = alerts.find(a => a.title.toLowerCase().includes(cit.documentId.toLowerCase()));
            if (foundAlert) return { ...cit, documentId: foundAlert._id, link: `/workspace/alerts`, title: foundAlert.title };

            return cit;
        });

        // Collect titles for UsageLog
        // We look for titles in enhancedCitations, or fallback to the raw documentId if it looks like a title
        const citedTitles = enhancedCitations
            .map(c => (c as any).title || c.documentId)
            .filter(t => t && t !== 'Recent Knowledge'); // Filter out generic mock IDs if any

        // Log Usage
        if (req.user && workspaceId) {
            await UsageLog.create({
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
