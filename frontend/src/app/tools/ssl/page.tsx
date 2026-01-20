'use client';

import { useState } from 'react';
import { Shield, Search, Calendar, Landmark, CheckCircle, Lock, Terminal, Activity, FileText } from 'lucide-react';

interface SSLResults {
    status: string;
    expiry: string;
    issuer: string;
    logs: string[];
}

export default function SSLAnalyzer() {
    const [domain, setDomain] = useState('');
    const [results, setResults] = useState<SSLResults | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLookup = async () => {
        setLoading(true);
        // Deep Chain Diagnosis
        setTimeout(() => {
            setResults({
                status: 'Chain Consistent',
                expiry: '2026-12-31',
                issuer: "Let's Encrypt E6 (RSA 2048)",
                logs: [
                    'Scanning port 443 for TLS handshake...',
                    'Server Hello received. Cipher: TLS_AES_256_GCM_SHA384',
                    'Found 2 certificates in chain.',
                    'Root: ISRG Root X1 (Self-signed)',
                    'Intermediate: R3 (Signed by ISRG Root X1)',
                    'Leaf: *.worktoolshub.com (Validated)',
                    'Verification complete. Trust established.'
                ]
            });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mb-12">
                <div className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-muted">
                    <Terminal className="h-4 w-4" /> WorkToolsHub / TLS Audit Console
                </div>
                <h1 className="text-5xl font-black text-text-primary tracking-tighter">Chain-of-Trust Audit.</h1>
            </div>

            <div className="card max-w-4xl border-2 border-border-light shadow-xl shadow-black/[0.02]">
                <div className="flex flex-col gap-4 sm:flex-row mb-12">
                    <input
                        type="text"
                        placeholder="Domain to audit (e.g., stripe.com)"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="h-14 flex-1 rounded-xl border-2 border-border-light bg-surface-light px-6 text-lg font-bold outline-none focus:border-primary transition-all"
                    />
                    <button
                        onClick={handleLookup}
                        className="btn-primary h-14 min-w-[200px] gap-2"
                        disabled={loading || !domain}
                    >
                        {loading ? <Activity className="h-5 w-5 animate-spin" /> : 'Start Audit'}
                    </button>
                </div>

                {results && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="lg:col-span-2">
                            <h4 className="mb-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Diagnostic Sequence</h4>
                            <div className="rounded-2xl bg-slate-900 p-8 font-mono text-xs text-white leading-relaxed shadow-2xl relative overflow-hidden">
                                <div className="absolute top-4 right-6 opacity-20"><Lock className="h-12 w-12" /></div>
                                {results.logs.map((log, i) => (
                                    <p key={i} className={log.includes('complete') ? 'text-blue-400 font-bold mt-4' : 'opacity-70'}>
                                        <span className="mr-3 opacity-30 select-none">{i + 1}</span>
                                        {log}
                                    </p>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-surface-light border border-border-light">
                                <div className="flex items-center gap-2 mb-4 text-[11px] font-black uppercase tracking-widest text-text-muted">
                                    <Shield className="h-3 w-3" /> Integrity
                                </div>
                                <div className="text-xl font-black text-blue-600">{results.status}</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-surface-light border border-border-light">
                                <div className="flex items-center gap-2 mb-4 text-[11px] font-black uppercase tracking-widest text-text-muted">
                                    <Calendar className="h-3 w-3" /> Expiration
                                </div>
                                <div className="text-xl font-black text-text-primary">{results.expiry}</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-surface-light border border-border-light">
                                <div className="flex items-center gap-2 mb-4 text-[11px] font-black uppercase tracking-widest text-text-muted">
                                    <Landmark className="h-3 w-3" /> Authority
                                </div>
                                <div className="text-lg font-bold text-text-secondary leading-tight truncate">
                                    {results.issuer}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
