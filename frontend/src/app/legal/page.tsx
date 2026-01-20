'use client';

import { useSearchParams } from 'next/navigation';
import { ShieldCheck, FileText, Gavel, Lock, Scale, Eye } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

const legalContent = {
    privacy: {
        title: "Privacy Commitment",
        icon: ShieldCheck,
        content: [
            {
                h: "1. Data Sovereignty",
                p: "We operate under a 'Stateless by Design' principle. For our public utility suite, no request metadata, input data, or results are logged to persistent storage. Your IP address is hashed and purged every 15 minutes."
            },
            {
                h: "2. Vector Vault Isolation",
                p: "AI Workspace documents are stored in tenant-isolated encrypted vector databases. Your knowledge base is never used to train global LLM models or accessed by any other entity."
            },
            {
                h: "3. Third Party Services",
                p: "We use Stripe for payment processing and Brevo for transactional emails. We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties."
            }
        ]
    },
    terms: {
        title: "Service Agreement",
        icon: Gavel,
        content: [
            {
                h: "1. Acceptable Use",
                p: "WorkToolsHub is designed for professional research and utility. Any attempt to reverse engineer, disrupt service infrastructure, or bypass security layers is strictly prohibited."
            },
            {
                h: "2. Professional Responsibility",
                p: "Users are responsible for the legality of the data they upload to private RAG workspaces. We assume zero liability for data stored within your isolated tenant."
            },
            {
                h: "3. Uptime & SLA",
                p: "We strive for 99.9% uptime. However, services are provided 'as-is' without warranty of any kind, express or implied, including but not limited to the warranties of merchantability."
            }
        ]
    },
    cookies: {
        title: "Cookie Governance",
        icon: Eye,
        content: [
            {
                h: "1. Necessary Cookies",
                p: "We only use essential session cookies required for authentication and security. We do not use tracking or advertising cookies."
            }
        ]
    }
};

function LegalContent() {
    const searchParams = useSearchParams();
    const type = (searchParams.get('type') as keyof typeof legalContent) || 'privacy';
    const data = legalContent[type];
    const Icon = data.icon;

    return (
        <div className="mx-auto max-w-[900px] px-4 py-24 sm:py-32">
            <div className="card">
                <div className="flex items-center gap-4 mb-12">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-text-primary dark:text-text-dark tracking-tighter">
                            {data.title}
                        </h1>
                        <p className="text-sm font-bold text-text-muted mt-1 uppercase tracking-widest">
                            Last Updated: January 20, 2026
                        </p>
                    </div>
                </div>

                <div className="space-y-12">
                    {data.content.map((item, i) => (
                        <div key={i} className="group">
                            <h3 className="text-xl font-black text-text-primary dark:text-text-dark mb-4 group-hover:text-primary transition-colors">
                                {item.h}
                            </h3>
                            <p className="text-lg font-medium leading-relaxed text-text-secondary dark:text-muted">
                                {item.p}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 pt-8 border-t border-border-light dark:border-border-dark flex flex-wrap gap-4">
                    <Link href="/legal?type=privacy" className={`btn-secondary h-9 px-4 text-xs ${type === 'privacy' ? 'border-primary text-primary' : ''}`}>Privacy Policy</Link>
                    <Link href="/legal?type=terms" className={`btn-secondary h-9 px-4 text-xs ${type === 'terms' ? 'border-primary text-primary' : ''}`}>Terms of Service</Link>
                    <Link href="/legal?type=cookies" className={`btn-secondary h-9 px-4 text-xs ${type === 'cookies' ? 'border-primary text-primary' : ''}`}>Cookie Policy</Link>
                </div>
            </div>
        </div>
    );
}

export default function LegalPage() {
    return (
        <Suspense fallback={<div className="p-24 text-center">Loading...</div>}>
            <LegalContent />
        </Suspense>
    );
}
