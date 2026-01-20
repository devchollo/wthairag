'use client';

import { useState } from 'react';
import { Shield, Calendar, Landmark, CheckCircle, Lock, Terminal, Activity, FileText, AlertCircle, XCircle, Key, Server, Globe } from 'lucide-react';

interface SSLResults {
    domain: string;
    queryTime: number;
    certificate: {
        status: string;
        issuer: string;
        subject: string;
        expiry: string;
        validFrom: string;
        daysUntilExpiry: number;
        serialNumber: string;
        fingerprint256: string;
        keyStrength: string;
        altNames: string[];
    };
    connection: {
        protocol: string;
        cipher: string;
        cipherVersion: string;
    };
    report: {
        summary: string;
        issues: string[];
        recommendations: string[];
    };
}

export default function SSLAnalyzer() {
    const [domain, setDomain] = useState('');
    const [results, setResults] = useState<SSLResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const handleLookup = async () => {
        let target = domain;
        if (!target) return;

        // Force naked domain format
        target = target.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        setDomain(target);

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
            addLog(`Server Hello received. Protocol: ${data.data.connection.protocol}`);
            addLog(`Cipher Suite: ${data.data.connection.cipher}`);
            addLog(`Certificate chain validated in ${data.data.queryTime}ms.`);
        } catch (err: any) {
            setError(err.message);
            addLog(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-[1100px] px-6 py-12">
            <div className="mb-10">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Terminal className="h-3.5 w-3.5" /> WorkToolsHub / TLS Audit Console
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">Chain-of-Trust Audit.</h1>
                <p className="mt-3 text-sm font-bold text-text-secondary max-w-2xl">
                    Perform deep certificate inspection including issuer validation, cipher suite analysis, key strength, and expiry countdown.
                </p>
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

                {results && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Report Summary */}
                        <div className={`p-6 rounded-xl border-2 ${results.report.issues.length === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                {results.report.issues.length === 0 ? (
                                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-amber-600" />
                                )}
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Security Summary</div>
                                    <div className="text-lg font-black text-text-primary">{results.report.summary}</div>
                                </div>
                            </div>
                            {results.report.issues.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-700">Issues Detected</div>
                                    {results.report.issues.map((issue, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm font-bold text-amber-800">
                                            <XCircle className="h-4 w-4 mt-0.5 shrink-0" /> {issue}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-6 pt-4 border-t border-black/5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Recommendations</div>
                                <ul className="space-y-1">
                                    {results.report.recommendations.map((rec, i) => (
                                        <li key={i} className="text-xs font-bold text-text-secondary">• {rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Certificate Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className={`p-4 rounded-xl border-2 text-center ${results.certificate.status.includes('Valid') ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Chain Status</div>
                                <div className={`text-lg font-black ${results.certificate.status.includes('Valid') ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {results.certificate.status.includes('Valid') ? 'VALID' : 'INVALID'}
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl border-2 text-center ${results.certificate.daysUntilExpiry > 30 ? 'bg-emerald-50 border-emerald-200' : results.certificate.daysUntilExpiry > 7 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Expiry</div>
                                <div className={`text-lg font-black ${results.certificate.daysUntilExpiry > 30 ? 'text-emerald-600' : results.certificate.daysUntilExpiry > 7 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {results.certificate.daysUntilExpiry} Days
                                </div>
                            </div>
                            <div className="p-4 rounded-xl border-2 bg-surface-light border-border-light text-center">
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Protocol</div>
                                <div className="text-lg font-black text-text-primary">{results.connection.protocol}</div>
                            </div>
                            <div className="p-4 rounded-xl border-2 bg-surface-light border-border-light text-center">
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Key Strength</div>
                                <div className="text-lg font-black text-text-primary">{results.certificate.keyStrength}</div>
                            </div>
                        </div>

                        {/* Advanced Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Diagnostic Sequence</h4>
                                <div className="rounded-xl bg-slate-900 p-6 font-mono text-[11px] text-white leading-relaxed shadow-xl relative overflow-hidden border border-white/5">
                                    <div className="absolute top-4 right-6 opacity-10"><Lock className="h-10 w-10" /></div>
                                    {logs.map((log, i) => (
                                        <p key={i} className={log.includes('validated') ? 'text-blue-400 font-bold mt-2' : 'opacity-70'}>
                                            <span className="mr-3 opacity-30 select-none">{i + 1}</span>
                                            {log}
                                        </p>
                                    ))}
                                    <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4">
                                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                                            <CheckCircle className="h-3.5 w-3.5" /> Audited
                                        </div>
                                        <div className="h-2 w-px bg-white/10"></div>
                                        <div className="opacity-40 text-[10px]">Query: {results.queryTime}ms</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-surface-light border border-border-light shadow-sm">
                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                        <Landmark className="h-3 w-3" /> Issuer
                                    </div>
                                    <div className="text-sm font-black text-text-primary truncate">{results.certificate.issuer}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-surface-light border border-border-light shadow-sm">
                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                        <Server className="h-3 w-3" /> Subject
                                    </div>
                                    <div className="text-sm font-black text-text-primary truncate">{results.certificate.subject}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-surface-light border border-border-light shadow-sm">
                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                        <Key className="h-3 w-3" /> Cipher Suite
                                    </div>
                                    <div className="text-xs font-mono font-bold text-text-secondary truncate">{results.connection.cipher}</div>
                                </div>
                                {results.certificate.altNames.length > 0 && (
                                    <div className="p-4 rounded-xl bg-surface-light border border-border-light shadow-sm">
                                        <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                            <Globe className="h-3 w-3" /> Alt Names ({results.certificate.altNames.length})
                                        </div>
                                        <div className="text-[10px] font-mono text-text-secondary max-h-20 overflow-y-auto space-y-0.5">
                                            {results.certificate.altNames.slice(0, 5).map((name, i) => (
                                                <div key={i} className="truncate">{name}</div>
                                            ))}
                                            {results.certificate.altNames.length > 5 && (
                                                <div className="opacity-50">+{results.certificate.altNames.length - 5} more...</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
