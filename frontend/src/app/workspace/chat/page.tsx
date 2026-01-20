'use client';

import { useState } from 'react';
import { Send, User, Bot, BookOpen } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    citations?: string[];
}

export default function RAGChat() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your AI assistant. Ask me anything about your uploaded documents in the knowledge base.' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        const newMessages: Message[] = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');

        // Mock AI Response
        setTimeout(() => {
            setMessages([...newMessages, {
                role: 'assistant',
                content: 'Based on the Company Handbook, the vacation policy is 20 days per year, accruable after the 6th month of employment.',
                citations: ['Handbook.pdf, Page 12']
            } as Message]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-160px)]">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    AI RAG Chat
                </h1>
                <p className="text-text-secondary dark:text-muted mt-1">Context-aware productivity assistant.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pb-8">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[80%] gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${m.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-surface-light text-text-secondary dark:bg-surface-dark'}`}>
                                {m.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                            </div>
                            <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${m.role === 'assistant' ? 'bg-surface-light text-text-primary dark:bg-surface-dark dark:text-text-dark' : 'bg-primary text-white'}`}>
                                {m.content}
                                {m.citations && (
                                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border-light pt-3 dark:border-border-dark">
                                        {m.citations.map((cite, i) => (
                                            <div key={i} className="flex items-center gap-1.5 rounded bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary dark:bg-background-dark">
                                                <BookOpen className="h-3 w-3" />
                                                {cite}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex gap-3">
                <input
                    type="text"
                    placeholder="Ask a question about your documents..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="h-11 flex-1 rounded-lg border border-border-light bg-white px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark"
                />
                <button
                    onClick={handleSend}
                    className="btn-primary h-11 w-11 p-0 flex items-center justify-center"
                    disabled={!input.trim()}
                >
                    <Send className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

