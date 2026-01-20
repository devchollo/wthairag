'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Terminal, Activity, AlertCircle, CheckCircle, ArrowLeft, Send, Shield, Globe } from 'lucide-react';
import FAQ from '@/components/FAQ';

export default function WebhookDebugger() {
    const [url, setUrl] = useState('');
    const [method, setMethod] = useState('POST');
    const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
    const [body, setBody] = useState('{\n  "event": "test",\n  "timestamp": "' + new Date().toISOString() + '"\n}');

    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTest = async () => {
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/tools/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    method,
                    headers: JSON.parse(headers || '{}'),
                    body: JSON.parse(body || '{}')
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Webhook test failed');

            setResponse(data.data);
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
                    <Terminal className="h-3.5 w-3.5" /> WorkToolsHub / API Debugger
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">Webhook Debugger.</h1>
                <p className="mt-3 text-sm font-bold text-text-secondary max-w-2xl">
                    Trigger and debug webhooks with custom payloads and headers. Verify endpoint responses and latency in real-time.
                </p>
            </div>

            <div className="card border border-border-light bg-white p-6 shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Method</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full h-10 rounded-lg border border-border-light bg-surface-light px-3 text-xs font-black outline-none focus:border-blue-600 appearance-none cursor-pointer"
                        >
                            <option>POST</option>
                            <option>GET</option>
                            <option>PUT</option>
                            <option>PATCH</option>
                            <option>DELETE</option>
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Endpoint URL</label>
                        <input
                            type="url"
                            placeholder="https://your-api.com/webhook"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full h-10 rounded-lg border border-border-light bg-surface-light px-4 text-sm font-bold outline-none focus:border-blue-600 font-mono"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Custom Headers (JSON)</label>
                        <textarea
                            value={headers}
                            onChange={(e) => setHeaders(e.target.value)}
                            className="w-full h-[150px] p-4 rounded-xl border border-border-light bg-surface-light font-mono text-[11px] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Payload Body (JSON)</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="w-full h-[150px] p-4 rounded-xl border border-border-light bg-surface-light font-mono text-[11px] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                        />
                    </div>
                </div>

                <button
                    onClick={handleTest}
                    className="btn-primary w-full py-4 gap-2"
                    disabled={loading || !url}
                >
                    {loading ? <Activity className="h-4 w-4 animate-spin" /> : <Send size={18} />}
                    Trigger Webhook Request
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm font-bold">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {response && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-text-primary tracking-tight">Execution Result.</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest">
                                <Activity size={14} /> {response.duration}ms latency
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${response.status < 300 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                HTTP {response.status} {response.statusText}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Response Headers</label>
                            <pre className="p-4 rounded-xl bg-surface-light border border-border-light font-mono text-[10px] overflow-auto max-h-[300px]">
                                {JSON.stringify(response.headers, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Response Body</label>
                            <pre className="p-4 rounded-xl bg-surface-light border border-border-light font-mono text-[10px] overflow-auto max-h-[300px]">
                                {JSON.stringify(response.data, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            <FAQ
                items={[
                    {
                        question: "Proxied Requests?",
                        answer: "All requests are proxied through our core infrastructure to ensure your origin IP is protected and to bypass CORS restrictions for your testing."
                    },
                    {
                        question: "Rate Limits",
                        answer: "Webhook debugging is subject to standard system limits to prevent abuse. For heavy testing, consider utilizing our CLI primitive."
                    }
                ]}
            />
        </div>
    );
}
