'use client';

import Link from 'next/link';

import { useState } from 'react';
import { QrCode, Download, RefreshCw, AlertCircle, CheckCircle, ChevronRight, Share2, ArrowLeft } from 'lucide-react';
import FAQ from '@/components/FAQ';

export default function QRGenerator() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!text) return;
        setLoading(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/tools/qr`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Generation failed');
            }

            setQrCode(data.data.qrCode);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        if (!qrCode) return;
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `worktoolshub-qr-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="mx-auto max-w-[1000px] px-6 py-12">
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-blue-600 transition-colors mb-8 group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Tools
            </Link>
            <div className="mb-10">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <QrCode className="h-3 w-3" /> System Primitives / Payload Encoder
                </div>
                <h1 className="text-5xl font-black tracking-tighter text-text-primary">
                    QR Generator. <span className="text-blue-600">High-Density Encode.</span>
                </h1>
                <p className="mt-4 max-w-2xl text-lg font-bold text-text-secondary">
                    Create production-ready QR codes for URLs, JSON payloads, or authentication secrets. Static, offline-compatible, and high-fidelity.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7">
                    <div className="card border-2 border-border-light shadow-2xl p-8 bg-white">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">
                            Payload Source (URL or Text)
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="https://example.com/api/v1/resource"
                                className="flex-1 rounded-lg border-2 border-border-light bg-surface-light px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-blue-600 transition-all font-mono"
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !text}
                                className="btn-primary h-12 px-8 flex items-center gap-2"
                            >
                                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Encode'}
                            </button>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 text-xs font-bold text-text-secondary">
                                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                Automatic Error Correction (Level H)
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-text-secondary">
                                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                High-Contrast Charcoal Encode
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-text-secondary">
                                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                Vector-Ready Png Export
                            </div>
                        </div>

                        {error && (
                            <div className="mt-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 p-4 text-sm font-bold text-red-600">
                                <AlertCircle className="h-4 w-4" /> {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-5">
                    <div className="card border-2 border-dashed border-border-light bg-surface-light min-h-[400px] flex flex-col items-center justify-center p-8 text-center sticky top-24">
                        {qrCode ? (
                            <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
                                <div className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-border-light mb-8">
                                    <img src={qrCode} alt="Generated QR" className="w-64 h-64" />
                                </div>
                                <div className="flex flex-col gap-3 w-full">
                                    <button
                                        onClick={downloadQR}
                                        className="btn-primary w-full h-12 gap-2"
                                    >
                                        <Download className="h-4 w-4" /> Download PNG
                                    </button>
                                    <button
                                        className="btn-secondary w-full h-12 gap-2"
                                        onClick={() => {
                                            navigator.clipboard.writeText(text);
                                            alert('Payload copied to clipboard');
                                        }}
                                    >
                                        <Share2 className="h-4 w-4" /> Copy Payload
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center opacity-30">
                                <div className="h-24 w-24 rounded-3xl border-4 border-dashed border-text-muted flex items-center justify-center mb-6">
                                    <QrCode className="h-10 w-10 text-text-muted" />
                                </div>
                                <p className="text-sm font-black uppercase tracking-widest text-text-muted">
                                    Waiting for Payload...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-20 border-t border-border-light pt-12">
                <h2 className="text-2xl font-black tracking-tight text-text-primary mb-8">Technical Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">Density</div>
                        <div className="text-sm font-bold text-text-secondary">400px x 400px optimal resolution for digital and print.</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">Security</div>
                        <div className="text-sm font-bold text-text-secondary">No user data is logged during the encoding process.</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">Compatibility</div>
                        <div className="text-sm font-bold text-text-secondary">ISO/IEC 18004 compliant for universal device support.</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">Error Correction</div>
                        <div className="text-sm font-bold text-text-secondary">Level H allows up to 30% damage/obscuration.</div>
                    </div>
                </div>
            </div>

            <FAQ
                items={[
                    {
                        question: "What is a QR Code?",
                        answer: "A QR (Quick Response) code is a two-dimensional barcode capable of storing various types of data, such as URLs, text, or contact info, which can be instantly read by smartphone cameras."
                    },
                    {
                        question: "What does 'Error Correction' mean?",
                        answer: "QR codes have built-in redundancy. A 'High' error correction level allows the code to be scanned even if up to 30% of it is damaged or obscured (e.g., by a logo in the middle)."
                    },
                    {
                        question: "Do these QR codes expire?",
                        answer: "No. These are static QR codes, meaning the data is encoded directly into the image pattern. They do not rely on any external server or redirect service, so they will work forever."
                    },
                    {
                        question: "Can I use these for commercial print?",
                        answer: "Yes. Our generator creates high-resolution images suitable for printing on flyers, business cards, and packaging. Always test scan the printed proof before mass production."
                    }
                ]}
            />
        </div>
    );
}
