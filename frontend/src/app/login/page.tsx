'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight, Terminal, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/workspace/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <Terminal className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            // Call login endpoint
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');

            // Fetch user profile with memberships
            const meRes = await fetch(`${apiUrl}/api/auth/me`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const meData = await meRes.json();

            if (!meRes.ok) throw new Error('Failed to fetch profile');

            // Update auth context
            login({
                user: meData.data.user,
                memberships: meData.data.memberships
            });

            // Redirect to workspace
            router.push('/workspace/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid email or password. Please try again.');
            setIsSubmitting(false);
        }
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
                            disabled={loading}
                            autoComplete="username"
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
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-xs font-semibold bg-red-50 p-3 rounded-lg border border-red-200">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary w-full gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Authenticating...
                            </>
                        ) : (
                            <>
                                Initialize Session
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
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
