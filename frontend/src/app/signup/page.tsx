'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Building, ArrowRight, ShieldCheck, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const { login, user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && user) {
            router.push('/workspace/dashboard');
        }
    }, [user, authLoading, router]);

    // Steps: 0 = Email, 1 = Verify, 2 = Details
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <ShieldCheck className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Form Data
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [orgName, setOrgName] = useState('');

    const [signupToken, setSignupToken] = useState<string | null>(null);

    // Step 0: Initiate Signup
    const handleInitiate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/signup/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send verification code');

            setStep(1);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 1: Verify Code
    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/signup/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Invalid verification code');

            setSignupToken(data.data.signupToken);
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 2: Complete Signup
    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/signup/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    signupToken,
                    name,
                    password,
                    orgName
                }),
                credentials: 'include'
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create account');

            // Fetch user profile with memberships to ensure we have the newly created workspace
            const meRes = await fetch(`${apiUrl}/api/auth/me`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const meData = await meRes.json();

            if (!meRes.ok) throw new Error('Failed to fetch profile after signup');

            // Auto-login logic
            login({
                user: meData.data.user,
                memberships: meData.data.memberships
            });

            router.push('/workspace/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-[440px] px-6 py-20 bg-white min-h-[600px] flex items-center">
            <div className="card shadow-2xl shadow-black/5 w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-4">
                        <ShieldCheck size={20} />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter text-text-primary">
                        {step === 0 && 'Start with your email.'}
                        {step === 1 && 'Check your inbox.'}
                        {step === 2 && 'Finalize Setup.'}
                    </h1>
                    <p className="mt-2 text-xs text-text-muted font-bold tracking-tight">
                        {step === 0 && 'Setup your private, AI-ready console in seconds.'}
                        {step === 1 && `We sent a 6-digit code to ${email}`}
                        {step === 2 && 'Secure your account and name your workspace.'}
                    </p>
                </div>

                {/* Step 0: Email */}
                {step === 0 && (
                    <form onSubmit={handleInitiate} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                            <input
                                type="email"
                                placeholder="work@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-10 w-full rounded-lg border border-border-light bg-surface-light pl-10 pr-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                                required
                                autoFocus
                                autoComplete="email"
                            />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full gap-2">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
                        </button>
                    </form>
                )}

                {/* Step 1: Verification Code */}
                {step === 1 && (
                    <form onSubmit={handleVerify} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                className="h-10 w-full rounded-lg border border-border-light bg-surface-light pl-10 pr-4 text-sm font-bold outline-none focus:border-blue-600 tracking-widest transition-all"
                                required
                                autoFocus
                                maxLength={6}
                            />
                        </div>
                        <button type="submit" disabled={isSubmitting || code.length < 6} className="btn-primary w-full gap-2">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify Code <ArrowRight className="h-4 w-4" /></>}
                        </button>
                        <div className="text-center">
                            <button type="button" onClick={() => setStep(0)} className="text-xs font-bold text-text-muted hover:text-blue-600">Change email</button>
                        </div>
                    </form>
                )}

                {/* Step 2: Complete Details */}
                {step === 2 && (
                    <form onSubmit={handleComplete} className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-10 w-full rounded-lg border border-border-light bg-surface-light pl-10 pr-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                                required
                                autoFocus
                                autoComplete="name"
                            />
                        </div>
                        <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Organization Name"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                className="h-10 w-full rounded-lg border border-border-light bg-surface-light pl-10 pr-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                            <input
                                type="password"
                                placeholder="Secure Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-10 w-full rounded-lg border border-border-light bg-surface-light pl-10 pr-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                            />
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full gap-2 mt-4">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Complete Setup <CheckCircle className="h-4 w-4" /></>}
                        </button>
                    </form>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-xs font-bold text-red-600 animate-in fade-in slide-in-from-bottom-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-border-light text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-text-muted">
                        Already have a vault? <Link href="/login" className="text-blue-600 hover:underline ml-1">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
