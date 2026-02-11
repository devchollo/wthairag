'use client';

import { useState, useEffect, use, type CSSProperties } from 'react';
import { Send, Sparkles, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IApp, IAppField } from '@/types/app';

export default function PublicSharedFormPage({ params }: { params: Promise<{ shareToken: string }> }) {
    const { shareToken } = use(params);
    const [app, setApp] = useState<IApp | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [inputs, setInputs] = useState<Record<string, string | boolean>>({});
    const [fileInputs, setFileInputs] = useState<Record<string, File | null>>({});
    const [result, setResult] = useState<string | null>(null);

    useEffect(() => {
        const fetchApp = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${apiUrl}/api/apps/public/${shareToken}`);
                if (!res.ok) {
                    const e = await res.json();
                    throw new Error(e.message || 'Link is invalid or expired');
                }

                const data = await res.json();
                setApp(data.data);

                const defaults: Record<string, string | boolean> = {};
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
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to load shared form';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchApp();
    }, [shareToken]);


    const getInputValue = (fieldId: string) => {
        const value = inputs[fieldId];
        return typeof value === 'string' ? value : '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setResult(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const hasFileFields = (app?.fields || []).some((field) => field.type === 'file');
            const endpoint = `${apiUrl}/api/apps/public/${shareToken}/submit`;

            const requestInit: RequestInit = hasFileFields
                ? (() => {
                      const formData = new FormData();
                      formData.append('inputs', JSON.stringify(inputs));
                      Object.entries(fileInputs).forEach(([fieldId, file]) => {
                          if (file) formData.append(`file:${fieldId}`, file);
                      });

                      return {
                          method: 'POST',
                          body: formData,
                      };
                  })()
                : {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ inputs }),
                  };

            const res = await fetch(endpoint, requestInit);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Submission failed');
            }

            const data = await res.json();
            if (typeof data.data?.improvedText === 'string') {
                setResult(data.data.improvedText);
            } else {
                setResult('Submission received successfully.');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Submission failed';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const bg = app?.layout?.background;
    const bgStyle: CSSProperties = {};
    if (app?.launchMode === 'new_tab' && bg) {
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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading shared form...</div>;
    if (error || !app) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">{error || 'Shared form not found'}</div>;

    const fields = app.fields || [];
    const submitField = fields.find((f) => f.type === 'submit');

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={app.launchMode === 'new_tab' ? bgStyle : undefined}>
            {app.launchMode === 'new_tab' && bg?.type === 'image' && <div className="fixed inset-0 bg-black/20 -z-10" />}
            <div className="w-full lg:w-1/2 mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-border-light">
                    <div className="bg-surface-light border-b border-border-light p-8 text-center">
                        {app.layout?.header?.logoUrl && (
                            <img src={app.layout.header.logoUrl} alt="Logo" className="h-auto w-auto max-w-[300px] max-h-[300px] mx-auto mb-4 object-contain rounded-lg" />
                        )}
                        <h1 className="text-3xl font-black text-text-primary tracking-tight">{app.name}</h1>
                        <div className="mt-2 flex items-center justify-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">
                                <Globe size={10} className="mr-1" /> Public Link
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700">form</span>
                        </div>
                        {app.description && <p className="text-text-muted mt-1.5 text-sm">{app.description}</p>}
                    </div>

                    {result && (
                        <div className="p-6 bg-emerald-50 border-b border-emerald-100">
                            <h3 className="text-sm font-bold uppercase text-emerald-800 flex items-center gap-2 mb-2">
                                <Sparkles size={16} /> Submission Preview
                            </h3>
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mx-8 mt-6 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wide inline-flex items-center bg-red-100 text-red-700 border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                        {fields.map((field) => {
                            if (field.type === 'message') {
                                return <div key={field.id} className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: field.messageHtml || '' }} />;
                            }
                            if (field.type === 'submit') return null;

                            const commonInputClass = 'w-full border border-border-light rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

                            return (
                                <div key={field.id}>
                                    {field.label && <label className="block text-sm font-bold text-text-primary mb-1.5">{field.label}{field.required ? ' *' : ''}</label>}

                                    {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'number' || field.type === 'date') && (
                                        <input
                                            type={field.type === 'phone' ? 'tel' : field.type}
                                            className={commonInputClass}
                                            value={getInputValue(field.id)}
                                            onChange={(e) => setInputs((prev) => ({ ...prev, [field.id]: e.target.value }))}
                                            required={field.required}
                                        />
                                    )}

                                    {field.type === 'textarea' && (
                                        <textarea
                                            className={`${commonInputClass} min-h-[120px]`}
                                            value={getInputValue(field.id)}
                                            onChange={(e) => setInputs((prev) => ({ ...prev, [field.id]: e.target.value }))}
                                            required={field.required}
                                        />
                                    )}

                                    {field.type === 'checkbox' && (
                                        <input
                                            type="checkbox"
                                            checked={!!inputs[field.id]}
                                            onChange={(e) => setInputs((prev) => ({ ...prev, [field.id]: e.target.checked }))}
                                            className="h-4 w-4"
                                        />
                                    )}

                                    {(field.type === 'radio' || field.type === 'list') && (
                                        <select
                                            className={commonInputClass}
                                            value={getInputValue(field.id)}
                                            onChange={(e) => setInputs((prev) => ({ ...prev, [field.id]: e.target.value }))}
                                            required={field.required}
                                        >
                                            <option value="">Select...</option>
                                            {(field.options || []).map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    )}

                                    {field.type === 'file' && (
                                        <input
                                            type="file"
                                            className={commonInputClass}
                                            accept={field.acceptedFileTypes || undefined}
                                            onChange={(e) => setFileInputs((prev) => ({ ...prev, [field.id]: e.target.files?.[0] || null }))}
                                            required={field.required}
                                        />
                                    )}
                                </div>
                            );
                        })}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            <Send size={16} />
                            {submitting ? 'Submitting...' : submitField?.submitText || 'Submit'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
