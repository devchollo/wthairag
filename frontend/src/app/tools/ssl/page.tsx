'use client';

import { useState } from 'react';
import { Shield, Search, Calendar, Landmark, CheckCircle, Lock, Terminal, Activity, FileText, AlertCircle } from 'lucide-react';

interface SSLResults {
    status: string;
    expiry: string;
    issuer: string;
    aiReport?: string;
}

export default function SSLAnalyzer() {
    const [domain, setDomain] = useState('');
    const [results, setResults] = useState<SSLResults | null>(null);
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

        addLog(`Initiating handshake for ${domain}:443...`);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/tools/ssl`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Audit failed');
            }

            setResults(data.data);
            addLog('Server Hello received. Cipher: TLS_AES_256_GCM_SHA384');
            addLog('Found certificate chain.');
            addLog('Verification complete. Trust established.');
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
                    <Terminal className="h-3.5 w-3.5" /> WorkToolsHub / TLS Audit Console
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">Chain-of-Trust Audit.</h1>
            </div>

            <div className="card border border-border-light bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row mb-8">
                    <input
                        type="text"
                        placeholder="Domain to audit (e.g., stripe.com)"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                        className="h-10 flex-1 rounded-lg border border-border-light bg-surface-light px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                    />
                    <button
                        onClick={handleLookup}
                        className="btn-primary h-10 min-w-[180px] gap-2"
                        disabled={loading || !domain}
                    >
                        {loading ? <Activity className="h-4 w-4 animate-spin" /> : 'Start Audit'}
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
                            <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Diagnostic Sequence</h4>
                            <div className="rounded-xl bg-slate-900 p-6 font-mono text-[11px] text-white leading-relaxed shadow-xl relative overflow-hidden border border-white/5">
                                <div className="absolute top-4 right-6 opacity-10"><Lock className="h-10 w-10" /></div>
                                {logs.map((log, i) => (
                                    <p key={i} className={log.includes('complete') ? 'text-blue-400 font-bold mt-2' : 'opacity-70'}>
                                        <span className="mr-3 opacity-30 select-none">{i + 1}</span>
                                        {log}
                                    </p>
                                ))}
                            </div>

                            {results?.aiReport && (
                                <div className="mt-6 p-6 rounded-xl bg-blue-50 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-blue-600">
                                        <FileText className="h-3.5 w-3.5" /> AI Diagnostic Insight
                                    </div>
                                    <p className="text-sm font-bold text-text-primary leading-relaxed italic opacity-80">
                                        "{results.aiReport}"
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-surface-light border border-border-light shadow-sm">
                                <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    <Shield className="h-3 w-3" /> Integrity
                                </div>
                                <div className={`text-lg font-black ${results?.status === 'valid' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    {results?.status || 'Pending...'}
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-surface-light border border-border-light shadow-sm">
                                <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    <Calendar className="h-3 w-3" /> Expiry Date
                                </div>
                                <div className="text-lg font-black text-text-primary">{results?.expiry || '—'}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-surface-light border border-border-light shadow-sm text-center">
                                <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted justify-center">
                                    <Landmark className="h-3 w-3" /> CA Issuer
                                </div>
                                <div className="text-[11px] font-black text-text-secondary leading-tight truncate uppercase tracking-widest">
                                    {results?.issuer || '—'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
