'use client';

import Link from 'next/link';
import {
    Shield, Globe, Key, QrCode, Search, MessageSquare, Sparkles, Cpu,
    Server, Files, Image as ImageIcon, FileText, Settings, Database, ArrowRight, Terminal, Zap, RefreshCw
} from 'lucide-react';
import JsonLd from '@/components/JsonLd';

const tools = [
    // Infrastructure
    {
        id: 'dns',
        name: 'DNS Debugger',
        desc: 'Global resolution logs for A, MX, and TXT record primitives with sub-second latency.',
        icon: Globe,
        category: 'Networking',
        color: 'text-blue-600',
        bg: 'bg-blue-50'
    },
    {
        id: 'whois',
        name: 'WHOIS Lookup',
        desc: 'Query registration data, dates, and abuse contacts for any domain name.',
        icon: Search,
        category: 'Infrastructure',
        color: 'text-zinc-600',
        bg: 'bg-zinc-100'
    },
    {
        id: 'hosting',
        name: 'Hosting Provider',
        desc: 'Detect origin IP, hosting provider, ASN, and physical server location.',
        icon: Server,
        category: 'Infrastructure',
        color: 'text-cyan-600',
        bg: 'bg-cyan-50'
    },
    {
        id: 'ssl',
        name: 'TLS Chain Audit',
        desc: 'Chain-of-trust verification and cryptographic security audits for domain integrity.',
        icon: Shield,
        category: 'Security',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
    },

    // SEO / AI Analysis
    {
        id: 'seo',
        name: 'SEO Analysis',
        desc: 'Technical SEO audit including meta tags, headers, and structured data validation.',
        icon: Search,
        category: 'Optimization',
        color: 'text-purple-600',
        bg: 'bg-purple-50'
    },
    {
        id: 'aeo',
        name: 'AEO Checker',
        desc: 'Answer Engine Optimization analysis for featured snippets and voice search.',
        icon: MessageSquare,
        category: 'AI / Search',
        color: 'text-pink-600',
        bg: 'bg-pink-50'
    },
    {
        id: 'geo',
        name: 'GEO Checker',
        desc: 'Generative Engine Optimization to maximize visibility in AI responses.',
        icon: Sparkles,
        category: 'AI / Search',
        color: 'text-fuchsia-600',
        bg: 'bg-fuchsia-50'
    },
    {
        id: 'aio',
        name: 'AIO Checker',
        desc: 'Assess content chunkability and retrieval readiness for LLM ingestion.',
        icon: Cpu,
        category: 'AI / Search',
        color: 'text-violet-600',
        bg: 'bg-violet-50'
    },

    // Utilities
    {
        id: 'password',
        name: 'Entropy Generator',
        desc: 'Browser-native passphrase generation using system-level cryptographic entropy.',
        icon: Key,
        category: 'Crypto',
        color: 'text-amber-500',
        bg: 'bg-amber-50'
    },
    {
        id: 'qr',
        name: 'Payload Encoder',
        desc: 'High-density QR data encoding for digital-to-physical transfer and rapid sharing.',
        icon: QrCode,
        category: 'Encoding',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50'
    },
    {
        id: 'alt-text',
        name: 'AI Alt Text',
        desc: 'Generate accessibility-compliant and SEO-friendly image descriptions with computer vision.',
        icon: ImageIcon,
        category: 'AI / Accessibility',
        color: 'text-teal-600',
        bg: 'bg-teal-50'
    },

    // File Processing
    {
        id: 'pdf-combine',
        name: 'PDF Combiner',
        desc: 'Merge multiple PDF documents into a single file with secure temporary processing.',
        icon: Files,
        category: 'Files',
        color: 'text-red-600',
        bg: 'bg-red-50'
    },
    {
        id: 'converter',
        name: 'File Converter',
        desc: 'Transform images between formats (PNG, JPG, WebP) with zero quality loss.',
        icon: RefreshCw,
        category: 'Files',
        color: 'text-orange-600',
        bg: 'bg-orange-50'
    }
];

export default function ToolsPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "WorkToolsHub",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "A suite of high-performance developer tools for DNS, SSL, SEO, and AI analysis.",
        "featureList": "DNS Lookup, SSL Audit, SEO Checker, AI RAG, Password Generator"
    };

    return (
        <div className="mx-auto max-w-[1200px] px-6 py-20">
            <JsonLd data={jsonLd} />
            <div className="mb-16">
                <div className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Terminal className="h-4 w-4" /> WorkToolsHub / System Architecture & Primitives
                </div>
                <h1 className="text-5xl font-black tracking-tighter text-text-primary sm:text-6xl mb-6">
                    Professional Utilities.
                </h1>
                <p className="text-lg font-bold text-text-secondary max-w-2xl leading-snug">
                    A fleet of high-performance network and security primitives optimized for your daily engineering task flow. Stateless, private, and built for precision.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* AI RAG Featured in Tools - Premium Card */}
                <Link
                    href="/workspace/chat"
                    className="card md:col-span-2 bg-blue-600 text-white border-none p-8 flex flex-col justify-between shadow-2xl shadow-blue-600/20 relative overflow-hidden group hover:shadow-blue-600/40 transition-all"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/5 group-hover:bg-white/20 transition-colors">
                                <Database className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-blue-100 mb-0.5">Core Intelligence</div>
                                <div className="text-xs font-black">RAG Pipeline Active</div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tight mb-3">Query Your Knowledge.</h3>
                            <p className="text-sm font-bold text-blue-50 leading-relaxed max-w-md">
                                Securely index your internal documentation into an isolated AI context. Retrieve specifications and resolve technical debt with zero data leakage.
                            </p>
                        </div>
                    </div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[240px] h-[240px] bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
                </Link>

                {tools.map((tool) => (
                    <Link
                        key={tool.id}
                        href={`/tools/${tool.id}`}
                        className="card flex flex-col justify-between p-7 border-2 hover:border-blue-600/30 group transition-all"
                    >
                        <div>
                            <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${tool.bg} ${tool.color} border border-transparent group-hover:border-${tool.color.split('-')[1]}-200 transition-all`}>
                                <tool.icon className="h-6 w-6" />
                            </div>
                            <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                {tool.category}
                            </div>
                            <h3 className="mb-3 text-xl font-black text-text-primary tracking-tight">
                                {tool.name}
                            </h3>
                            <p className="font-bold text-text-secondary leading-snug text-[13px] opacity-80">
                                {tool.desc}
                            </p>
                        </div>
                        <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Access Primitive <ArrowRight className="h-3 w-3" />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-20 pt-10 border-t border-border-light text-center">
                <p className="text-xs font-black uppercase tracking-widest text-text-muted">
                    More primitives under development: IP Analyzer, JSON Schema Valdiator, Webhook Debugger.
                </p>
            </div>
        </div>
    );
}
