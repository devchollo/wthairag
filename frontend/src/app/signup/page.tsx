'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Building, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [orgName, setOrgName] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const mockData = {
            user: { name, email },
            token: 'mock-token',
            memberships: [{ workspaceId: { name: orgName, slug: 'org-hub' } }]
        };
        login(mockData);
        window.location.href = '/workspace/dashboard';
    };

    return (
        <div className="mx-auto max-w-[440px] px-6 py-20 bg-white">
            <div className="card shadow-2xl shadow-black/5">
                <div className="text-center mb-8">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-4">
                        <ShieldCheck size={20} />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter text-text-primary">
                        Join the Hub.
                    </h1>
                    <p className="mt-2 text-xs text-text-muted font-bold tracking-tight">
                        Setup your private, AI-ready console in seconds.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-10 w-full rounded-lg border border-border-light bg-surface-light pl-10 pr-4 text-sm font-bold outline-none focus:border-blue-600"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Organization Name"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="h-10 w-full rounded-lg border border-border-light bg-surface-light pl-10 pr-4 text-sm font-bold outline-none focus:border-blue-600"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                        <input
                            type="email"
                            placeholder="Work Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-10 w-full rounded-lg border border-border-light bg-surface-light pl-10 pr-4 text-sm font-bold outline-none focus:border-blue-600"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full gap-2 mt-4">
                        Establish Hub
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border-light text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-text-muted">
                        Already have a vault? <Link href="/login" className="text-blue-600 hover:underline ml-1">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
