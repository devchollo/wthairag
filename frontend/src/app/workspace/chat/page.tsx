'use client';

import { useState } from 'react';
import styles from './chat.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    citations?: string[];
}

export default function RAGChat() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your AI assistant. Ask me anything about your uploaded documents.' }
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
                content: 'Based on the Company Handbook, the vacation policy is 20 days per year.',
                citations: ['Handbook.pdf, Page 12']
            } as Message]);
        }, 1000);
    };

    return (
        <div className={styles.chatContainer}>
            <h1>AI RAG Chat</h1>
            <div className={`${styles.chatBox} glass`}>
                {messages.map((m, i) => (
                    <div key={i} className={`${styles.message} ${styles[m.role]}`}>
                        <div className={styles.bubble}>
                            {m.content}
                            {m.citations && (
                                <div className={styles.citations}>
                                    <strong>Citations:</strong> {m.citations.join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.inputArea}>
                <input
                    type="text"
                    placeholder="Ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} className="btn-primary">Send</button>
            </div>
        </div>
    );
}
