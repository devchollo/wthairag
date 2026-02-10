'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Sparkles, Copy, Check, Eye, EyeOff, Zap } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { IAppField, IApp } from '@/types/app';

interface SubmittedValue { label: string; value: any; isSecret: boolean }

export default function AppRunnerPage({ params }: { params: Promise<{ workspaceId: string; appId: string }> }) {
    const { workspaceId, appId } = use(params);
    const { user } = useAuth();
    const router = useRouter();
    const [app, setApp] = useState<IApp | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [inputs, setInputs] = useState<Record<string, any>>({});
    const [result, setResult] = useState<string | null>(null);
    const [submittedValues, setSubmittedValues] = useState<Record<string, SubmittedValue> | null>(null);
    const [aiImproved, setAiImproved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());

    const fetchApp = useCallback(async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/apps/${appId}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch app');
            const data = await res.json();
            setApp(data.data);
            
            const defaults: Record<string, any> = {};
            data.data.fields?.forEach((f: IAppField) => {
                 if (f.type === 'checkbox') defaults[f.id] = false;
                 else if (f.type !== 'message' && f.type !== 'submit') defaults[f.id] = '';
            });
            setInputs(defaults);
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
        setSubmittedValues(null);
        setAiImproved(false);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/apps/${appId}/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputs }),
                credentials: 'include'
            });

            if (!res.ok) {
                 const err = await res.json();
                 throw new Error(err.message || 'Execution failed');
            }

            const data = await res.json();
            
            if (data.data.mode === 'generator') {
                setResult(data.data.resultText);
                setAiImproved(!!data.data.aiImproved);
            } else {
                setResult(null);
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
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleSecret = (fieldId: string) => {
        setRevealedSecrets(prev => {
            const next = new Set(prev);
            if (next.has(fieldId)) next.delete(fieldId);
            else next.add(fieldId);
            return next;
        });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-surface-base">
            <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-sm text-text-muted font-bold">Loading app...</p>
            </div>
        </div>
    );
    if (!app) return <div className="min-h-screen flex items-center justify-center bg-surface-base"><p className="text-red-500 font-bold">App not found</p></div>;

    const fields = app.fields || [];
    const submitField = fields.find(f => f.type === 'submit');
    const bg = app.layout?.background;

    // Build background style for new_tab apps
    const bgStyle: React.CSSProperties = {};
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
            {/* Overlay for image backgrounds */}
            {app.launchMode === 'new_tab' && bg?.type === 'image' && (
                <div className="fixed inset-0 bg-black/20 -z-10" />
            )}

            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                     <Link href={`/workspace/${workspaceId}/apps`} className="text-text-muted hover:text-text-primary flex items-center gap-2 text-sm font-bold backdrop-blur-sm bg-white/70 px-3 py-1.5 rounded-lg">
                        <ArrowLeft size={16} /> Back to Apps
                     </Link>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-border-light">
                    {/* Header */}
                    <div className="bg-surface-light border-b border-border-light p-8 text-center">
                        {app.layout?.header?.logoUrl && (
                            <img src={app.layout.header.logoUrl} alt="Logo" className="h-16 w-16 mx-auto mb-4 object-contain rounded-lg" />
                        )}
                        <h1 className="text-3xl font-black text-text-primary tracking-tight">{app.name}</h1>
                        {app.description && (
                            <p className="text-text-muted mt-1.5 text-sm">{app.description}</p>
                        )}
                        {app.layout?.header?.subtitle && (
                            <p className="text-text-muted mt-2 font-medium">{app.layout.header.subtitle}</p>
                        )}
                    </div>

                    {/* Result Panel */}
                    {result && (
                        <div className="p-8 bg-blue-50 border-b border-blue-100">
                             <div className="flex items-center justify-between mb-4">
                                 <h3 className="text-sm font-bold uppercase text-blue-800 flex items-center gap-2">
                                     <Sparkles size={16} /> Generated Result
                                     {aiImproved && (
                                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase">
                                             <Zap size={10} /> AI Enhanced
                                         </span>
                                     )}
                                 </h3>
                                 <button onClick={handleCopy} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold uppercase">
                                     {copied ? <Check size={14} /> : <Copy size={14} />}
                                     {copied ? 'Copied' : 'Copy Text'}
                                 </button>
                             </div>
                             <div className="prose prose-sm max-w-none bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                                 <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                             </div>

                             {/* Submitted Values Summary */}
                             {submittedValues && Object.keys(submittedValues).length > 0 && (
                                 <details className="mt-4">
                                     <summary className="text-xs font-bold text-blue-700 cursor-pointer hover:text-blue-900 select-none">
                                         View submitted values ({Object.keys(submittedValues).length})
                                     </summary>
                                     <div className="mt-2 space-y-1.5">
                                         {Object.entries(submittedValues).map(([fieldId, sv]) => (
                                             <div key={fieldId} className="flex items-center justify-between bg-white/60 p-2.5 rounded-lg text-xs">
                                                 <span className="font-bold text-text-primary flex items-center gap-1">
                                                     {sv.label}
                                                     {sv.isSecret && <EyeOff size={10} className="text-amber-500" />}
                                                 </span>
                                                 <span className="text-text-muted font-mono max-w-[200px] truncate">
                                                     {sv.isSecret && !revealedSecrets.has(fieldId) ? (
                                                         <button onClick={() => toggleSecret(fieldId)} className="text-amber-600 hover:text-amber-800 flex items-center gap-1">
                                                             <Eye size={10} /> Reveal
                                                         </button>
                                                     ) : (
                                                         <>
                                                             {String(sv.value)}
                                                             {sv.isSecret && (
                                                                 <button onClick={() => toggleSecret(fieldId)} className="ml-1 text-amber-600">
                                                                     <EyeOff size={10} />
                                                                 </button>
                                                             )}
                                                         </>
                                                     )}
                                                 </span>
                                             </div>
                                         ))}
                                     </div>
                                 </details>
                             )}

                             <button onClick={() => { setResult(null); setSubmittedValues(null); setAiImproved(false); }} className="mt-4 text-xs font-bold text-blue-600 hover:underline">
                                 Start Over
                             </button>
                        </div>
                    )}

                    {/* Form */}
                    {!result && (
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {fields.map(field => {
                                if (field.type === 'submit') return null;

                                return (
                                    <div key={field.id}>
                                        {field.type === 'message' ? (
                                            <div 
                                                className="prose prose-sm text-text-muted bg-surface-light p-4 rounded-lg border border-border-light"
                                                dangerouslySetInnerHTML={{ __html: field.messageHtml || '' }}
                                            />
                                        ) : (
                                            <>
                                                <label className="block text-sm font-bold text-text-primary mb-2">
                                                    {field.label}
                                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                                    {field.isSecret && <EyeOff size={12} className="inline ml-1.5 text-amber-500" />}
                                                </label>
                                                
                                                {field.type === 'text' && (
                                                    <input
                                                        type={field.isSecret ? 'password' : 'text'}
                                                        className="input-base w-full p-3 border border-border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                        value={inputs[field.id] || ''}
                                                        onChange={e => setInputs({...inputs, [field.id]: e.target.value})}
                                                        required={field.required}
                                                    />
                                                )}

                                                {field.type === 'textarea' && (
                                                    <textarea
                                                        className="input-base w-full p-3 border border-border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-32"
                                                        value={inputs[field.id] || ''}
                                                        onChange={e => setInputs({...inputs, [field.id]: e.target.value})}
                                                        required={field.required}
                                                    />
                                                )}

                                                {field.type === 'checkbox' && (
                                                    <label className="flex items-center gap-3 p-3 border border-border-light rounded-lg cursor-pointer hover:bg-surface-light transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                            checked={inputs[field.id] || false}
                                                            onChange={e => setInputs({...inputs, [field.id]: e.target.checked})}
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
                                                                    onChange={e => setInputs({...inputs, [field.id]: e.target.value})}
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
                                            Generating...
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
