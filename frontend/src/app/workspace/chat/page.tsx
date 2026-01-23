'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, BookOpen, Terminal, Activity, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    citations?: Array<{ documentId: string; snippet: string; link?: string }>;
}

export default function RAGChat() {
    const { currentWorkspace } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const fetchInitialChat = async () => {
            if (!currentWorkspace?._id || hasInitialized.current) return;
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${apiUrl}/api/workspace-data/chat`, {
                    headers: {
                        'x-workspace-id': currentWorkspace._id,
                        'x-workspace-slug': currentWorkspace.slug || ''
                    },
                    credentials: 'include'
                });
                const data = await res.json();
                if (res.ok && data.data.length > 0) {
                    setChatId(data.data[0]._id);
                    setMessages(data.data[0].messages);
                } else {
                    setMessages([{ role: 'assistant', content: 'Protocol Active. Your knowledge base is synchronized. How can I assist with your workflow today?' }]);
                }
                hasInitialized.current = true;
            } catch (e) {
                console.error("Failed to fetch chats", e);
            }
        };

        fetchInitialChat();
    }, [currentWorkspace?._id]);

    const handleSend = async () => {
        if (!input.trim() || !currentWorkspace?._id) return;

        const userQuery = input;
        setInput('');
        const newMessages: Message[] = [...messages, { role: 'user', content: userQuery }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspace-data/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-workspace-id': currentWorkspace._id,
                    'x-workspace-slug': currentWorkspace.slug || ''
                },
                body: JSON.stringify({ chatId, query: userQuery }),
                credentials: 'include'
            });

            const data = await res.json();
            if (res.ok) {
                setChatId(data.data.chat._id);
                setMessages(data.data.chat.messages);
            }
        } catch (e) {
            console.error("Query failed", e);
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = () => {
        setChatId(null);
        setMessages([{ role: 'assistant', content: 'Protocol Active. Your knowledge base is synchronized. How can I assist with your workflow today?' }]);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                        <Terminal className="h-3.5 w-3.5" /> Workspace / RAG Console
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-text-primary">AI Contextual Assistant.</h1>
                </div>
                <button
                    onClick={startNewChat}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 h-10 px-4 rounded-xl border-2 border-border-light hover:border-blue-600/30 transition-all font-mono"
                >
                    <Plus className="h-3.5 w-3.5" /> Reboot Session
                </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 px-1 pb-4 scroll-smooth">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[85%] gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${m.role === 'assistant' ? 'bg-blue-600 text-white' : 'bg-surface-light text-text-secondary border border-border-light'}`}>
                                {m.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                            <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm ${m.role === 'assistant' ? 'bg-white border border-border-light text-text-primary' : 'bg-blue-600 text-white font-bold'}`}>
                                {m.role === 'assistant' ? (
                                    <div className="markdown-content">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed font-medium">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
                                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                                h1: ({ children }) => <h1 className="text-xl font-black tracking-tight mb-2 mt-4">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-lg font-bold tracking-tight mb-2 mt-3">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-base font-bold mb-1 mt-2">{children}</h3>,
                                                code: ({ className, children, ...props }: any) => {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    const isInline = !match && !String(children).includes('\n');
                                                    return isInline ? (
                                                        <code className="bg-surface-dark/10 dark:bg-surface-light/10 rounded px-1.5 py-0.5 font-mono text-xs font-bold" {...props}>
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <div className="rounded-lg bg-gray-900 text-gray-100 p-3 my-3 overflow-x-auto font-mono text-xs shadow-md">
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        </div>
                                                    );
                                                },
                                                blockquote: ({ children }) => (
                                                    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-r-lg italic text-text-muted">
                                                        {children}
                                                    </blockquote>
                                                ),
                                                a: ({ href, children }) => (
                                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                                                        {children}
                                                    </a>
                                                ),
                                            }}
                                        >
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    m.content
                                )}
                                {m.citations && m.citations.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border-light pt-3">
                                        {m.citations.map((cite, i) => (
                                            <Link
                                                key={i}
                                                href={cite.link || '#'}
                                                className="group relative flex items-center gap-1.5 rounded bg-surface-light px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600 border border-border-light hover:border-blue-300 transition-colors"
                                            >
                                                <BookOpen className="h-3 w-3" />
                                                Source {i + 1}
                                                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-2 bg-text-primary text-white text-[10px] rounded-lg shadow-xl z-10 normal-case">
                                                    {cite.snippet}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex h-8 items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                            <Activity className="h-3.5 w-3.5 animate-spin" /> Analyzing Knowledge Vault...
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-2 flex gap-2 bg-surface-light p-2 rounded-xl border border-border-light">
                <input
                    type="text"
                    placeholder="Query your knowledge base..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={loading}
                    className="h-10 flex-1 bg-transparent px-4 text-sm font-bold outline-none placeholder:text-text-muted"
                />
                <button
                    onClick={handleSend}
                    className="btn-primary h-10 w-10 p-0 shadow-none hover:shadow-lg disabled:opacity-50"
                    disabled={!input.trim() || loading}
                >
                    <Send className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
