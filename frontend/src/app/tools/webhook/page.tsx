'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Webhook, Activity, AlertCircle, ArrowLeft, Send, Play, Code } from 'lucide-react';
import FAQ from '@/components/FAQ';

interface WebhookResponse {
    status: number;
    statusText: string;
    headers: any;
    data: any;
    duration: number;
}

export default function WebhookDebugger() {
    const [url, setUrl] = useState('');
    const [method, setMethod] = useState('POST');
    const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
    const [body, setBody] = useState('{\n  "test": true\n}');

    const [response, setResponse] = useState<WebhookResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async () => {
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            // Parse headers and body
            let parsedHeaders = {};
            let parsedBody = {};

            try {
                parsedHeaders = JSON.parse(headers);
            } catch (e) {
                throw new Error('Invalid JSON in Headers');
            }

            try {
                if (method !== 'GET') {
                    parsedBody = JSON.parse(body);
                }
            } catch (e) {
                throw new Error('Invalid JSON in Body');
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/tools/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    method,
                    headers: parsedHeaders,
                    body: parsedBody
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Request failed');
            }

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
                    <Webhook className="h-3.5 w-3.5" /> WorkToolsHub / API Tester
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">Webhook Debugger.</h1>
                <p className="mt-3 text-sm font-bold text-text-secondary max-w-2xl">
                    Test your webhook endpoints by simulating payloads. Inspect status codes, headers, and response bodies in real-time.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Request Config */}
                <div className="card border border-border-light bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                        <Send className="h-4 w-4" /> Request Configuration
                    </h3>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="h-10 rounded-lg border border-border-light bg-surface-light px-3 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                                <option value="PATCH">PATCH</option>
                            </select>
                            <input
                                type="url"
                                placeholder="https://api.example.com/webhook"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="h-10 flex-1 rounded-lg border border-border-light bg-surface-light px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Headers (JSON)</label>
                            <textarea
                                value={headers}
                                onChange={(e) => setHeaders(e.target.value)}
                                className="w-full h-32 rounded-lg border border-border-light bg-surface-light px-4 py-3 text-xs font-mono outline-none focus:border-blue-600 transition-all resize-none"
                            />
                        </div>

                        {method !== 'GET' && (
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Body (JSON)</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    className="w-full h-48 rounded-lg border border-border-light bg-surface-light px-4 py-3 text-xs font-mono outline-none focus:border-blue-600 transition-all resize-none"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleSend}
                            disabled={loading || !url}
                            className="btn-primary w-full h-12 gap-2 mt-2"
                        >
                            {loading ? <Activity className="h-4 w-4 animate-spin" /> : 'Send Request'}
                        </button>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-bold">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Response Viewer */}
                <div className="card border border-border-light bg-white p-6 shadow-sm flex flex-col h-full">
                    <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                        <Code className="h-4 w-4" /> Response Output
                    </h3>

                    {response ? (
                        <div className="space-y-4 flex-1 flex flex-col">
                            <div className="flex items-center gap-4">
                                <div className={`badge ${response.status >= 200 && response.status < 300 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} font-mono font-bold px-3 py-1 rounded-md`}>
                                    Status: {response.status} {response.statusText}
                                </div>
                                <div className="text-xs font-mono text-text-muted">
                                    Time: {response.duration}ms
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col min-h-[300px]">
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Response Body</div>
                                <pre className="flex-1 w-full rounded-lg border border-border-light bg-surface-light p-4 text-xs font-mono overflow-auto max-h-[500px]">
                                    {typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50 border-2 border-dashed border-border-light rounded-xl">
                            <Activity className="h-8 w-8 mb-2" />
                            <span className="text-xs font-bold">No request sent yet</span>
                        </div>
                    )}
                </div>
            </div>

            <FAQ
                items={[
                    {
                        question: "What is a Webhook?",
                        answer: "A webhook is a way for an app to provide other applications with real-time information. It delivers data to other applications as it happens, meaning you get data immediately."
                    },
                    {
                        question: "How do I use this debugger?",
                        answer: "Enter your webhook destination URL, select the HTTP method (usually POST), configure your headers, and paste your JSON payload. Click 'Send Request' to simulate a webhook event."
                    },
                    {
                        question: "Does this tool support mutual TLS?",
                        answer: "Currently, this tool supports standard HTTPS connections. Mutual TLS (client certificates) is not supported in this version."
                    },
                    {
                        question: "Can I test local URLs?",
                        answer: "This tool runs from our servers, so it cannot access 'localhost'. Use a service like ngrok to expose your local server to the internet if you need to test it."
                    }
                ]}
            />
        </div>
    );
}
