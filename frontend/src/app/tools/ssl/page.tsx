'use client';

import { useState } from 'react';
import { Shield, Search, Calendar, Landmark, CheckCircle, Lock } from 'lucide-react';

interface SSLResults {
    status: string;
    expiry: string;
    issuer: string;
    aiReport: string;
}

export default function SSLAnalyzer() {
    const [domain, setDomain] = useState('');
    const [results, setResults] = useState<SSLResults | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLookup = async () => {
        setLoading(true);
        // Mock API Call
        setTimeout(() => {
            setResults({
                status: 'Secure',
                expiry: '2026-12-31',
                issuer: "Let's Encrypt E6",
                aiReport: 'The certificate is healthy and uses modern ECC encryption standards (TLS 1.3). No mixed content or vulnerability chains detected.'
            });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="card max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Shield className="h-5 w-5" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark">SSL Fortress</h1>
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
                        {loading ? 'Analyzing...' : 'Deep Scan'}
                    </button>
                </div>

                {results && (
                    <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div className="rounded-xl border border-border-light bg-surface-light p-6 dark:border-border-dark dark:bg-surface-dark">
                                <div className="flex items-center gap-2 mb-3 text-text-muted text-[11px] font-bold uppercase tracking-wider">
                                    <Lock className="h-3 w-3" /> Status
                                </div>
                                <div className="text-lg font-bold text-primary">{results.status}</div>
                            </div>
                            <div className="rounded-xl border border-border-light bg-surface-light p-6 dark:border-border-dark dark:bg-surface-dark">
                                <div className="flex items-center gap-2 mb-3 text-text-muted text-[11px] font-bold uppercase tracking-wider">
                                    <Calendar className="h-3 w-3" /> Expiry
                                </div>
                                <div className="text-lg font-bold text-text-primary dark:text-text-dark">{results.expiry}</div>
                            </div>
                            <div className="rounded-xl border border-border-light bg-surface-light p-6 dark:border-border-dark dark:bg-surface-dark">
                                <div className="flex items-center gap-2 mb-3 text-text-muted text-[11px] font-bold uppercase tracking-wider">
                                    <Landmark className="h-3 w-3" /> Issuer
                                </div>
                                <div className="text-lg font-bold text-text-primary dark:text-text-dark">{results.issuer}</div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8">
                            <div className="flex items-center gap-2 mb-4 text-primary">
                                <CheckCircle className="h-5 w-5" />
                                <h3 className="font-bold">✨ AI Security Sentiment</h3>
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

