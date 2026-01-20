'use client';

import Link from 'next/link';

import { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Bot, Copy, RefreshCw, AlertCircle, CheckCircle, Smartphone, Search, FileText, Activity, ArrowLeft } from 'lucide-react';
import FAQ from '@/components/FAQ';

interface AltTextVariant {
    type: string;
    text: string;
    charCount: number;
}

interface AltTextResult {
    variants: AltTextVariant[];
    source: string;
}

export default function AltTextGenerator() {
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [result, setResult] = useState<AltTextResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setImageUrl('');
            setResult(null);

            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageUrl(e.target.value);
        setFile(null);
        setPreview(null);
        setResult(null);
    };

    const handleGenerate = async () => {
        let finalImageUrl = imageUrl;

        // Force full URL format if URL is used
        if (!file && finalImageUrl) {
            if (!/^https?:\/\//i.test(finalImageUrl)) {
                finalImageUrl = 'https://' + finalImageUrl;
                setImageUrl(finalImageUrl);
            }
        }

        if (!file && !finalImageUrl) {
            setError('Please provide an image file or URL');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            if (file) {
                formData.append('file', file);
            } else {
                formData.append('imageUrl', finalImageUrl);
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/files/alt-text`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Generation failed');

            setResult(data.data);
            if (imageUrl) setPreview(imageUrl);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const getIconForType = (type: string) => {
        switch (type.toLowerCase()) {
            case 'accessibility': return Smartphone;
            case 'seo': return Search;
            default: return FileText;
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
                    <Bot className="h-3.5 w-3.5" /> WorkToolsHub / AI Alt Text
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">Smart Alt Text Generator.</h1>
                <p className="mt-3 text-sm font-bold text-text-secondary max-w-2xl">
                    Generate accessibility-compliant and SEO-friendly alt text for images using computer vision.
                </p>
            </div>

            <div className="card border border-border-light bg-white p-6 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Area */}
                    <div className="space-y-6">
                        {/* URL Input */}
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Image URL</div>
                            <input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={handleUrlChange}
                                className="w-full h-10 rounded-lg border border-border-light bg-surface-light px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all mb-2"
                            />
                        </div>

                        <div className="text-center text-xs font-bold text-text-muted uppercase tracking-widest">OR</div>

                        {/* File Upload */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[200px] ${file ? 'border-blue-600/50 bg-blue-50/50' : 'border-border-light hover:border-blue-600/30'
                                }`}
                        >
                            {preview ? (
                                <div className="relative w-full h-full flex flex-col items-center">
                                    <img src={preview} alt="Preview" className="max-h-[200px] max-w-full object-contain rounded-lg shadow-sm" />
                                    {file && <div className="mt-2 text-xs font-bold text-text-muted">{file.name}</div>}
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-10 w-10 mb-4 text-text-muted" />
                                    <div className="text-sm font-black text-text-primary mb-1">Upload Image</div>
                                    <div className="text-xs font-bold text-text-muted">JPG, PNG, WebP</div>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            className="btn-primary w-full h-12 gap-2"
                            disabled={loading || (!file && !imageUrl)}
                        >
                            {loading ? <Activity className="h-4 w-4 animate-spin" /> : <>
                                <Bot className="h-4 w-4" /> Generate with AI
                            </>}
                        </button>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm font-bold">
                                <AlertCircle className="h-5 w-5" /> {error}
                            </div>
                        )}
                    </div>

                    {/* Results Area */}
                    <div className="relative">
                        {!result && !loading && (
                            <div className="absolute inset-0 flex items-center justify-center text-center opacity-30">
                                <div>
                                    <Bot className="h-16 w-16 mx-auto mb-4 text-text-muted" />
                                    <div className="text-xl font-black text-text-primary">AI is ready.</div>
                                    <p className="text-sm font-bold text-text-secondary">Upload an image to see the magic.</p>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center text-center">
                                <div className="space-y-4">
                                    <div className="relative h-16 w-16 mx-auto">
                                        <div className="absolute inset-0 rounded-full border-4 border-surface-light"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                                        <Bot className="absolute inset-0 m-auto h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="text-sm font-bold text-text-muted animate-pulse">Analyzing visual content...</div>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-2 mb-2 text-emerald-600 text-sm font-black uppercase tracking-widest">
                                    <CheckCircle className="h-4 w-4" /> Analysis Complete
                                </div>
                                {result.variants.map((variant, i) => {
                                    const Icon = getIconForType(variant.type);
                                    return (
                                        <div key={i} className="p-5 rounded-xl bg-surface-light border border-border-light group hover:border-blue-600/30 transition-all">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-lg ${variant.type === 'Accessibility' ? 'bg-indigo-100 text-indigo-600' :
                                                        variant.type === 'SEO' ? 'bg-emerald-100 text-emerald-600' :
                                                            'bg-amber-100 text-amber-600'
                                                        }`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-text-primary">{variant.type}</div>
                                                        <div className="text-[10px] font-bold text-text-muted">{variant.charCount} chars</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(variant.text)}
                                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                                    title="Copy to clipboard"
                                                >
                                                    <Copy className="h-4 w-4 text-text-muted group-hover:text-blue-600" />
                                                </button>
                                            </div>
                                            <p className="text-sm font-medium text-text-secondary leading-relaxed pl-12">
                                                {variant.text}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FAQ
                items={[
                    {
                        question: "What is Alt Text?",
                        answer: "Alt text (alternative text) is a short written description of an image. Screen readers read this text aloud to users who are visually impaired, making the web more accessible."
                    },
                    {
                        question: "How does this AI tool work?",
                        answer: "We use advanced computer vision models (like ResNet or CLIP) to analyze the visual contents of your image—identifying objects, actions, and context—and then generate a natural language description."
                    },
                    {
                        question: "Why is Alt Text important for SEO?",
                        answer: "Search engines like Google cannot 'see' images like humans do. They rely on alt text to understand what the image is about. Proper alt text allows your images to appear in Google Images search results."
                    },
                    {
                        question: "What makes good Alt Text?",
                        answer: "Good alt text is specific, concise, and functional. It should describe the content of the image that is relevant to the page context, without stuffing keywords or saying 'image of'."
                    }
                ]}
            />
        </div>
    );
}
