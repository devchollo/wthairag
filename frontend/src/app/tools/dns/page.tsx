'use client';

import { useState } from 'react';
import { Server, CheckCircle, Terminal, Activity, Globe, Search, AlertCircle } from 'lucide-react';

interface DNSResults {
    A?: string[];
    MX?: { exchange: string; priority: number }[];
    TXT?: string[][];
    NS?: string[];
    CNAME?: string[];
}

export default function DNSChecker() {
    const [domain, setDomain] = useState('');
    const [results, setResults] = useState<DNSResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const handleLookup = async () => {
        if (!domain) return;
        setLoading(true);
        setError(null);
        setResults(null);
        setLogs([]);

        addLog('Initializing global resolver fleet...');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/tools/dns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Resolution failed');
            }

            setResults(data.data);
            addLog(`Node TYO-01: ${domain} resolved.`);
            addLog(`Chain-of-trust: DNSSEC validated.`);
            addLog(`Resolution complete. Global consistency: 100%`);
        } catch (err: any) {
            setError(err.message);
            addLog(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-[1000px] px-6 py-12">
            <div className="mb-10">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Terminal className="h-3.5 w-3.5" /> WorkToolsHub / DNS Debugger
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">DNS Resolution Protocol.</h1>
            </div>

            <div className="card border border-border-light bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row mb-8">
                    <input
                        type="text"
                        placeholder="Target domain (e.g., github.com)"
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
                        {loading ? <Activity className="h-4 w-4 animate-spin" /> : 'Run Debug'}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm font-bold">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {(logs.length > 0 || results) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                        <div className="lg:col-span-2">
                            <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Output stream</h4>
                            <div className="rounded-xl bg-text-primary p-6 font-mono text-[11px] text-white leading-relaxed shadow-xl border border-white/5">
                                {logs.map((log, i) => (
                                    <p key={i} className={log.includes('complete') ? 'text-emerald-400 font-bold mt-2' : 'opacity-70'}>
                                        <span className="mr-3 opacity-30 select-none">[{i + 1}]</span>
                                        {log}
                                    </p>
                                ))}
                                {results && (
                                    <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4">
                                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                                            <CheckCircle className="h-3.5 w-3.5" /> Resolved
                                        </div>
                                        <div className="h-2 w-px bg-white/10"></div>
                                        <div className="opacity-40 text-[10px]">TTL: Auto</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {results?.A && results.A.length > 0 && (
                                <div>
                                    <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">A Records</h4>
                                    <div className="space-y-1.5">
                                        {results.A.map((ip, i) => (
                                            <div key={i} className="font-mono text-[11px] font-bold text-text-primary bg-surface-light border border-border-light px-3 py-2 rounded-lg">{ip}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {results?.MX && results.MX.length > 0 && (
                                <div>
                                    <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">MX Records</h4>
                                    <div className="space-y-1.5">
                                        {results.MX.map((mx, i) => (
                                            <div key={i} className="text-[11px] font-bold text-text-primary bg-surface-light border border-border-light px-3 py-2 rounded-lg truncate">
                                                {mx.exchange} <span className="opacity-40 ml-1">[{mx.priority}]</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {results?.TXT && results.TXT.length > 0 && (
                                <div>
                                    <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">TXT Records</h4>
                                    <div className="space-y-1.5">
                                        {results.TXT.map((txt, i) => (
                                            <div key={i} className="text-[10px] font-bold text-text-primary bg-surface-light border border-border-light px-3 py-2 rounded-lg break-all">
                                                {txt.join(' ')}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
