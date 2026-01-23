import { Request, Response } from 'express';
import crypto from 'crypto';
import Chat from '../models/Chat';
import Alert from '../models/Alert';
import Document from '../models/Document';
import DocumentChunk from '../models/DocumentChunk';
import UsageLog from '../models/UsageLog';
import ResponseCache from '../models/ResponseCache';
import { sendSuccess, sendError } from '../utils/response';
import { AIService } from '../services/aiService';

const normalizeQuery = (query: string) => query.trim().toLowerCase().replace(/\s+/g, ' ');
const hashText = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const estimateTokens = (text: string) => Math.ceil(text.length / 4);
const clampText = (text: string, maxChars: number) => {
    if (text.length <= maxChars) return text;
    return `${text.slice(0, maxChars).trim()}...`;
};

const isAlertRelevant = (query: string, alerts: any[]) => {
    if (!alerts.length) return false;
    const normalized = normalizeQuery(query);
    const securityKeywords = ['alert', 'security', 'incident', 'vulnerability', 'breach', 'risk', 'severity', 'cve', 'threat'];
    if (securityKeywords.some(keyword => normalized.includes(keyword))) return true;

    const queryTerms = normalized.split(' ').filter(term => term.length > 3);
    return alerts.some(alert => {
        const haystack = `${alert.title} ${alert.description || ''}`.toLowerCase();
        return queryTerms.some(term => haystack.includes(term));
    });
};

const buildContext = (params: {
    header: string;
    documents: Array<{ title: string; content?: string; summary?: string; score?: number }>;
    alerts: Array<{ title: string; description?: string; severity?: string; status?: string }>;
    tokenBudget: number;
}) => {
    const { header, documents, alerts, tokenBudget } = params;
    let context = `${header}\n`;
    let usedTokens = estimateTokens(context);

    for (const doc of documents) {
        const snippet = doc.summary?.trim() || doc.content?.trim() || '';
        if (!snippet) continue;
        const line = `- [${doc.title}]${doc.score ? ` (Score: ${doc.score.toFixed(3)})` : ''}: ${clampText(snippet, 800)}\n`;
        const lineTokens = estimateTokens(line);
        if (usedTokens + lineTokens > tokenBudget) break;
        context += line;
        usedTokens += lineTokens;
    }

    if (alerts.length) {
        context += "\nSecurity Alerts:\n";
        usedTokens = estimateTokens(context);
        for (const alert of alerts) {
            const description = alert.description ? clampText(alert.description, 400) : 'No description';
            const line = `- ${alert.title} [${alert.severity}]: ${description} (Status: ${alert.status})\n`;
            const lineTokens = estimateTokens(line);
            if (usedTokens + lineTokens > tokenBudget) break;
            context += line;
            usedTokens += lineTokens;
        }
    }

    return context.trim();
};

const getMaxTokensForQuery = (query: string) => {
    const length = query.trim().length;
    if (length < 200) return 400;
    if (length < 600) return 700;
    return 1000;
};

