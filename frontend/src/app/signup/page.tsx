'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Building, ArrowRight, ShieldCheck } from 'lucide-react';
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
            memberships: [{ workspaceId: { name: orgName, slug: 'my-workspace' } }]
        };
        login(mockData);
        window.location.href = '/workspace/dashboard';
    };

    return (
        <div className="mx-auto max-w-[440px] px-4 py-24 sm:py-32">
            <div className="card">
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark">
                        Begin Your Journey
                    </h1>
                    <p className="mt-2 text-sm text-text-secondary dark:text-muted font-medium">
                        Setup your private, RAG-enhanced workspace in seconds.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 h-4 w-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-11 w-full rounded-lg border border-border-light bg-white pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Building className="absolute left-3 top-3.5 h-4 w-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Organization Name"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="h-11 w-full rounded-lg border border-border-light bg-white pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-text-muted" />
                        <input
                            type="email"
                            placeholder="Work Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 w-full rounded-lg border border-border-light bg-white pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full gap-2 mt-6">
                        Establish Workspace
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border-light text-center dark:border-border-dark">
                    <p className="text-sm font-bold text-text-secondary dark:text-muted">
                        Already have access? <Link href="/login" className="text-primary hover:underline">Sign into vault</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
