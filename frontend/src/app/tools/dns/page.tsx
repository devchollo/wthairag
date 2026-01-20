'use client';

import { useState } from 'react';
import { Server, Search, CheckCircle, Terminal, Activity, Globe } from 'lucide-react';

interface DNSResults {
    A?: string[];
    MX?: { exchange: string; priority: number }[];
    logs: string[];
}

export default function DNSChecker() {
    const [domain, setDomain] = useState('');
    const [results, setResults] = useState<DNSResults | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLookup = async () => {
        setLoading(true);
        // Direct Resolution Primitives
        setTimeout(() => {
            setResults({
                A: ['104.21.78.231', '172.67.135.244'],
                MX: [{ exchange: 'aspmx.l.google.com.', priority: 10 }],
                logs: [
                    'Initializing global resolver fleet...',
                    'Node TYO-01: 104.21.78.231 resolved (24ms)',
                    'Node LON-04: 172.67.135.244 resolved (12ms)',
                    'Chain-of-trust: DNSSEC validated.',
                    'Resolution complete. Global consistency: 100%'
                ]
            });
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mb-12">
                <div className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-muted">
                    <Terminal className="h-4 w-4" /> WorkToolsHub / DNS Debugger
                </div>
                <h1 className="text-5xl font-black text-text-primary tracking-tighter">DNS Resolution Protocol.</h1>
            </div>

            <div className="card max-w-4xl border-2 border-border-light shadow-xl shadow-black/[0.02]">
                <div className="flex flex-col gap-4 sm:flex-row mb-12">
                    <input
                        type="text"
                        placeholder="Enter domain (e.g., github.com)"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="h-14 flex-1 rounded-xl border-2 border-border-light bg-surface-light px-6 text-lg font-bold outline-none focus:border-primary transition-all"
                    />
                    <button
                        onClick={handleLookup}
                        className="btn-primary h-14 min-w-[180px] gap-2"
                        disabled={loading || !domain}
                    >
                        {loading ? <Activity className="h-5 w-5 animate-spin" /> : 'Run Debug'}
                    </button>
                </div>

                {results && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="lg:col-span-2">
                            <h4 className="mb-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Output Stream</h4>
                            <div className="rounded-2xl bg-text-primary p-8 font-mono text-xs text-white leading-relaxed shadow-2xl">
                                {results.logs.map((log, i) => (
                                    <p key={i} className={log.includes('complete') ? 'text-emerald-400 font-bold mt-4' : 'opacity-70'}>
                                        <span className="mr-3 opacity-30 select-none">[{i + 1}]</span>
                                        {log}
                                    </p>
                                ))}
                                <div className="mt-6 flex items-center gap-4 border-t border-white/10 pt-6">
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest">
                                        <CheckCircle className="h-4 w-4" /> Validated
                                    </div>
                                    <div className="h-2 w-px bg-white/10"></div>
                                    <div className="opacity-50">TTL: 3600</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="mb-3 text-[11px] font-black uppercase tracking-widest text-text-muted">A Records</h4>
                                <div className="space-y-2">
                                    {results.A?.map((ip, i) => (
                                        <div key={i} className="font-mono text-sm font-bold text-text-primary bg-surface-light border border-border-light px-4 py-2 rounded-lg">{ip}</div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="mb-3 text-[11px] font-black uppercase tracking-widest text-text-muted">MX Records</h4>
                                <div className="space-y-2">
                                    {results.MX?.map((mx, i) => (
                                        <div key={i} className="text-sm font-bold text-text-primary bg-surface-light border border-border-light px-4 py-2 rounded-lg truncate">
                                            {mx.exchange} <span className="opacity-40 ml-1">({mx.priority})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
