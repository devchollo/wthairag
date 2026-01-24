import axios from 'axios';

export interface AICitation {
    documentId: string;
    snippet: string;
    link?: string;
}

export interface AIResponse {
    answer: string;
    citations: AICitation[];
    tokensUsed?: number;
    modelUsed: string;
    modelReason?: string;
}

export class AIService {
    private static openaiKey = process.env.OPENAI_API_KEY;
    private static geminiKey = process.env.GEMINI_API_KEY;
    private static readonly DEFAULT_CHAT_MODEL = 'gpt-4o';
    private static readonly HARD_CHAT_MODEL = 'gpt-4.1-mini';

    private static estimateTokens(text: string) {
        return Math.ceil(text.length / 4);
    }

    private static chooseChatModel(query: string, context: string, maxTokens: number) {
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
        const isHardContext =
            contextTokens >= 1800 ||
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

    static async generateReport(type: string, data: any) {
        if (!this.openaiKey) {
            throw new Error('OpenAI API Key is not configured.');
        }

        const prompt = `Generate an advanced technical report for a ${type} tool. Data: ${JSON.stringify(data)}. Tone: Professional, helpful.`;

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: this.DEFAULT_CHAT_MODEL,
                    messages: [
                        { role: 'system', content: 'You are a helpful AI assistant.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.5,
                    max_tokens: 1000
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.openaiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error: any) {
            console.error('AI Service Error:', error.response?.data || error.message);
            return `### Advanced ${type} Analysis\n\nI encountered an error communicating with the AI provider. Please check the system logs.`;
        }
    }

    static async generateEmbedding(text: string): Promise<number[]> {
        if (!this.openaiKey) {
            throw new Error('OpenAI API Key is not configured.');
        }

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/embeddings',
                {
                    model: 'text-embedding-3-small',
                    input: text.replace(/\n/g, ' ')
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.openaiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.data[0].embedding;
        } catch (error: any) {
            console.error('Embedding Error:', error.response?.data || error.message);
            throw new Error('Failed to generate embedding');
        }
    }

    static async getQueryResponse(
        query: string,
        context: string,
        workspaceId: string,
        systemPrompt?: string,
        maxTokens: number = 1000
    ): Promise<AIResponse> {
        if (!this.openaiKey) {
            throw new Error('OpenAI API Key is not configured.');
        }

        try {
            const messages = [
                { role: 'system', content: systemPrompt || 'You are a helpful AI assistant.' },
                { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` }
            ];

            const selection = this.chooseChatModel(query, context, maxTokens);
            console.log(
                `AI model selected: ${selection.model} (${selection.reason}).`,
                selection.diagnostics
            );

            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: selection.model,
                    messages,
                    temperature: 0.1, // Lower temperature for more grounded response
                    max_tokens: maxTokens
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.openaiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const answer = response.data.choices[0].message.content;
            const tokensUsed = response.data.usage?.total_tokens || 0;

            return {
                answer,
                citations: [], // citations matching in controller
                tokensUsed,
                modelUsed: selection.model,
                modelReason: selection.reason
            };
        } catch (error: any) {
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
