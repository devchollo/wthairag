'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight, Activity, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const mockData = {
            user: { name: 'Demo User', email },
            token: 'mock-token',
            memberships: [{ workspaceId: { name: 'Engineering Core', slug: 'engineering-core' } }]
        };
        login(mockData);
        window.location.href = '/workspace/dashboard';
    };

    return (
        <div className="mx-auto max-w-[400px] px-6 py-20 bg-white">
            <div className="card shadow-2xl shadow-black/5">
                <div className="text-center mb-8">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-4">
                        <Terminal size={20} />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter text-text-primary">
                        Access Hub Console.
                    </h1>
                    <p className="mt-2 text-xs text-text-muted font-bold tracking-tight">
                        Log in to manage your AI RAG context and utilities.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                        <input
                            type="email"
                            placeholder="Professional Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-10 w-full rounded-lg border border-border-light bg-surface-light pl-10 pr-4 text-sm font-bold outline-none focus:border-blue-600"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                        <input
                            type="password"
                            placeholder="Security Key"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-10 w-full rounded-lg border border-border-light bg-surface-light pl-10 pr-4 text-sm font-bold outline-none focus:border-blue-600"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full gap-2 mt-4">
                        Initialize Session
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border-light text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-text-muted">
                        Need Access? <Link href="/signup" className="text-blue-600 hover:underline ml-1">Secure Signup</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
