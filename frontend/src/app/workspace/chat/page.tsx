'use client';

import { useState } from 'react';
import { Send, User, Bot, BookOpen, Terminal, Activity } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    citations?: string[];
}

export default function RAGChat() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Protocol Active. Your knowledge vaults (2 docs) are synchronized. How can I assist with your workflow today?' }
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
                content: 'Refactoring task context: Your internal "Backend Architecture" documentation recommends using an isolated proxy for cross-domain auth. Would you like me to draft a configuration?',
                citations: ['Backend_Specs.md, Page 4']
            } as Message]);
        }, 800);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
            <div className="mb-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                    <Terminal className="h-3.5 w-3.5" /> Workspace / RAG Console
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-text-primary">AI Contextual Assistant.</h1>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 px-1">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[85%] gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${m.role === 'assistant' ? 'bg-blue-600 text-white' : 'bg-surface-light text-text-secondary border border-border-light'}`}>
                                {m.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                            <div className={`rounded-xl px-4 py-3 text-sm font-bold leading-relaxed shadow-sm ${m.role === 'assistant' ? 'bg-white border border-border-light text-text-primary' : 'bg-blue-600 text-white'}`}>
                                {m.content}
                                {m.citations && (
                                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border-light pt-3">
                                        {m.citations.map((cite, i) => (
                                            <div key={i} className="flex items-center gap-1.5 rounded bg-surface-light px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600 border border-border-light">
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

            <div className="mt-2 flex gap-2 bg-surface-light p-2 rounded-xl border border-border-light">
                <input
                    type="text"
                    placeholder="Query your knowledge base..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="h-10 flex-1 bg-transparent px-4 text-sm font-bold outline-none placeholder:text-text-muted"
                />
                <button
                    onClick={handleSend}
                    className="btn-primary h-10 w-10 p-0 shadow-none hover:shadow-lg"
                    disabled={!input.trim()}
                >
                    <Send className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
