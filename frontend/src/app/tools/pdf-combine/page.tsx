'use client';

import Link from 'next/link';

import { useState, useRef } from 'react';
import { FileText, Upload, Download, Trash2, AlertCircle, CheckCircle, Activity, Files, ArrowLeft } from 'lucide-react';
import FAQ from '@/components/FAQ';

interface CombineResult {
    filename: string;
    downloadUrl: string;
    pageCount: number;
    fileSize: number;
    expiresIn: string;
}

export default function PDFCombiner() {
    const [files, setFiles] = useState<File[]>([]);
    const [result, setResult] = useState<CombineResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []).filter(f => f.type === 'application/pdf');
        setFiles(prev => [...prev, ...selectedFiles]);
        setError(null);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleCombine = async () => {
        if (files.length < 2) {
            setError('Please select at least 2 PDF files');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/files/pdf/combine`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Combine failed');

            setResult({
                ...data.data,
                downloadUrl: `${apiUrl}${data.data.downloadUrl}`
            });
            setFiles([]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="mx-auto max-w-[1100px] px-6 py-12">
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-blue-600 transition-colors mb-8 group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Tools
            </Link>
            <div className="mb-10">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Files className="h-3.5 w-3.5" /> WorkToolsHub / PDF Combiner
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">Combine PDFs.</h1>
                <p className="mt-3 text-sm font-bold text-text-secondary max-w-2xl">
                    Merge multiple PDF files into a single document. Files are automatically deleted after 30 minutes.
                </p>
            </div>

            <div className="card border border-border-light bg-white p-6 shadow-sm">
                {/* Upload Area */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border-light rounded-xl p-12 text-center cursor-pointer hover:border-blue-600/30 transition-colors"
                >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                    <div className="text-lg font-black text-text-primary mb-2">Drop PDF files here or click to upload</div>
                    <div className="text-sm font-bold text-text-muted">Max 10 files, 10MB each</div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="mt-6 space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                            Selected Files ({files.length})
                        </div>
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-surface-light border border-border-light">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-red-500" />
                                    <div>
                                        <div className="font-bold text-sm text-text-primary truncate max-w-xs">{file.name}</div>
                                        <div className="text-xs text-text-muted">{formatFileSize(file.size)}</div>
                                    </div>
                                </div>
                                <button onClick={() => removeFile(i)} className="p-2 hover:bg-white rounded-lg transition-colors">
                                    <Trash2 className="h-4 w-4 text-text-muted hover:text-red-500" />
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={handleCombine}
                            className="btn-primary w-full h-12 gap-2"
                            disabled={loading || files.length < 2}
                        >
                            {loading ? <Activity className="h-4 w-4 animate-spin" /> : 'Combine PDFs'}
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm font-bold">
                        <AlertCircle className="h-5 w-5" /> {error}
                    </div>
                )}

                {result && (
                    <div className="mt-6 p-6 bg-emerald-50 border border-emerald-100 rounded-xl animate-in fade-in">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                            <div className="font-black text-text-primary">PDFs Combined Successfully!</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center">
                                <div className="text-2xl font-black text-text-primary">{result.pageCount}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Pages</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-text-primary">{formatFileSize(result.fileSize)}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Size</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-text-primary">{result.expiresIn}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Expires In</div>
                            </div>
                        </div>
                        <a
                            href={result.downloadUrl}
                            download={result.filename}
                            className="btn-primary w-full h-12 gap-2"
                        >
                            <Download className="h-4 w-4" /> Download Combined PDF
                        </a>
                    </div>
                )}
            </div>

            <FAQ
                items={[
                    {
                        question: "Is this PDF merger secure?",
                        answer: "Yes. Your files are transferred over an encrypted connection (SSL/TLS). We process them on our secure servers and automatically delete them permanently after 30 minutes. No one else has access to your documents."
                    },
                    {
                        question: "Can I rearrange the order of files?",
                        answer: "Currently, files are merged in the order they are uploaded. To change the order, we recommend uploading them one by one in your desired sequence."
                    },
                    {
                        question: "Is there a limit to how many files I can combine?",
                        answer: "For this free tool, we limit users to 10 files at a time to ensure fast processing for everyone. Each file must be under 10MB."
                    },
                    {
                        question: "Does this affect the quality of my PDF?",
                        answer: "No. Our tool merges the underlying document streams without re-compressing images or altering fonts, so the quality of your pages remains exactly the same as the originals."
                    }
                ]}
            />
        </div>
    );
}
