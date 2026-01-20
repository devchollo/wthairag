'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Shield, Scale, Info, Terminal } from 'lucide-react';

const legalContent = {
    privacy: {
        title: "Privacy Protocol",
        desc: "How we handle network primitives and user session data.",
        sections: [
            {
                h: "Stateless Operation",
                p: "WorkToolsHub operates on a zero-persistence model for all public network utilities. DNS queries, SSL audits, and IP lookups are processed in worker memory and purged immediately upon response delivery. We do not maintain logs of user input for these primitives."
            },
            {
                h: "Workspace Isolation",
                p: "Organizations utilizing the RAG Knowledge Hub have their data stored in encrypted vector namespaces. Your documentation is never used to train global models or shared across tenant boundaries."
            },
            {
                h: "Telemetry",
                p: "We collect minimal performance metrics (latency, error rates) to maintain resolver health. This data is anonymized and stripped of PI (Personally Identifiable Information)."
            }
        ]
    },
    terms: {
        title: "Service Terms",
        desc: "Engagement rules for utilizing our developer infrastructure.",
        sections: [
            {
                h: "Acceptable Use",
                p: "The Hub is provided for debugging, development, and research. Automated scraping of our resolver endpoints is prohibited without explicit sponsorship to protect community resources."
            },
            {
                h: "Data Sovereignty",
                p: "You retain 100% ownership of any data uploaded to your private workspace. You may terminate your session and purge your data at any time via the Console."
            },
            {
                h: "No Warranty",
                p: "Our tools are provided as-is. While we strive for 99.9% uptime for our core primitives, WorkToolsHub is not liable for network downtime or incorrect resolution data during global propagation events."
            }
        ]
    }
};

function LegalContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'privacy';
    const content = legalContent[type as keyof typeof legalContent] || legalContent.privacy;

    return (
        <div className="mx-auto max-w-[900px] px-4 py-16 sm:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-16">
                <div className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-muted">
                    <Terminal className="h-4 w-4" /> WorkToolsHub / Legal Guidelines
                </div>
                <h1 className="text-6xl font-black text-text-primary tracking-tighter mb-6">{content.title}.</h1>
                <p className="text-xl font-bold text-text-secondary leading-relaxed max-w-2xl">{content.desc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <aside className="md:col-span-1 space-y-4">
                    <a href="?type=privacy" className={`block px-4 py-3 rounded-xl font-black text-sm transition-all ${type === 'privacy' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.05]' : 'text-text-muted hover:text-text-primary'}`}>
                        Privacy
                    </a>
                    <a href="?type=terms" className={`block px-4 py-3 rounded-xl font-black text-sm transition-all ${type === 'terms' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.05]' : 'text-text-muted hover:text-text-primary'}`}>
                        Terms
                    </a>
                </aside>

                <div className="md:col-span-3 space-y-16">
                    {content.sections.map((section, i) => (
                        <section key={i} className="group">
                            <h2 className="text-2xl font-black text-text-primary mb-6 tracking-tight flex items-center gap-3">
                                <span className="text-blue-600 opacity-20 text-4xl group-hover:opacity-100 transition-opacity">0{i + 1}.</span>
                                {section.h}
                            </h2>
                            <p className="text-lg font-bold text-text-secondary leading-relaxed opacity-80">
                                {section.p}
                            </p>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function LegalPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        }>
            <LegalContent />
        </Suspense>
    );
}
