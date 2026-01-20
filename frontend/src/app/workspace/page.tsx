'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WorkspacePage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/workspace/dashboard');
        }
    }, [user, router]);

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-24 sm:py-32 text-center">
            <div className="card max-w-2xl mx-auto py-16 px-8 border-2 border-primary/10">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <Lock className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-black text-text-primary dark:text-text-dark tracking-tighter mb-4">
                    Secure Workspace Required
                </h1>
                <p className="text-lg font-bold text-text-secondary dark:text-muted mb-12 leading-relaxed">
                    You are attempting to access a guarded environment. Please authenticate to verify your identity and access your organization's private AI vaults.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/login" className="btn-primary min-w-[200px] gap-2">
                        Sign Into Vault <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/signup" className="btn-secondary min-w-[200px]">
                        Request Access
                    </Link>
                </div>

                <div className="mt-16 pt-8 border-t border-border-light dark:border-border-dark flex items-center justify-center gap-8 text-xs font-black uppercase tracking-widest text-text-muted">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" /> End-to-End Encrypted
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" /> Tenant Isolated
                    </div>
                </div>
            </div>
        </div>
    );
}
