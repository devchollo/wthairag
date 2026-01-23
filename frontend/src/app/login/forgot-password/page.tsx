'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle, Terminal } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Failed to send reset email');
            }
        } catch (e) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface-light p-4 animate-in fade-in duration-500">
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors">
                <Terminal className="h-4 w-4" /> WorkToolsHub
            </Link>

            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black tracking-tighter text-text-primary mb-2">Recovery Protocol.</h1>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Initiate secure password reset</p>
                </div>

                <div className="card p-8 bg-white border-2 border-border-light shadow-xl">
                    {success ? (
                        <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
                            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text-primary mb-2">Protocol Initiated</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    If an account exists for <span className="font-bold text-text-primary">{email}</span>,
                                    you will receive recovery instructions via email shortly.
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="btn-primary w-full h-11 flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl pl-11 pr-4 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                                        placeholder="user@example.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="btn-primary w-full h-11 gap-2"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                                Send Recovery Link
                            </button>

                            <div className="text-center pt-2">
                                <Link
                                    href="/login"
                                    className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-blue-600 transition-colors"
                                >
                                    Cancel Recovery
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
