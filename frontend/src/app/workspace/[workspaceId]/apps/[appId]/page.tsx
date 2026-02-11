'use client';

import { useState, useEffect, use, useCallback, type CSSProperties } from 'react';
import { ArrowLeft, Send, Sparkles, Copy, Check, Zap, Code, FileText } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { IAppField, IApp } from '@/types/app';

interface SubmittedValue {
    label: string;
    value: any;
    isSecret: boolean;
}

export default function AppRunnerPage({ params }: { params: Promise<{ workspaceId: string; appId: string }> }) {
    const { workspaceId, appId } = use(params);
    const [app, setApp] = useState<IApp | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [inputs, setInputs] = useState<Record<string, any>>({});
    const [fileInputs, setFileInputs] = useState<Record<string, File | null>>({});
    const [result, setResult] = useState<string | null>(null);
    const [rawValues, setRawValues] = useState<Record<string, any> | null>(null);
    const [submittedValues, setSubmittedValues] = useState<Record<string, SubmittedValue> | null>(null);
    const [aiImproved, setAiImproved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('raw');
    const [submissionMode, setSubmissionMode] = useState<'generator' | 'form' | null>(null);

    const fetchApp = useCallback(async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/apps/${appId}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to fetch app');
            const data = await res.json();
            setApp(data.data);

            const defaults: Record<string, any> = {};
            const fileDefaults: Record<string, File | null> = {};

            data.data.fields?.forEach((f: IAppField) => {
                if (f.type === 'checkbox') defaults[f.id] = false;
                else if (f.type === 'file') {
                    defaults[f.id] = '';
                    fileDefaults[f.id] = null;
                } else if (f.type !== 'message' && f.type !== 'submit') {
                    defaults[f.id] = '';
                }
            });

            setInputs(defaults);
            setFileInputs(fileDefaults);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [workspaceId, appId]);

    useEffect(() => {
        fetchApp();
    }, [fetchApp]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setResult(null);
        setRawValues(null);
        setSubmittedValues(null);
        setAiImproved(false);
        setSubmissionMode(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const isForm = app?.tag === 'form';
            const endpoint = isForm
                ? `${apiUrl}/api/workspaces/${workspaceId}/apps/${appId}/submit`
                : `${apiUrl}/api/workspaces/${workspaceId}/apps/${appId}/run`;

            const requestInit: RequestInit = isForm
                ? (() => {
                      const formData = new FormData();
                      formData.append('inputs', JSON.stringify(inputs));
                      Object.entries(fileInputs).forEach(([fieldId, file]) => {
                          if (file) formData.append(`file:${fieldId}`, file);
                      });

                      return {
                          method: 'POST',
                          body: formData,
                          credentials: 'include',
                      };
                  })()
                : {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ inputs }),
                      credentials: 'include',
                  };

            const res = await fetch(endpoint, requestInit);

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Execution failed');
            }

            const data = await res.json();
            setSubmissionMode(data.data.mode || null);
            setAiImproved(!!data.data.aiImproved);

            if (data.data.mode === 'generator') {
                const nextResult = typeof data.data.resultText === 'string' && data.data.resultText.trim().length > 0 ? data.data.resultText : null;
                setResult(nextResult);
                setRawValues(data.data.rawValues || null);
            } else {
                const improvedText = typeof data.data.improvedText === 'string' && data.data.improvedText.trim().length > 0 ? data.data.improvedText : null;
                setResult(improvedText);
                setRawValues(data.data.rawValues || null);
            }

            if (data.data.submittedValues) {
                setSubmittedValues(data.data.submittedValues);
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopy = () => {
        const textToCopy = result || (rawValues ? JSON.stringify(rawValues, null, 2) : '');
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderValue = (value: any) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
        if (Array.isArray(value)) return value.map((v) => String(v)).join(', ');
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-base">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-sm text-text-muted font-bold">Loading app...</p>
                </div>
            </div>
        );

    if (!app)
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-base">
                <p className="text-red-500 font-bold">App not found</p>
            </div>
        );

    const fields = app.fields || [];
    const submitField = fields.find((f) => f.type === 'submit');
    const bg = app.layout?.background;
    const hasOutput = !!result || !!rawValues || !!submittedValues;

    const bgStyle: CSSProperties = {};
    if (app.launchMode === 'new_tab' && bg) {
        if (bg.type === 'image' && bg.value?.startsWith('http')) {
            bgStyle.backgroundImage = `url(${bg.value})`;
            bgStyle.backgroundSize = 'cover';
            bgStyle.backgroundPosition = 'center';
            bgStyle.backgroundAttachment = 'fixed';
        } else if (bg.type === 'gradient') {
            bgStyle.background = bg.value;
        } else if (bg.type === 'solid') {
            bgStyle.backgroundColor = bg.value;
        }
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={app.launchMode === 'new_tab' ? bgStyle : undefined}>
            {app.launchMode === 'new_tab' && bg?.type === 'image' && <div className="fixed inset-0 bg-black/20 -z-10" />}

            <div className="w-full lg:w-1/2 mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <Link href={`/workspace/${workspaceId}/apps`} className="text-text-muted hover:text-text-primary flex items-center gap-2 text-sm font-bold backdrop-blur-sm bg-white/70 px-3 py-1.5 rounded-lg">
                        <ArrowLeft size={16} /> Back to Apps
                    </Link>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-border-light">
                    <div className="bg-surface-light border-b border-border-light p-8 text-center">
                        {app.layout?.header?.logoUrl && (
                            <img src={app.layout.header.logoUrl} alt="Logo" className="h-auto w-auto max-w-[300px] max-h-[300px] mx-auto mb-4 object-contain rounded-lg" />
                        )}
                        <h1 className="text-3xl font-black text-text-primary tracking-tight">{app.name}</h1>
                        {app.description && <p className="text-text-muted mt-1.5 text-sm">{app.description}</p>}
                        {app.layout?.header?.subtitle && <p className="text-text-muted mt-2 font-medium">{app.layout.header.subtitle}</p>}
                    </div>

                    {hasOutput && (
                        <div className="p-8 bg-blue-50 border-b border-blue-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold uppercase text-blue-800 flex items-center gap-2">
                                    <Sparkles size={16} />
                                    {submissionMode === 'form' ? (result ? 'Submission Preview' : 'Submission Details') : result ? 'Generated Result' : 'Raw Submitted Values'}
                                    {aiImproved && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase">
                                            <Zap size={10} /> AI Enhanced
                                        </span>
                                    )}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {result && (
                                        <div className="flex bg-white rounded-lg border border-blue-200 overflow-hidden">
                                            <button
                                                onClick={() => setViewMode('rendered')}
                                                className={`px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1 transition-colors ${
                                                    viewMode === 'rendered' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                                                }`}
                                            >
                                                <FileText size={10} /> Rendered
                                            </button>
                                            <button
                                                onClick={() => setViewMode('raw')}
                                                className={`px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1 transition-colors ${
                                                    viewMode === 'raw' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                                                }`}
                                            >
                                                <Code size={10} /> Raw MD
                                            </button>
                                        </div>
                                    )}
                                    <button onClick={handleCopy} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold uppercase bg-white px-2.5 py-1.5 rounded-lg border border-blue-200">
                                        {copied ? <Check size={12} /> : <Copy size={12} />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            {submittedValues && Object.keys(submittedValues).length > 0 && (
                                <div className="mb-4 bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                                    <div className="px-4 py-2.5 bg-gray-50 border-b border-blue-100">
                                        <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">Submitted Values</span>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {Object.entries(submittedValues).map(([fieldId, sv]) => (
                                            <div key={fieldId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                                <span className="font-bold text-text-primary text-xs">{sv.label}</span>
                                                <span className="text-text-secondary text-xs max-w-[60%] text-right">{renderValue(sv.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result && viewMode === 'rendered' ? (
                                <div className="prose prose-sm max-w-none bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                                </div>
                            ) : rawValues ? (
                                <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl border border-blue-100 shadow-sm text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                                    {result || JSON.stringify(rawValues || {}, null, 2)}
                                </pre>
                            ) : (
                                <div className="bg-white p-4 rounded-lg border border-blue-100 text-sm text-blue-900">Submission sent successfully.</div>
                            )}

                            <button
                                onClick={() => {
                                    setResult(null);
                                    setRawValues(null);
                                    setSubmittedValues(null);
                                    setAiImproved(false);
                                    setSubmissionMode(null);
                                    setViewMode('rendered');
                                    setFileInputs((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, null])));
                                }}
                                className="mt-4 text-xs font-bold text-blue-600 hover:underline"
                            >
                                Start Over
                            </button>
                        </div>
                    )}

                    {!hasOutput && (
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {fields.map((field) => {
                                if (field.type === 'submit') return null;

                                return (
                                    <div key={field.id}>
                                        {field.type === 'message' ? (
                                            <div className="prose prose-sm text-text-muted bg-surface-light p-4 rounded-lg border border-border-light" dangerouslySetInnerHTML={{ __html: field.messageHtml || '' }} />
                                        ) : (
                                            <>
                                                <label className="block text-sm font-bold text-text-primary mb-2">
                                                    {field.label}
                                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                                </label>

                                                {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'number' || field.type === 'date') && (
                                                    <input
                                                        type={field.type === 'phone' ? 'tel' : field.type}
                                                        className="input-base w-full p-3 border border-border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                        value={inputs[field.id] || ''}
                                                        onChange={(e) => setInputs({ ...inputs, [field.id]: e.target.value })}
                                                        required={field.required}
                                                    />
                                                )}

                                                {field.type === 'file' && (
                                                    <input
                                                        type="file"
                                                        className="input-base w-full p-3 border border-border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                                        accept={field.acceptedFileTypes || undefined}
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] || null;
                                                            setFileInputs({ ...fileInputs, [field.id]: file });
                                                            setInputs({ ...inputs, [field.id]: file?.name || '' });
                                                        }}
                                                        required={field.required}
                                                    />
                                                )}

                                                {field.type === 'textarea' && (
                                                    <textarea
                                                        className="input-base w-full p-3 border border-border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-32"
                                                        value={inputs[field.id] || ''}
                                                        onChange={(e) => setInputs({ ...inputs, [field.id]: e.target.value })}
                                                        required={field.required}
                                                    />
                                                )}

                                                {field.type === 'list' && (
                                                    <select
                                                        className="input-base w-full p-3 border border-border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                                        value={inputs[field.id] || ''}
                                                        onChange={(e) => setInputs({ ...inputs, [field.id]: e.target.value })}
                                                        required={field.required}
                                                    >
                                                        <option value="" disabled>
                                                            Select an option...
                                                        </option>
                                                        {field.options?.map((opt, i) => (
                                                            <option key={i} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}

                                                {field.type === 'checkbox' && (
                                                    <label className="flex items-center gap-3 p-3 border border-border-light rounded-lg cursor-pointer hover:bg-surface-light transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                            checked={inputs[field.id] || false}
                                                            onChange={(e) => setInputs({ ...inputs, [field.id]: e.target.checked })}
                                                        />
                                                        <span className="text-sm font-medium text-text-secondary">{field.label || 'Yes, I agree'}</span>
                                                    </label>
                                                )}

                                                {field.type === 'radio' && field.options && (
                                                    <div className="space-y-2">
                                                        {field.options.map((opt, i) => (
                                                            <label key={i} className="flex items-center gap-3 p-3 border border-border-light rounded-lg cursor-pointer hover:bg-surface-light transition-colors">
                                                                <input
                                                                    type="radio"
                                                                    name={field.id}
                                                                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                                    value={opt.value}
                                                                    checked={inputs[field.id] === opt.value}
                                                                    onChange={(e) => setInputs({ ...inputs, [field.id]: e.target.value })}
                                                                />
                                                                <span className="text-sm font-medium text-text-secondary">{opt.label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="pt-6 border-t border-border-light">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                            {app.tag === 'form' ? 'Submitting...' : 'Generating...'}
                                        </>
                                    ) : (
                                        <>
                                            {submitField?.submitText || 'Submit'}
                                            <Send size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
