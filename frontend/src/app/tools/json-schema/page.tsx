'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FileJson, Activity, AlertCircle, ArrowLeft, CheckCircle, Code, Braces } from 'lucide-react';
import FAQ from '@/components/FAQ';

export default function JsonValidator() {
    const [jsonInput, setJsonInput] = useState('');
    const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);
    const [formatted, setFormatted] = useState('');

    const validate = () => {
        try {
            if (!jsonInput.trim()) {
                setResult(null);
                return;
            }
            const parsed = JSON.parse(jsonInput);
            setFormatted(JSON.stringify(parsed, null, 2));
            setResult({ valid: true, message: 'Valid JSON.' });
        } catch (e: any) {
            setResult({ valid: false, message: e.message });
        }
    };

    const format = () => {
        validate();
    };

    return (
        <div className="mx-auto max-w-[1100px] px-6 py-12">
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-blue-600 transition-colors mb-8 group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Tools
            </Link>
            <div className="mb-10">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Braces className="h-3.5 w-3.5" /> WorkToolsHub / Developer Utilities
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">JSON Validator & Formatter.</h1>
                <p className="mt-3 text-sm font-bold text-text-secondary max-w-2xl">
                    Validate, format, and beautify your JSON data. Detect syntax errors instantly.
                </p>
            </div>

            <div className="card border border-border-light bg-white p-6 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Input JSON</label>
                            <button onClick={() => setJsonInput('')} className="text-[10px] font-bold text-blue-600 hover:underline">Clear</button>
                        </div>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder='{"key": "value"}'
                            className="flex-1 w-full rounded-xl border border-border-light bg-surface-light p-4 font-mono text-xs outline-none focus:border-blue-600 transition-all resize-none"
                        />
                    </div>

                    <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Formatted Output</label>
                            {result && (
                                <span className={`text-[10px] font-black uppercase tracking-widest ${result.valid ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {result.valid ? 'VALID JSON' : 'INVALID SYNTAX'}
                                </span>
                            )}
                        </div>
                        <div className={`flex-1 w-full rounded-xl border p-4 font-mono text-xs overflow-auto ${result?.valid === false ? 'bg-red-50 border-red-100 text-red-700' : 'bg-surface-light border-border-light text-text-primary'}`}>
                            {result?.valid === false ? result.message : (formatted || <span className="opacity-40">Output will appear here...</span>)}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={validate}
                        className="btn-primary h-10 px-6 gap-2"
                        disabled={!jsonInput}
                    >
                        <CheckCircle className="h-4 w-4" /> Validate & Format
                    </button>
                </div>
            </div>

            <FAQ
                items={[
                    {
                        question: "What is JSON?",
                        answer: "JSON (JavaScript Object Notation) is a lightweight data-interchange format. It is easy for humans to read and write and easy for machines to parse and generate."
                    },
                    {
                        question: "Why do I get a syntax error?",
                        answer: "Common JSON errors include trailing commas, using single quotes instead of double quotes, or missing brackets/braces. JSON requires strict formatting."
                    },
                    {
                        question: "Is my data sent to a server?",
                        answer: "No. This tool runs entirely in your browser using Client-Side JavaScript. Your data is never transmitted to us."
                    },
                    {
                        question: "Can I validate against a Schema?",
                        answer: "Currently, this tool performs syntax validation and formatting. Full JSON Schema validation against custom schemas is coming in a future update."
                    }
                ]}
            />
        </div>
    );
}
