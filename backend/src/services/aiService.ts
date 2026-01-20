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
        const prompt = `Generate an advanced technical report for a ${type} tool. Data: ${JSON.stringify(data)}. Tone: Professional, helpful.`;

        // In a real implementation, call OpenAI or Gemini here
        // For now, returning a high-quality mock report
        return `### Advanced ${type} Analysis\n\nBased on the data provided, the configuration is optimal. ${data.domain ? `Domain ${data.domain} is resolving correctly across all major global regions.` : ''}\n\n**Recommendations:**\n- Maintain current security headers.\n- Monitor DNS propagation regularly.`;
    }

    static async getQueryResponse(query: string, context: string, workspaceId: string, systemPrompt?: string): Promise<AIResponse> {
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
                    model: 'gpt-4o', // or gpt-3.5-turbo if preferred for cost
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1000
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

            // Extract citations if the AI mentions them, or we can just infer them from context presence
            // For now, we reuse the context-based inference from the controller, but return empty here
            // or we could ask the AI to output JSON with citations.
            // Keeping it simple to match the controller's expectation of { answer, citations }
            // The controller RE-GENERATES citations based on string matching, so we can pass empty or basic ones.

            return {
                answer: answer,
                citations: [], // Controller logic currently handles citation matching
                tokensUsed
            };

        } catch (error: any) {
            console.error("AI Service Error:", error.response?.data || error.message);
            // Fallback to error message so user knows what happened
            return {
                answer: "I encountered an error communicating with the AI provider. Please check the system logs.",
                citations: []
            };
        }
    }
}
