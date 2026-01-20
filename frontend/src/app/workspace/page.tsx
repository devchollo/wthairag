'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, User, Building, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [orgName, setOrgName] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const mockData = {
            user: { name: name || 'User', email },
            token: 'mock-token',
            memberships: [{ workspaceId: { name: orgName || 'My Workspace', slug: 'my-workspace' } }]
        };
        login(mockData);
        window.location.href = '/workspace/dashboard';
    };

    return (
        <div className="mx-auto max-w-[440px] px-4 py-24 sm:py-32">
            <div className="card">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark">
                        {isLogin ? 'Welcome Back' : 'Get Started'}
                    </h1>
                    <p className="mt-2 text-sm text-text-secondary dark:text-muted">
                        {isLogin ? 'Login to access your workspace.' : 'Create your private AI vault today.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-11 w-full rounded-lg border border-border-light bg-white pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Building className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Organization"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    className="h-11 w-full rounded-lg border border-border-light bg-white pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark"
                                    required
                                />
                            </div>
                        </>
                    )}
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 w-full rounded-lg border border-border-light bg-white pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 w-full rounded-lg border border-border-light bg-white pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full gap-2">
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border-light text-center dark:border-border-dark">
                    <button
                        className="text-sm font-semibold text-text-secondary hover:text-primary dark:text-muted"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
}

