'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, User, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AcceptInvitePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { verifySession } = useAuth();

    const token = searchParams.get('token');

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing invitation token.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setLoading(true);
        setError('');
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/memberships/accept-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, name, password }),
                credentials: 'include'
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                // Verify session to update AuthContext state
                await verifySession();
                setTimeout(() => {
                    router.push('/workspace/dashboard');
                }, 2000);
            } else {
                setError(data.message || 'Failed to accept invitation');
            }
        } catch (e) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-base p-6">
                <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-center">
                        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tighter text-text-primary">Vault Synchronized.</h1>
                        <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Initialization complete. Redirecting to workspace...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-base p-6">
            <div className="max-w-md w-full space-y-10">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="h-12 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                            <Shield className="h-6 w-6" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-text-primary mb-2">Initialize Profile.</h1>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">Accept your workspace authorization</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border-2 border-red-100 rounded-xl flex gap-3 text-red-600 animate-in slide-in-from-top-2">
                        <Shield className="h-4 w-4 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-12 bg-white border-2 border-border-light rounded-xl pl-12 pr-4 text-sm font-bold outline-none focus:border-blue-600 transition-all shadow-sm"
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 bg-white border-2 border-border-light rounded-xl pl-12 pr-4 text-sm font-bold outline-none focus:border-blue-600 transition-all shadow-sm"
                                placeholder="Create Security Password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !token}
                        className="btn-primary w-full h-12 gap-3 text-sm"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                        Join Workspace
                    </button>
                </form>

                <p className="text-center text-[10px] font-black uppercase tracking-widest text-text-muted">
                    Your account will be strictly isolated within the assigned workspace.
                </p>
            </div>
        </div>
    );
}
