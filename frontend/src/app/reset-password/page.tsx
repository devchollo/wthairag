'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Loader2, Terminal, ShieldCheck } from 'lucide-react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            if (res.ok) {
                router.push('/login?reset=success');
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to reset password');
            }
        } catch (e) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center">
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest">Invalid or missing recovery token.</p>
                </div>
                <Link href="/login" className="btn-secondary w-full h-11 justify-center">Return to Login</Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">New Security Key</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl pl-11 pr-4 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                            placeholder="Min. 8 characters"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Confirm Key</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl pl-11 pr-4 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                            placeholder="Re-enter password"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="btn-primary w-full h-11 gap-2"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Secure New Password
            </button>
        </form>
    );
}

export default function ResetPassword() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface-light p-4 animate-in fade-in duration-500">
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors">
                <Terminal className="h-4 w-4" /> WorkToolsHub
            </Link>

            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black tracking-tighter text-text-primary mb-2">Secure Reset.</h1>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Define new access credentials</p>
                </div>

                <div className="card p-8 bg-white border-2 border-border-light shadow-xl">
                    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
