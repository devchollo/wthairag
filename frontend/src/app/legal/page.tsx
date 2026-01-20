'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Shield, Scale, Info, Terminal, Lock, Activity, BookOpen } from 'lucide-react';

const legalContent = {
    privacy: {
        title: "Privacy Protocol",
        desc: "How we handle network primitives and user session data.",
        sections: [
            {
                h: "Stateless Operation",
                p: "WorkToolsHub operates on a zero-persistence model for all public network utilities. DNS queries, SSL audits, and IP lookups are processed in worker memory and purged immediately upon response delivery."
            },
            {
                h: "Workspace Isolation",
                p: "Organizations utilizing the RAG Knowledge Hub have their data stored in encrypted vector namespaces. Your documentation is never used to train global models."
            },
            {
                h: "Telemetry Standards",
                p: "We collect minimal performance metrics to maintain resolver health. This data is anonymized and stripped of any identifying information before storage."
            }
        ]
    },
    terms: {
        title: "Service Terms",
        desc: "Engagement rules for utilizing our developer infrastructure.",
        sections: [
            {
                h: "Acceptable Use",
                p: "The Hub is provided for debugging, development, and research. Automated scraping of our resolver endpoints is prohibited without explicit sponsorship."
            },
            {
                h: "Data Sovereignty",
                p: "You retain 100% ownership of any data uploaded to your private workspace. You may terminate your session and purge your data at any time."
            },
            {
                h: "Limitation of Liability",
                p: "Our tools are provided as-is. We are not liable for network downtime or incorrect resolution data during global propagation events."
            }
        ]
    },
    security: {
        title: "Security Standards",
        desc: "Our commitment to protecting your technical assets and session integrity.",
        sections: [
            {
                h: "Encryption at Rest",
                p: "All documents ingested into the RAG Knowledge Vault are encrypted using AES-256 before being processed into vector embeddings."
            },
            {
                h: "Network Security",
                p: "All traffic between your browser and our resolvers is protected by TLS 1.3. We use strictly hardened cipher suites to prevent downgrade attacks."
            },
            {
                h: "Tenant Separation",
                p: "We use logical and physical isolation layers to ensure that organization A can never access the knowledge base or query logs of organization B."
            }
        ]
    },
    sla: {
        title: "SLA & Reliability",
        desc: "Our performance guarantees for professional engineering workflows.",
        sections: [
            {
                h: "Uptime Commitment",
                p: "We strive for 99.9% uptime for our core DNS and TLS resolver fleet. Status updates are published in real-time to our global network monitors."
            },
            {
                h: "Resolution Speed",
                p: "Public primitives are benchmarked to respond in under 300ms from our primary edge nodes (TYO-01, LON-04, SFO-02)."
            },
            {
                h: "Support Response",
                p: "Emergency sponsorship-tier users receive technical support for integration issues within a 12-hour response window."
            }
        ]
    }
};

function LegalContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'privacy';
    const content = legalContent[type as keyof typeof legalContent] || legalContent.privacy;

    const tabs = [
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'terms', label: 'Terms', icon: Scale },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'sla', label: 'Reliability', icon: Activity },
    ];

    return (
        <div className="mx-auto max-w-[1000px] px-6 py-12 lg:py-20 animate-in fade-in duration-500">
            <div className="mb-12">
                <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Terminal className="h-4 w-4" /> WorkToolsHub / Governance Protocols
                </div>
                <h1 className="text-5xl font-black text-text-primary tracking-tighter mb-4">{content.title}.</h1>
                <p className="text-lg font-bold text-text-secondary leading-snug max-w-2xl">{content.desc}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <aside className="lg:col-span-1 border-r border-border-light pr-8">
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const isActive = type === tab.id;
                            return (
                                <a
                                    key={tab.id}
                                    href={`?type=${tab.id}`}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-black text-xs transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-text-muted hover:text-text-primary hover:bg-surface-light'}`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </a>
                            );
                        })}
                    </nav>
                </aside>

                <div className="lg:col-span-3 space-y-12">
                    {content.sections.map((section, i) => (
                        <section key={i} className="group">
                            <h2 className="text-xl font-black text-text-primary mb-4 tracking-tight flex items-center gap-2">
                                <span className="text-blue-600 opacity-30 text-sm">0{i + 1}.</span>
                                {section.h}
                            </h2>
                            <p className="text-base font-bold text-text-secondary leading-relaxed opacity-80">
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
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        }>
            <LegalContent />
        </Suspense>
    );
}