export const queryChat = async (req: Request, res: Response) => {
    try {
        const { chatId, query } = req.body;
        const workspaceId = req.workspace?._id;
        const normalizedQuery = normalizeQuery(query);
        const queryHash = hashText(normalizedQuery);

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

        // RAG logic: Vector Search with Fallback
        let documents: any[] = [];
        let context = "";
        let contextHeader = "Retrieved Context:";

        try {
            // Generate Query Embedding
            const queryEmbedding = await AIService.generateEmbedding(query);

            // Vector Search Aggregation
            // NOTE: Requires 'vector_index' to be created in MongoDB Atlas on the 'embedding' field
            documents = await DocumentChunk.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embedding",
                        queryVector: queryEmbedding,
                        numCandidates: 100,
                        limit: 5
                    }
                },
                {
                    $lookup: {
                        from: "documents",
                        localField: "documentId",
                        foreignField: "_id",
                        as: "document"
                    }
                },
                { $unwind: "$document" },
                {
                    $project: {
                        _id: 1,
                        content: 1,
                        summary: 1,
                        title: "$document.title",
                        documentId: 1,
                        updatedAt: 1,
                        score: { $meta: "vectorSearchScore" }
                    }
                }
            ]);

            if (documents.length > 0) {
                console.log('Vector search successful, found chunks:', documents.length);
            } else {
                console.log('Vector search returned no results. Falling back to recent documents.');
                throw new Error('No vector results');
            }

        } catch (err) {
            console.log('Vector search failed or not configured, reverting to simple recent-doc fetch.', err);
            // Fallback: Fetch recent 5 documents (Legacy behavior)
            const recentDocs = await Document.find({ workspaceId }).sort('-createdAt').limit(5);
            documents = recentDocs.map(d => ({
                title: d.title,
                content: d.content ? d.content.substring(0, 1500) : '',
                summary: d.summary,
                _id: d._id,
                updatedAt: d.updatedAt
            }));

            contextHeader = "Recent Knowledge Base Information (Vector Search Unavailable):";
        }

        // Always fetch alerts as high priority context
        const alerts = await Alert.find({ workspaceId }).sort('-createdAt').limit(5);
        const relevantAlerts = isAlertRelevant(query, alerts) ? alerts.slice(0, 3) : [];

        const contextHash = hashText(JSON.stringify({
            documents: documents.map(doc => ({
                id: doc._id || doc.documentId,
                updatedAt: doc.updatedAt,
                score: doc.score
            })),
            alerts: relevantAlerts.map(alert => ({ id: alert._id, updatedAt: alert.updatedAt }))
        }));

        const cachedResponse = await ResponseCache.findOne({
            workspaceId,
            queryHash,
            contextHash,
            expiresAt: { $gt: new Date() }
        });

        if (cachedResponse) {
            const userMessage = { role: 'user', content: query, createdAt: new Date() };
            const assistantMessage = {
                role: 'assistant',
                content: cachedResponse.answer,
                citations: cachedResponse.citations,
                createdAt: new Date()
            };

            chat.messages.push(userMessage as any);
            chat.messages.push(assistantMessage as any);
            await chat.save();

            if (req.user && workspaceId) {
                await UsageLog.create({
                    workspaceId,
                    userId: req.user._id,
                    tokens: 0,
                    query: query.substring(0, 500),
                    citedDocuments: cachedResponse.citations.map(c => c.title || c.documentId).filter(Boolean),
                    aiModel: 'cache'
                }).catch(err => console.error('Failed to log usage:', err));
            }

            return sendSuccess(res, { chat, response: assistantMessage }, 'Query processed (cached)');
        }

        context = buildContext({
            header: contextHeader,
            documents,
            alerts: relevantAlerts,
            tokenBudget: 1400
        });

        // Stable System Prompt for Caching
        const systemPrompt = `You are an AI assistant for a technical workspace. 
All your answers must be grounded in the provided 'Retrieved Context' and 'Security Alerts'.

IMPORTANT GUIDELINES:
1. **Refusal Policy**: 
   - If the user's query is not answered by the provided Context or Alerts, YOU MUST REFUSE to answer.
   - Say: "I don't have enough information in the provided knowledge base to answer this question."
   - You may ask a clarifying question if the query is ambiguous.

2. **Scope**: 
   - Answer strictly based on the context.
   - Do NOT use outside knowledge for specific workspace procedures.
   - If asked about generic 3rd party tools (AWS, Slack) NOT in context, refer them to official docs.
   - Example: "I don't have instructions for [Tool] in the knowledge base. Please check official documentation."

3. **Formatting**:
   - Use Markdown (Bold, Code Blocks, Lists).
   - Be concise and professional.

4. **Citations**:
   - Do NOT manually add [Source] citations. The system handles it.
`;

        // CACHING LOGIC: Check for identical queries in the last 24 hours
        // We use UsageLog for this as it tracks queries
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const cachedLog = await UsageLog.findOne({
            workspaceId,
            query: query.trim(), // simple match
            createdAt: { $gt: oneDayAgo }
        }).sort('-createdAt'); // Get most recent

        // If we found a recent query, we *could* try to find the chat message response. 
        // However, UsageLog doesn't store the *answer*. Chat does.
        // Let's try to find a Chat message with this content from the user, then find the assistant response after it.
        let cachedAnswer = null;
        let cachedCitations = [];

        if (cachedLog) {
            // Find the chat where this query happened
            // This is a bit complex without a direct link, but let's try a simple optimized approach for "Already Queried Topics"
            // We will skip full re-generation if the exact same query was asked by THIS user in this chat recently.
            // But the user asked for "already queried topics" which implies workspace-wide.
            // For safety and simplicity, let's implement checking THIS chat first to avoid double-sends, 
            // and if we really want to save tokens, we need a response cache. 
            // Since we don't have a separate cache collection, we will skip implementation of complex cross-chat caching to avoid bugs.
            // Instead, we will focus on the "save token cost" request by creating a simple in-memory cache or using the UsageLog to skip logging if repeated? No, that doesn't save generation cost.

            // Re-evaluating: To save token cost, we MUST return a previous answer. 
            // Let's assume (for now) we only cache PER USER queries to avoid leaking info between users if RAG context changes.
        }

        // Call AI Service
        const aiResponse = await AIService.getQueryResponse(
            query,
            context,
            workspaceId as any,
            systemPrompt,
            getMaxTokensForQuery(query)
        );

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
                aiModel: 'gpt-4o-mini'
            }).catch(err => console.error('Failed to log usage:', err));
        }

        await ResponseCache.findOneAndUpdate(
            { workspaceId, queryHash, contextHash },
            {
                workspaceId,
                queryHash,
                contextHash,
                answer: aiResponse.answer,
                citations: enhancedCitations,
                tokensUsed: aiResponse.tokensUsed || 0,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            },
            { upsert: true, new: true }
        );

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
