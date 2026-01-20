'use client';

import Link from 'next/link';

import { useState } from 'react';
import { Globe, Calendar, Server, Shield, AlertCircle, CheckCircle, Activity, Copy, ExternalLink, ArrowLeft } from 'lucide-react';
import FAQ from '@/components/FAQ';

interface WhoisResults {
    domain: string;
    registrar: string;
    registrarUrl: string | null;
    creationDate: string | null;
    expirationDate: string | null;
    updatedDate: string | null;
    nameServers: string[];
    status: string[];
    dnssec: string;
    abuseContact: string | null;
    abusePhone: string | null;
    queryTime: number;
}

export default function WhoisLookup() {
    const [domain, setDomain] = useState('');
    const [results, setResults] = useState<WhoisResults | null>(null);
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
            const response = await fetch(`${apiUrl}/api/tools/whois`, {
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

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="mx-auto max-w-[1100px] px-6 py-12">
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-blue-600 transition-colors mb-8 group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Tools
            </Link>
            <div className="mb-10">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Globe className="h-3.5 w-3.5" /> WorkToolsHub / WHOIS Lookup
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">Domain Registration Data.</h1>
                <p className="mt-3 text-sm font-bold text-text-secondary max-w-2xl">
                    Query public WHOIS records to find registrar information, registration dates, nameservers, and abuse contacts.
                </p>
            </div>

            <div className="card border border-border-light bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row mb-8">
                    <input
                        type="text"
                        placeholder="Enter domain (e.g., github.com)"
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
                        {loading ? <Activity className="h-4 w-4 animate-spin" /> : 'Lookup'}
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
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-surface-light border border-border-light text-center">
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Registrar</div>
                                <div className="text-sm font-black text-text-primary truncate">{results.registrar}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-surface-light border border-border-light text-center">
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Created</div>
                                <div className="text-sm font-black text-text-primary">{formatDate(results.creationDate)}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-surface-light border border-border-light text-center">
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Expires</div>
                                <div className="text-sm font-black text-text-primary">{formatDate(results.expirationDate)}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-surface-light border border-border-light text-center">
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">DNSSEC</div>
                                <div className={`text-sm font-black ${results.dnssec?.toLowerCase().includes('signed') ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {results.dnssec?.toLowerCase().includes('signed') ? 'SIGNED' : 'UNSIGNED'}
                                </div>
                            </div>
                        </div>

                        {/* Nameservers */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <Server className="h-3 w-3" /> Nameservers
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(Array.isArray(results.nameServers) ? results.nameServers : []).map((ns, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-light border border-border-light">
                                        <span className="font-mono text-sm font-bold text-text-primary truncate">{ns}</span>
                                        <button onClick={() => copyToClipboard(ns)} className="p-1.5 hover:bg-white rounded-lg transition-colors">
                                            <Copy className="h-4 w-4 text-text-muted" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status */}
                        {results.status && results.status.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    <Shield className="h-3 w-3" /> Domain Status
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {results.status.map((status, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-700 truncate max-w-xs">
                                            {status.split(' ')[0]}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Abuse Contact */}
                        {results.abuseContact && (
                            <div className="p-6 rounded-xl bg-amber-50 border border-amber-100">
                                <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-amber-700">
                                    <AlertCircle className="h-3 w-3" /> Abuse Contact
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-bold text-text-primary">{results.abuseContact}</div>
                                    {results.abusePhone && <div className="text-xs font-bold text-text-muted">{results.abusePhone}</div>}
                                </div>
                            </div>
                        )}

                        {/* Query Time */}
                        <div className="text-center pt-4 border-t border-border-light">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                Query completed in {results.queryTime}ms
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <FAQ
                items={[
                    {
                        question: "What is WHOIS data?",
                        answer: "WHOIS is a public database that stores information about who owns a domain name, how to contact them, and when the domain expires. It is maintained by registrars and registries under ICANN regulations."
                    },
                    {
                        question: "Why is the owner's name hidden?",
                        answer: "Due to privacy regulations like GDPR, many domain owners use 'WHOIS Privacy' or 'Redacted for Privacy' services to hide their personal contact details from spammers and scammers while still complying with registration requirements."
                    },
                    {
                        question: "What is an Abuse Contact?",
                        answer: "The abuse contact is a specific email or phone number designated by the registrar for reporting illegal activity, spam, or phishing associated with a domain. This is the primary point of contact for taking down malicious sites."
                    },
                    {
                        question: "What does 'ClientTransferProhibited' mean?",
                        answer: "This is a common domain status code that prevents the domain from being transferred to another registrar without the owner's explicit permission. It is a security feature to prevent domain hijacking."
                    }
                ]}
            />
        </div>
    );
}
