'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';
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
            memberships: [{ workspaceId: { name: 'My Workspace', slug: 'my-workspace' } }]
        };
        login(mockData);
        window.location.href = '/workspace/dashboard';
    };

    return (
        <div className="mx-auto max-w-[440px] px-4 py-24 sm:py-32">
            <div className="card">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark">
                        Welcome Back
                    </h1>
                    <p className="mt-2 text-sm text-text-secondary dark:text-muted font-medium">
                        Enter your credentials to access your secure vault.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-text-muted" />
                        <input
                            type="email"
                            placeholder="Professional Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 w-full rounded-lg border border-border-light bg-white pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-text-muted" />
                        <input
                            type="password"
                            placeholder="Security Key (Password)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 w-full rounded-lg border border-border-light bg-white pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full gap-2 mt-6">
                        Sign In to Workspace
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border-light text-center dark:border-border-dark">
                    <p className="text-sm font-bold text-text-secondary dark:text-muted">
                        New professional? <Link href="/signup" className="text-primary hover:underline">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
