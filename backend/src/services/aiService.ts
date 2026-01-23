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
}

export class AIService {
    private static openaiKey = process.env.OPENAI_API_KEY;
    private static geminiKey = process.env.GEMINI_API_KEY;

    static async generateReport(type: string, data: any) {
        if (!this.openaiKey) {
            throw new Error("OpenAI API Key is not configured.");
        }

        const prompt = `Generate an advanced technical report for a ${type} tool. Data: ${JSON.stringify(data)}. Tone: Professional, helpful.`;

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'You are a helpful AI assistant.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.5,
                    max_tokens: 1000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.openaiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error: any) {
            console.error("AI Service Error:", error.response?.data || error.message);
            return `### Advanced ${type} Analysis\n\nI encountered an error communicating with the AI provider. Please check the system logs.`;
        }
    }

    static async generateEmbedding(text: string): Promise<number[]> {
        if (!this.openaiKey) {
            throw new Error("OpenAI API Key is not configured.");
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
                        'Authorization': `Bearer ${this.openaiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.data[0].embedding;
        } catch (error: any) {
            console.error("Embedding Error:", error.response?.data || error.message);
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
            throw new Error("OpenAI API Key is not configured.");
        }

        try {
            const messages = [
                { role: 'system', content: systemPrompt || 'You are a helpful AI assistant.' },
                { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` }
            ];

            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o-mini',
                    messages: messages,
                    temperature: 0.1, // Lower temperature for more grounded response
                    max_tokens: maxTokens
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.openaiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const answer = response.data.choices[0].message.content;
            const tokensUsed = response.data.usage?.total_tokens || 0;

            return {
                answer: answer,
                citations: [], // citations matching in controller
                tokensUsed
            };

        } catch (error: any) {
            console.error("AI Service Error:", error.response?.data || error.message);
            return {
                answer: "I encountered an error communicating with the AI provider. Please check the system logs.",
                citations: []
            };
        }
    }
}
