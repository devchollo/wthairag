'use client';

import { useState } from 'react';
import { Server, Search, CheckCircle, AlertCircle } from 'lucide-react';

interface DNSResults {
    A?: string[];
    MX?: { exchange: string; priority: number }[];
    aiReport: string;
}

export default function DNSChecker() {
    const [domain, setDomain] = useState('');
    const [results, setResults] = useState<DNSResults | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLookup = async () => {
        setLoading(true);
        // Call backend API (Mock)
        setTimeout(() => {
            setResults({
                A: ['192.168.1.1'],
                MX: [{ exchange: 'mail.example.com', priority: 10 }],
                aiReport: 'Domain correctly configured. No issues found. Global propagation is active across all 12 monitored nodes.'
            });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="card max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Server className="h-5 w-5" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark">DNS Inspector</h1>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <input
                        type="text"
                        placeholder="example.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="h-11 flex-1 rounded-lg border border-border-light bg-white px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark"
                    />
                    <button
                        onClick={handleLookup}
                        className="btn-primary"
                        disabled={loading || !domain}
                    >
                        {loading ? 'Analyzing...' : 'Run Analysis'}
                    </button>
                </div>

                {results && (
                    <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="rounded-xl border border-border-light bg-surface-light p-6 dark:border-border-dark dark:bg-surface-dark">
                                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">A Records</h3>
                                <div className="space-y-2">
                                    {results.A?.map((ip, i) => (
                                        <div key={i} className="font-mono text-sm text-text-primary dark:text-text-dark">{ip}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-xl border border-border-light bg-surface-light p-6 dark:border-border-dark dark:bg-surface-dark">
                                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">MX Records</h3>
                                <div className="space-y-2">
                                    {results.MX?.map((mx, i) => (
                                        <div key={i} className="text-sm text-text-primary dark:text-text-dark">
                                            <span className="font-mono">{mx.exchange}</span>
                                            <span className="ml-2 text-text-muted">({mx.priority})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8">
                            <div className="flex items-center gap-2 mb-4 text-primary">
                                <CheckCircle className="h-5 w-5" />
                                <h3 className="font-bold">✨ AI Analysis Report</h3>
                            </div>
                            <p className="text-lg leading-relaxed text-text-primary dark:text-text-dark opacity-90">
                                {results.aiReport}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

