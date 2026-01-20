'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Globe, Activity, AlertCircle, ArrowLeft, MapPin, Network, Clock, Shield } from 'lucide-react';
import FAQ from '@/components/FAQ';

interface IPDetails {
    ip: string;
    hostname: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    org: string;
    timezone: string;
    asn: string;
}

export default function IPAnalyzer() {
    const [ipInput, setIpInput] = useState('');
    const [results, setResults] = useState<IPDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-fetch on load
    useEffect(() => {
        handleLookup('');
    }, []);

    const handleLookup = async (targetIp?: string) => {
        setLoading(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/tools/ip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip: targetIp || ipInput })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Lookup failed');
            }

            setResults(data.data);
            if (!ipInput && !targetIp) setIpInput(data.data.ip);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-[1100px] px-6 py-12">
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-blue-600 transition-colors mb-8 group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Tools
            </Link>
            <div className="mb-10">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Globe className="h-3.5 w-3.5" /> WorkToolsHub / Network Intelligence
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">IP Address Analyzer.</h1>
                <p className="mt-3 text-sm font-bold text-text-secondary max-w-2xl">
                    Detailed geolocation, ASN, and network information for any public IP address.
                </p>
            </div>

            <div className="card border border-border-light bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row mb-8">
                    <input
                        type="text"
                        placeholder="Enter IP address (leave empty for your IP)"
                        value={ipInput}
                        onChange={(e) => setIpInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                        className="h-10 flex-1 rounded-lg border border-border-light bg-surface-light px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                    />
                    <button
                        onClick={() => handleLookup()}
                        className="btn-primary h-10 px-6 gap-2"
                        disabled={loading}
                    >
                        {loading ? <Activity className="h-4 w-4 animate-spin" /> : 'Analyze IP'}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm font-bold">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {results && (
                    <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Main Info */}
                        <div className="md:col-span-2 p-6 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Target IP Address</div>
                                <div className="text-3xl font-black text-text-primary tracking-tight font-mono">{results.ip}</div>
                            </div>
                            <Globe className="h-10 w-10 text-blue-200" />
                        </div>

                        {/* Location */}
                        <div className="p-6 rounded-xl border border-border-light bg-surface-light hover:border-blue-600/30 transition-all">
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <MapPin className="h-4 w-4" /> Geolocation
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs font-medium text-text-muted">City & Region</div>
                                    <div className="font-bold text-text-primary">{results.city}, {results.region}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-text-muted">Country</div>
                                    <div className="font-bold text-text-primary">{results.country}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-text-muted">Coordinates</div>
                                    <div className="font-mono text-xs font-bold text-text-secondary">{results.loc}</div>
                                </div>
                            </div>
                        </div>

                        {/* Network */}
                        <div className="p-6 rounded-xl border border-border-light bg-surface-light hover:border-blue-600/30 transition-all">
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <Network className="h-4 w-4" /> Network & ASN
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs font-medium text-text-muted">Organization / ISP</div>
                                    <div className="font-bold text-text-primary">{results.org}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-text-muted">ASN</div>
                                    <div className="font-mono font-bold text-text-primary">{results.asn || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-text-muted">Hostname</div>
                                    <div className="font-mono text-xs font-bold text-text-secondary truncate">{results.hostname || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <FAQ
                items={[
                    {
                        question: "What is an IP address?",
                        answer: "An IP (Internet Protocol) address is a unique numerical label assigned to each device connected to a computer network that uses the Internet Protocol for communication."
                    },
                    {
                        question: "How accurate is IP geolocation?",
                        answer: "IP geolocation is generally accurate to the city level, but not exact. It relies on databases maintained by ISPs and third parties. It cannot pinpoint your exact street address."
                    },
                    {
                        question: "What is an ASN?",
                        answer: "ASN stands for Autonomous System Number. It is a unique identifier for a collection of IP networks operated by a single entity (like an ISP or large tech company) with a unified routing policy."
                    },
                    {
                        question: "Why does my IP show a different location?",
                        answer: "If you are using a VPN, proxy, or browsing via mobile data, your IP address will reflect the location of the server or gateway you are routed through, not your physical location."
                    }
                ]}
            />
        </div>
    );
}
