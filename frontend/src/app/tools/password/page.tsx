'use client';

import { useState } from 'react';
import { Lock, Copy, RefreshCw, CheckCircle } from 'lucide-react';

export default function PasswordGenerator() {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
        let pass = '';
        for (let i = 0; i < length; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(pass);
        setCopied(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="card max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Lock className="h-5 w-5" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark">Password Architect</h1>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-wider text-text-muted mb-2">
                            Character Length: {length}
                        </label>
                        <input
                            type="range"
                            min="8"
                            max="64"
                            value={length}
                            onChange={(e) => setLength(parseInt(e.target.value))}
                            className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer accent-primary dark:bg-surface-dark"
                        />
                    </div>

                    <button onClick={handleGenerate} className="btn-primary w-full gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Generate Secure Password
                    </button>

                    {password && (
                        <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="rounded-xl border border-border-light bg-surface-light p-6 dark:border-border-dark dark:bg-surface-dark text-center">
                                <div className="font-mono text-2xl tracking-[0.2em] break-all text-text-primary dark:text-text-dark mb-6">
                                    {password}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className={`btn-secondary w-full gap-2 ${copied ? 'text-primary border-primary/50' : ''}`}
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy to Clipboard
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="mt-4 text-center text-xs text-text-muted">
                                Passwords are generated locally in your browser. No data is sent to our servers.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

