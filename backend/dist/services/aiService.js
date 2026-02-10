"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const axios_1 = __importDefault(require("axios"));
class AIService {
    static estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
    static chooseChatModel(query, context, maxTokens) {
        const queryTokens = this.estimateTokens(query);
        const contextTokens = this.estimateTokens(context);
        const totalRequestedTokens = queryTokens + contextTokens + maxTokens;
        const normalizedQuery = query.toLowerCase();
        const hardTopicKeywords = [
            'architecture',
            'trade-off',
            'tradeoff',
            'deep dive',
            'complex',
            'hard',
            'difficult',
            'multi-step',
            'multi step',
            'analyze',
            'analysis',
            'reason',
            'debug',
            'optimize',
            'optimization',
            'strategy',
            'algorithm',
            'compare',
            'evaluation',
            'threat model',
            'postmortem'
        ];
        const hasHardKeyword = hardTopicKeywords.some(keyword => normalizedQuery.includes(keyword));
        const isHardContext = contextTokens >= 1800 ||
            totalRequestedTokens >= 2600 ||
            maxTokens >= 900 ||
            queryTokens >= 700 ||
            hasHardKeyword;
        if (isHardContext) {
            const reason = hasHardKeyword
                ? 'hard-topic keyword detected'
                : 'high token demand detected';
            return {
                model: this.HARD_CHAT_MODEL,
                reason,
                diagnostics: { queryTokens, contextTokens, totalRequestedTokens }
            };
        }
        return {
            model: this.DEFAULT_CHAT_MODEL,
            reason: 'default model for standard contexts',
            diagnostics: { queryTokens, contextTokens, totalRequestedTokens }
        };
    }
    static async generateReport(type, data) {
        if (!this.openaiKey) {
            throw new Error('OpenAI API Key is not configured.');
        }
        const prompt = `Generate an advanced technical report for a ${type} tool. Data: ${JSON.stringify(data)}. Tone: Professional, helpful.`;
        try {
            const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                model: this.DEFAULT_CHAT_MODEL,
                messages: [
                    { role: 'system', content: 'You are a helpful AI assistant.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                max_tokens: 1000
            }, {
                headers: {
                    Authorization: `Bearer ${this.openaiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error('AI Service Error:', error.response?.data || error.message);
            return `### Advanced ${type} Analysis\n\nI encountered an error communicating with the AI provider. Please check the system logs.`;
        }
    }
    static async generateEmbedding(text) {
        if (!this.openaiKey) {
            throw new Error('OpenAI API Key is not configured.');
        }
        try {
            const response = await axios_1.default.post('https://api.openai.com/v1/embeddings', {
                model: 'text-embedding-3-small',
                input: text.replace(/\n/g, ' ')
            }, {
                headers: {
                    Authorization: `Bearer ${this.openaiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data[0].embedding;
        }
        catch (error) {
            console.error('Embedding Error:', error.response?.data || error.message);
            throw new Error('Failed to generate embedding');
        }
    }
    static async getQueryResponse(query, context, workspaceId, systemPrompt, maxTokens = 1000) {
        if (!this.openaiKey) {
            throw new Error('OpenAI API Key is not configured.');
        }
        try {
            const messages = [
                { role: 'system', content: systemPrompt || 'You are a helpful AI assistant.' },
                { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` }
            ];
            const selection = this.chooseChatModel(query, context, maxTokens);
            console.log(`AI model selected: ${selection.model} (${selection.reason}).`, selection.diagnostics);
            const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                model: selection.model,
                messages,
                temperature: 0.1, // Lower temperature for more grounded response
                max_tokens: maxTokens
            }, {
                headers: {
                    Authorization: `Bearer ${this.openaiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const answer = response.data.choices[0].message.content;
            const tokensUsed = response.data.usage?.total_tokens || 0;
            const inputTokens = response.data.usage?.prompt_tokens || 0;
            const outputTokens = response.data.usage?.completion_tokens || 0;
            return {
                answer,
                citations: [], // citations matching in controller
                tokensUsed,
                inputTokens,
                outputTokens,
                modelUsed: selection.model,
                modelReason: selection.reason
            };
        }
        catch (error) {
            console.error('AI Service Error:', error.response?.data || error.message);
            return {
                answer: 'I encountered an error communicating with the AI provider. Please check the system logs.',
                citations: [],
                modelUsed: this.DEFAULT_CHAT_MODEL,
                modelReason: 'fallback after provider error'
            };
        }
    }
}
exports.AIService = AIService;
AIService.openaiKey = process.env.OPENAI_API_KEY;
AIService.geminiKey = process.env.GEMINI_API_KEY;
AIService.DEFAULT_CHAT_MODEL = 'gpt-4o';
AIService.HARD_CHAT_MODEL = 'gpt-4.1-mini';
