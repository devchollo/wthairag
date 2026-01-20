'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');

            const meRes = await fetch(`${apiUrl}/api/auth/me`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const meData = await meRes.json();

            if (!meRes.ok) throw new Error('Failed to fetch profile');

            login({
                user: meData.data.user,
                memberships: meData.data.memberships
            });

            router.push('/admin/dashboard');
        } catch (err: any) {
            setError('Access Denied. Invalid credentials.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-900 p-6 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-6">
                        <Shield className="h-8 w-8 text-white" />
                    </div>

                    <h2 className="text-3xl font-black tracking-tighter text-white mb-2">
                        Command Center
                    </h2>
                    <p className="text-sm font-bold text-zinc-400">
                        Restricted Access. Level 4 Clearance Required.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Activity className="h-5 w-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-xl border-0 bg-white/5 py-4 pl-12 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 font-bold transition-all"
                                placeholder="Admin Identifier"
                                autoComplete="username"
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border-0 bg-white/5 py-4 pl-12 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 font-bold transition-all"
                                placeholder="Passphrase"
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs font-bold bg-red-900/20 p-3 rounded-lg border border-red-900/50 text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="flex w-full justify-center rounded-xl bg-blue-600 px-3 py-4 text-sm font-black text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all shadow-lg hover:shadow-blue-600/20"
                    >
                        Authenticate Session
                    </button>
                </form>
            </div>
        </div>
    );
}
