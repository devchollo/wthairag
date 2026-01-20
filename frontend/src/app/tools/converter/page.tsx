'use client';

import Link from 'next/link';

import { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Download, ArrowRight, AlertCircle, CheckCircle, Activity, ArrowLeft } from 'lucide-react';
import FAQ from '@/components/FAQ';

interface ConvertResult {
    filename: string;
    downloadUrl: string;
    originalSize: number;
    convertedSize: number;
    format: string;
    expiresIn: string;
}

export default function FileConverter() {
    const [file, setFile] = useState<File | null>(null);
    const [targetFormat, setTargetFormat] = useState('png');
    const [result, setResult] = useState<ConvertResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            setResult(null);

            // Create preview
            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleConvert = async () => {
        if (!file) {
            setError('Please select a file to convert');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('targetFormat', targetFormat);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/files/image/convert`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Conversion failed');

            setResult({
                ...data.data,
                downloadUrl: `${apiUrl}${data.data.downloadUrl}`
            });
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

    const getSourceFormat = () => {
        if (!file) return '?';
        const ext = file.name.split('.').pop()?.toUpperCase();
        return ext || '?';
    };

    return (
        <div className="mx-auto max-w-[1100px] px-6 py-12">
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-blue-600 transition-colors mb-8 group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Tools
            </Link>
            <div className="mb-10">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <ImageIcon className="h-3.5 w-3.5" /> WorkToolsHub / File Converter
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">Convert Files.</h1>
                <p className="mt-3 text-sm font-bold text-text-secondary max-w-2xl">
                    Convert images between PNG, JPG, and WebP formats. Files are automatically deleted after 30 minutes.
                </p>
            </div>

            <div className="card border border-border-light bg-white p-6 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Area */}
                    <div>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-border-light rounded-xl p-8 text-center cursor-pointer hover:border-blue-600/30 transition-colors aspect-square flex flex-col items-center justify-center"
                        >
                            {preview ? (
                                <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
                            ) : (
                                <>
                                    <Upload className="h-12 w-12 mb-4 text-text-muted" />
                                    <div className="text-lg font-black text-text-primary mb-2">Upload Image</div>
                                    <div className="text-sm font-bold text-text-muted">PNG, JPG, WebP (max 10MB)</div>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                        {file && (
                            <div className="mt-4 text-center">
                                <div className="font-bold text-sm text-text-primary truncate">{file.name}</div>
                                <div className="text-xs text-text-muted">{formatFileSize(file.size)}</div>
                            </div>
                        )}
                    </div>

                    {/* Conversion Options */}
                    <div className="flex flex-col justify-center">
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-4">
                                <div className="text-4xl font-black text-text-primary">{getSourceFormat()}</div>
                                <ArrowRight className="h-8 w-8 text-blue-600" />
                                <div className="text-4xl font-black text-blue-600">{targetFormat.toUpperCase()}</div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Target Format</div>
                            <div className="grid grid-cols-3 gap-3">
                                {['png', 'jpg', 'webp'].map(format => (
                                    <button
                                        key={format}
                                        onClick={() => setTargetFormat(format)}
                                        className={`p-4 rounded-xl border-2 text-center font-black uppercase transition-all ${targetFormat === format
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-surface-light border-border-light text-text-primary hover:border-blue-600/30'
                                            }`}
                                    >
                                        {format}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleConvert}
                            className="btn-primary w-full h-12 gap-2"
                            disabled={loading || !file}
                        >
                            {loading ? <Activity className="h-4 w-4 animate-spin" /> : 'Convert'}
                        </button>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm font-bold">
                                <AlertCircle className="h-5 w-5" /> {error}
                            </div>
                        )}

                        {result && (
                            <div className="mt-6 p-6 bg-emerald-50 border border-emerald-100 rounded-xl animate-in fade-in">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                                    <div className="font-black text-text-primary">Converted Successfully!</div>
                                </div>
                                <div className="flex justify-between text-sm mb-4">
                                    <span className="text-text-muted">Original: {formatFileSize(result.originalSize)}</span>
                                    <span className="font-bold text-text-primary">Converted: {formatFileSize(result.convertedSize)}</span>
                                </div>
                                <a
                                    href={result.downloadUrl}
                                    download={result.filename}
                                    className="btn-primary w-full h-10 gap-2"
                                >
                                    <Download className="h-4 w-4" /> Download {result.format.toUpperCase()}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FAQ
                items={[
                    {
                        question: "Is my file uploaded to a server?",
                        answer: "Yes, for processing, the file is temporarily uploaded to our secure server. However, we automatically delete all original and converted files after 30 minutes to ensure your privacy."
                    },
                    {
                        question: "Why should I convert to WebP?",
                        answer: "WebP is a modern image format that provides superior lossless and lossy compression for web images. Using WebP can significantly reduce your website's load time compared to PNG or JPEG."
                    },
                    {
                        question: "What is the file size limit?",
                        answer: "Currently, we support files up to 10MB. This covers most standard web images and screenshots. For larger files, we recommend compressing them first or using desktop software."
                    },
                    {
                        question: "Does converting affect image quality?",
                        answer: "It depends on the format. Converting to PNG is lossless (no quality loss). Converting to JPG or WebP is typically lossy, meaning some minor detail is discarded to save space, though usually imperceptible to the human eye."
                    }
                ]}
            />
        </div>
    );
}
