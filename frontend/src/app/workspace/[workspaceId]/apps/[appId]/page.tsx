'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Sparkles, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { IAppField, IApp } from '@/types/app';

export default function AppRunnerPage({ params }: { params: { workspaceId: string; appId: string } }) {
    const { user } = useAuth();
    const router = useRouter();
    const [app, setApp] = useState<IApp | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [inputs, setInputs] = useState<Record<string, any>>({});
    const [result, setResult] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchApp();
    }, [params.appId]);

    const fetchApp = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspaces/${params.workspaceId}/apps/${params.appId}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch app');
            const data = await res.json();
            setApp(data.data);
            
            // Initialize defaults
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setResult(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspaces/${params.workspaceId}/apps/${params.appId}/run`, {
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
            } else {
                alert('Success: ' + data.message);
                // Reset form?
                setInputs({});
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

    if (loading) return <div className="p-8 text-center">Loading App...</div>;
    if (!app) return <div className="p-8 text-center text-red-500">App not found</div>;

    const fields = app.fields || [];
    const submitField = fields.find(f => f.type === 'submit');

    return (
        <div className="min-h-screen bg-surface-base py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                     <Link href={`/workspace/${params.workspaceId}/apps`} className="text-text-muted hover:text-text-primary flex items-center gap-2 text-sm font-bold">
                        <ArrowLeft size={16} /> Back to Apps
                     </Link>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-border-light">
                    {/* Header */}
                    <div className="bg-surface-light border-b border-border-light p-8 text-center">
                        {app.layout?.header?.logoUrl && (
                            <img src={app.layout.header.logoUrl} alt="Logo" className="h-16 w-16 mx-auto mb-4 object-contain" />
                        )}
                        <h1 className="text-3xl font-black text-text-primary tracking-tight">{app.name}</h1>
                        {app.layout?.header?.subtitle && (
                            <p className="text-text-muted mt-2 font-medium">{app.layout.header.subtitle}</p>
                        )}
                    </div>

                    {/* Result Panel (if generated) */}
                    {result && (
                        <div className="p-8 bg-blue-50 border-b border-blue-100">
                             <div className="flex items-center justify-between mb-4">
                                 <h3 className="text-sm font-bold uppercase text-blue-800 flex items-center gap-2">
                                     <Sparkles size={16} /> Generated Result
                                 </h3>
                                 <button onClick={handleCopy} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold uppercase">
                                     {copied ? <Check size={14} /> : <Copy size={14} />}
                                     {copied ? 'Copied' : 'Copy Text'}
                                 </button>
                             </div>
                             <div className="prose prose-sm max-w-none bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                                 <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                             </div>
                             <button onClick={() => setResult(null)} className="mt-4 text-xs font-bold text-blue-600 hover:underline">
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
                                                </label>
                                                
                                                {field.type === 'text' && (
                                                    <input
                                                        type="text"
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
                                                            required={field.required}
                                                        />
                                                        <span className="text-sm font-medium text-text-secondary">{field.label || 'Yes, I agree'}</span>
                                                    </label>
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
                                        <>Generating...</>
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
