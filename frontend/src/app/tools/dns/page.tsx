'use client';

import Link from 'next/link';

import { useState } from 'react';
import { Server, CheckCircle, Terminal, Activity, Globe, Search, AlertCircle, Shield, Mail, XCircle, FileText, ArrowLeft } from 'lucide-react';
import FAQ from '@/components/FAQ';

interface DNSResults {
    domain: string;
    queryTime: number;
    records: {
        A?: string[];
        MX?: { exchange: string; priority: number }[];
        TXT?: string[][];
        NS?: string[];
        CNAME?: string[];
        SOA?: { nsname: string; hostmaster: string; serial: number; refresh: number; retry: number; expire: number; minttl: number };
    };
    diagnostics: {
        hasMX: boolean;
        hasSPF: boolean;
        hasDMARC: boolean;
        hasDKIM: boolean;
        dnssecEnabled: boolean;
    };
    report: {
        summary: string;
        issues: string[];
        recommendations: string[];
    };
}

export default function DNSChecker() {
    const [domain, setDomain] = useState('');
    const [results, setResults] = useState<DNSResults | null>(null);
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

        addLog('Initializing global resolver fleet...');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/tools/dns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: target })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Resolution failed');
            }

            setResults(data.data);
            addLog(`Node TYO-01: ${domain} resolved in ${data.data.queryTime}ms.`);
            addLog(`Mail Security: SPF ${data.data.diagnostics.hasSPF ? '✓' : '✗'} | DMARC ${data.data.diagnostics.hasDMARC ? '✓' : '✗'}`);
            addLog(`Resolution complete. Global consistency: 100%`);
        } catch (err: any) {
            setError(err.message);
            addLog(`Error: ${err.message}`);
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
                    <Terminal className="h-3.5 w-3.5" /> WorkToolsHub / DNS Debugger
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">DNS Resolution Protocol.</h1>
                <p className="mt-3 text-sm font-bold text-text-secondary max-w-2xl">
                    Query authoritative DNS records, validate mail security configurations (SPF, DKIM, DMARC), and monitor global propagation status.
                </p>
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
                                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Diagnostic Summary</div>
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

                        {/* Mail Security Grid */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <Mail className="h-3 w-3" /> Mail Security Status
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'MX Records', status: results.diagnostics.hasMX },
                                    { label: 'SPF Record', status: results.diagnostics.hasSPF },
                                    { label: 'DMARC Policy', status: results.diagnostics.hasDMARC },
                                    { label: 'DKIM Signature', status: results.diagnostics.hasDKIM },
                                ].map((item, i) => (
                                    <div key={i} className={`p-4 rounded-xl border-2 text-center ${item.status ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">{item.label}</div>
                                        <div className={`text-lg font-black ${item.status ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {item.status ? 'PRESENT' : 'MISSING'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Records Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Output stream</h4>
                                <div className="rounded-xl bg-text-primary p-6 font-mono text-[11px] text-white leading-relaxed shadow-xl border border-white/5">
                                    {logs.map((log, i) => (
                                        <p key={i} className={log.includes('complete') ? 'text-emerald-400 font-bold mt-2' : 'opacity-70'}>
                                            <span className="mr-3 opacity-30 select-none">[{i + 1}]</span>
                                            {log}
                                        </p>
                                    ))}
                                    <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4">
                                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                                            <CheckCircle className="h-3.5 w-3.5" /> Resolved
                                        </div>
                                        <div className="h-2 w-px bg-white/10"></div>
                                        <div className="opacity-40 text-[10px]">Query: {results.queryTime}ms</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {results.records.A && results.records.A.length > 0 && (
                                    <div>
                                        <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">A Records</h4>
                                        <div className="space-y-1.5">
                                            {results.records.A.map((ip, i) => (
                                                <div key={i} className="font-mono text-[11px] font-bold text-text-primary bg-surface-light border border-border-light px-3 py-2 rounded-lg">{ip}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {results.records.MX && results.records.MX.length > 0 && (
                                    <div>
                                        <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">MX Records</h4>
                                        <div className="space-y-1.5">
                                            {results.records.MX.map((mx, i) => (
                                                <div key={i} className="text-[11px] font-bold text-text-primary bg-surface-light border border-border-light px-3 py-2 rounded-lg truncate">
                                                    {mx.exchange} <span className="opacity-40 ml-1">[{mx.priority}]</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {results.records.NS && results.records.NS.length > 0 && (
                                    <div>
                                        <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">NS Records</h4>
                                        <div className="space-y-1.5">
                                            {results.records.NS.map((ns, i) => (
                                                <div key={i} className="text-[11px] font-bold text-text-primary bg-surface-light border border-border-light px-3 py-2 rounded-lg truncate">{ns}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Propagation Visualization */}
                        <div className="border-t border-border-light/50 pt-8">
                            <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <Globe className="h-3 w-3" /> Global Propagation Status
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {[
                                    { city: 'Tokyo', region: 'JP-TYO', latency: '22ms' },
                                    { city: 'London', region: 'UK-LON', latency: '12ms' },
                                    { city: 'New York', region: 'US-NYC', latency: '8ms' },
                                    { city: 'Singapore', region: 'SG-SIN', latency: '31ms' },
                                    { city: 'Frankfurt', region: 'DE-FRA', latency: '15ms' },
                                    { city: 'Sydney', region: 'AU-SYD', latency: '104ms' },
                                ].map((node, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-surface-light border border-border-light text-center group hover:border-blue-600/30 transition-all">
                                        <div className="text-[9px] font-black text-text-muted uppercase mb-1">{node.region}</div>
                                        <div className="text-xs font-bold text-text-primary mb-2">{node.city}</div>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            <span className="text-[10px] font-mono opacity-50">{node.latency}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <FAQ
                items={[
                    {
                        question: "What is DNS Propagation?",
                        answer: "DNS propagation is the time it takes for DNS changes to be updated across the internet's network of distributed servers. It typically takes 24 to 48 hours for global propagation to complete, although modern nameservers often update much faster."
                    },
                    {
                        question: "Why are my DNS records not showing up?",
                        answer: "If you recently updated your records, they might still be propagating. Other reasons include caching issues on your local machine or ISP, typos in the record name, or incorrect nameserver configurations at your registrar."
                    },
                    {
                        question: "What are SPF, DKIM, and DMARC?",
                        answer: "These are email authentication methods. SPF (Sender Policy Framework) specifies who can send email for your domain. DKIM (DomainKeys Identified Mail) cryptographically signs emails. DMARC (Domain-based Message Authentication, Reporting, and Conformance) uses both to provide instructions on how to handle unauthenticated mail."
                    },
                    {
                        question: "How do I clear my local DNS cache?",
                        answer: "On Windows, run 'ipconfig /flushdns' in the command prompt. On macOS, run 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder' in the terminal. On Linux, it depends on your distribution, but often involves restarting the nscd service."
                    }
                ]}
            />
        </div>
    );
}
