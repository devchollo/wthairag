'use client';

import Link from 'next/link';

import { useState } from 'react';
import { Server, Globe, MapPin, Wifi, Shield, AlertCircle, Activity, Cloud, Database, ArrowLeft } from 'lucide-react';
import FAQ from '@/components/FAQ';

interface HostingResults {
    domain: string;
    ip: string | null;
    hosting: {
        provider: string;
        org: string | null;
        asn: string | null;
        asnName: string | null;
    };
    cdn: {
        detected: boolean;
        provider: string | null;
    };
    location: {
        country: string | null;
        region: string | null;
        city: string | null;
    };
    queryTime: number;
}

export default function WhoIsHostingThis() {
    const [domain, setDomain] = useState('');
    const [results, setResults] = useState<HostingResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLookup = async () => {
        let target = domain;
        if (!target) return;

        // Force naked domain format
        target = target.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        setDomain(target);

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/tools/hosting`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: target })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Lookup failed');
            }

            setResults(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getProviderColor = (provider: string) => {
        const p = provider.toLowerCase();
        if (p.includes('aws') || p.includes('amazon')) return 'from-orange-500 to-amber-500';
        if (p.includes('google')) return 'from-blue-500 to-green-500';
        if (p.includes('cloudflare')) return 'from-orange-500 to-orange-600';
        if (p.includes('vercel')) return 'from-slate-800 to-slate-900';
        if (p.includes('netlify')) return 'from-teal-500 to-cyan-500';
        if (p.includes('digitalocean')) return 'from-blue-500 to-blue-600';
        if (p.includes('azure') || p.includes('microsoft')) return 'from-blue-600 to-sky-500';
        return 'from-slate-600 to-slate-700';
    };

    return (
        <div className="mx-auto max-w-[1100px] px-6 py-12">
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-blue-600 transition-colors mb-8 group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Tools
            </Link>
            <div className="mb-10">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Server className="h-3.5 w-3.5" /> WorkToolsHub / Hosting Lookup
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">Who Is Hosting This?</h1>
                <p className="mt-3 text-sm font-bold text-text-secondary max-w-2xl">
                    Discover the hosting provider, ASN, CDN usage, and server geolocation for any domain.
                </p>
            </div>

            <div className="card border border-border-light bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row mb-8">
                    <input
                        type="text"
                        placeholder="Enter domain (e.g., vercel.com)"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                        className="h-10 flex-1 rounded-lg border border-border-light bg-surface-light px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                    />
                    <button
                        onClick={handleLookup}
                        className="btn-primary h-10 px-6 gap-2"
                        disabled={loading || !domain}
                    >
                        {loading ? <Activity className="h-4 w-4 animate-spin" /> : 'Analyze'}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm font-bold">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {results && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Main Provider Card */}
                        <div className={`p-8 rounded-2xl bg-gradient-to-br ${getProviderColor(results.hosting.provider)} text-white relative overflow-hidden`}>
                            <div className="absolute top-4 right-4 opacity-10">
                                <Cloud className="h-24 w-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Hosting Provider</div>
                                <div className="text-4xl font-black tracking-tight mb-4">{results.hosting.provider}</div>
                                {results.hosting.asn && (
                                    <div className="flex items-center gap-4 text-sm opacity-80">
                                        <span className="font-mono font-bold">{results.hosting.asn}</span>
                                        {results.hosting.asnName && <span className="font-bold">• {results.hosting.asnName}</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* IP Address */}
                            <div className="p-5 rounded-xl bg-surface-light border border-border-light">
                                <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    <Wifi className="h-3 w-3" /> IP Address
                                </div>
                                <div className="font-mono text-lg font-black text-text-primary">{results.ip || '—'}</div>
                            </div>

                            {/* CDN Status */}
                            <div className={`p-5 rounded-xl border ${results.cdn.detected ? 'bg-emerald-50 border-emerald-200' : 'bg-surface-light border-border-light'}`}>
                                <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    <Shield className="h-3 w-3" /> CDN Status
                                </div>
                                <div className={`text-lg font-black ${results.cdn.detected ? 'text-emerald-600' : 'text-text-muted'}`}>
                                    {results.cdn.detected ? results.cdn.provider : 'Not Detected'}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="p-5 rounded-xl bg-surface-light border border-border-light">
                                <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    <MapPin className="h-3 w-3" /> Server Location
                                </div>
                                <div className="text-lg font-black text-text-primary">
                                    {[results.location.city, results.location.region, results.location.country]
                                        .filter(Boolean)
                                        .join(', ') || '—'}
                                </div>
                            </div>
                        </div>

                        {/* Query Time */}
                        <div className="text-center pt-4 border-t border-border-light">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                Analysis completed in {results.queryTime}ms
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <FAQ
                items={[
                    {
                        question: "How do you detect who is hosting a website?",
                        answer: "We analyze the IP address of the domain's A record and look up its Autonomous System Number (ASN). This identifies the network owner, which is usually the hosting provider or a CDN."
                    },
                    {
                        question: "What is a CDN (Content Delivery Network)?",
                        answer: "A CDN is a geographically distributed group of servers that speeds up the delivery of web content. If a site uses a CDN like Cloudflare, our tool will often see the CDN as the 'host' because the traffic passes through their network first."
                    },
                    {
                        question: "Can I hide my hosting provider?",
                        answer: "Using a CDN or reverse proxy (like Cloudflare) effectively masks your origin IP address and hosting provider from public view, adding a layer of security and privacy."
                    },
                    {
                        question: "What is an ASN?",
                        answer: "An Autonomous System Number (ASN) is a unique number assigned to an Autonomous System (AS) by IANA. Large organizations, ISPs, and hosting providers have their own ASNs to route traffic on the internet."
                    }
                ]}
            />
        </div>
    );
}
