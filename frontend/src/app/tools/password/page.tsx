'use client';

import Link from 'next/link';

import { useState } from 'react';
import { Lock, Copy, RefreshCw, CheckCircle, Terminal, ShieldCheck, Key, ArrowLeft } from 'lucide-react';
import FAQ from '@/components/FAQ';

export default function PasswordGenerator() {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(24);
    const [copied, setCopied] = useState(false);
    const [options, setOptions] = useState({
        numbers: true,
        symbols: true,
        uppercase: true
    });

    const handleGenerate = () => {
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const syms = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        let chars = lower;
        if (options.uppercase) chars += upper;
        if (options.numbers) chars += nums;
        if (options.symbols) chars += syms;

        let pass = '';
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            pass += chars.charAt(array[i] % chars.length);
        }

        setPassword(pass);
        setCopied(false);
    };

    const handleCopy = () => {
        if (!password) return;
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mx-auto max-w-[1000px] px-6 py-12">
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-blue-600 transition-colors mb-8 group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Tools
            </Link>
            <div className="mb-10 text-left">
                <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Terminal className="h-4 w-4" /> WorkToolsHub / System Keys
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">Entropy Generator.</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card border border-border-light bg-white p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <Key className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-black text-text-primary tracking-tight">Configuration</h2>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    Entropy Bits: <span className="text-blue-600">{(length * 6).toFixed(0)}</span>
                                </label>
                                <span className="text-xs font-black text-text-primary">{length} Chars</span>
                            </div>
                            <input
                                type="range"
                                min="12"
                                max="128"
                                value={length}
                                onChange={(e) => setLength(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-surface-light rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {Object.entries(options).map(([key, val]) => (
                                <label key={key} className="flex items-center justify-between p-3 rounded-lg border border-border-light bg-surface-light/50 cursor-pointer hover:bg-surface-light transition-colors">
                                    <span className="text-xs font-black uppercase tracking-widest text-text-primary">{key}</span>
                                    <input
                                        type="checkbox"
                                        checked={val}
                                        onChange={() => setOptions(prev => ({ ...prev, [key]: !val }))}
                                        className="h-4 w-4 rounded border-border-light text-blue-600 focus:ring-blue-600"
                                    />
                                </label>
                            ))}
                        </div>

                        <button onClick={handleGenerate} className="btn-primary w-full gap-2 h-12 shadow-xl shadow-blue-600/10">
                            <RefreshCw className="h-4 w-4" />
                            Generate Entropy
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {password ? (
                        <div className="card bg-text-primary border-none p-8 flex flex-col justify-between h-full animate-in fade-in slide-in-from-right-4 duration-500 shadow-2xl">
                            <div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">
                                    <ShieldCheck className="h-3.5 w-3.5" /> Output Buffer Alpha-01
                                </div>
                                <div className="font-mono text-2xl tracking-[0.1em] break-all text-white font-bold mb-8 p-4 bg-white/5 rounded-xl border border-white/10 ring-1 ring-white/5">
                                    {password}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleCopy}
                                    className={`btn-secondary w-full gap-2 h-12 bg-white text-text-primary hover:bg-white/90 ${copied ? 'ring-2 ring-blue-400' : ''}`}
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                                            Copied to Buffer
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy to Clipboard
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[9px] font-black uppercase tracking-widest text-white/30 italic">
                                    AES-Ready Cryptographic primitives generated in isolated worker context. No server-side persistence.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="card h-full flex flex-col items-center justify-center border-dashed border-2 border-border-light text-text-muted opacity-40">
                            <Lock className="h-12 w-12 mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Initialize buffer to start</p>
                        </div>
                    )}
                </div>
            </div>

            <FAQ
                items={[
                    {
                        question: "Are these passwords really random?",
                        answer: "Yes. We use the browser's `window.crypto.getRandomValues()` API, which generates cryptographically strong random values. This is far more secure than standard `Math.random()` functions."
                    },
                    {
                        question: "Do you store the generated passwords?",
                        answer: "No. The passwords are generated entirely on your device (client-side) using JavaScript. They are never sent to our servers, so there is zero risk of interception or logging."
                    },
                    {
                        question: "What is 'Entropy'?",
                        answer: "Entropy is a measure of the unpredictability or randomness of a password, usually measured in bits. A higher entropy means the password is harder to crack by brute force. We recommend at least 70-80 bits for critical accounts."
                    },
                    {
                        question: "Why should I use symbols and numbers?",
                        answer: "Adding symbols and numbers increases the character set size, which exponentially increases the number of possible combinations. This makes the password significantly harder to guess without needing to make it excessively long."
                    }
                ]}
            />
        </div>
    );
}
