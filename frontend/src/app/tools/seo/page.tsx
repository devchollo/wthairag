'use client';

import Link from 'next/link';

import { useState } from 'react';
import { Search, Globe, FileText, Image, Link2, AlertCircle, CheckCircle, Activity, ExternalLink, Hash, Code, ArrowLeft } from 'lucide-react';
import FAQ from '@/components/FAQ';

interface SEOResults {
    url: string;
    queryTime: number;
    meta: {
        title: string | null;
        titleLength: number;
        description: string | null;
        descriptionLength: number;
        canonical: string | null;
        robots: string | null;
        ogTitle: string | null;
        ogDescription: string | null;
        ogImage: string | null;
    };
    headings: {
        h1: string[];
        h2: string[];
        h3: string[];
    };
    links: {
        internal: number;
        external: number;
        total: number;
    };
    images: {
        total: number;
        withAlt: number;
        withoutAlt: number;
    };
    structuredData: {
        hasJsonLd: boolean;
        schemas: string[];
    };
    report: {
        score: number;
        issues: string[];
        recommendations: string[];
        summary: string;
    };
}

export default function SEOChecker() {
    const [url, setUrl] = useState('');
    const [results, setResults] = useState<SEOResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        let target = url;
        if (!target) return;

        // Force full URL format
        if (!/^https?:\/\//i.test(target)) {
            target = 'https://' + target;
        }
        setUrl(target);

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/tools/seo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: target })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Analysis failed');
            setResults(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="mx-auto max-w-[1100px] px-6 py-12">
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-blue-600 transition-colors mb-8 group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Tools
            </Link>
            <div className="mb-10">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Search className="h-3.5 w-3.5" /> WorkToolsHub / SEO Checker
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">SEO Analysis.</h1>
                <p className="mt-3 text-sm font-bold text-text-secondary max-w-2xl">
                    Analyze meta tags, heading structure, images, links, and structured data for any URL.
                </p>
            </div>

            <div className="card border border-border-light bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row mb-8">
                    <input
                        type="url"
                        placeholder="Enter full URL (https://example.com)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                        className="h-10 flex-1 rounded-lg border border-border-light bg-surface-light px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                    />
                    <button onClick={handleAnalyze} className="btn-primary h-10 px-6 gap-2" disabled={loading || !url}>
                        {loading ? <Activity className="h-4 w-4 animate-spin" /> : 'Analyze'}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm font-bold">
                        <AlertCircle className="h-5 w-5" /> {error}
                    </div>
                )}

                {results && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Score */}
                        <div className={`p-8 rounded-2xl border-2 text-center ${getScoreColor(results.report.score)}`}>
                            <div className="text-6xl font-black">{results.report.score}</div>
                            <div className="text-sm font-black uppercase tracking-widest mt-2">SEO Score</div>
                            <p className="mt-4 text-sm font-bold opacity-80">{results.report.summary}</p>
                        </div>

                        {/* Meta Tags */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <FileText className="h-3 w-3" /> Meta Tags
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-surface-light border border-border-light">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Title ({results.meta.titleLength} chars)</div>
                                    <div className="text-sm font-bold text-text-primary">{results.meta.title || '—'}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-surface-light border border-border-light">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Description ({results.meta.descriptionLength} chars)</div>
                                    <div className="text-sm font-bold text-text-primary line-clamp-2">{results.meta.description || '—'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-surface-light border border-border-light text-center">
                                <Hash className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                                <div className="text-2xl font-black text-text-primary">{results.headings.h1.length}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">H1 Tags</div>
                            </div>
                            <div className="p-4 rounded-xl bg-surface-light border border-border-light text-center">
                                <Image className="h-5 w-5 mx-auto mb-2 text-emerald-600" />
                                <div className="text-2xl font-black text-text-primary">{results.images.withAlt}/{results.images.total}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Images w/ Alt</div>
                            </div>
                            <div className="p-4 rounded-xl bg-surface-light border border-border-light text-center">
                                <Link2 className="h-5 w-5 mx-auto mb-2 text-amber-600" />
                                <div className="text-2xl font-black text-text-primary">{results.links.total}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Links</div>
                            </div>
                            <div className="p-4 rounded-xl bg-surface-light border border-border-light text-center">
                                <Code className="h-5 w-5 mx-auto mb-2 text-indigo-600" />
                                <div className="text-2xl font-black text-text-primary">{results.structuredData.hasJsonLd ? 'Yes' : 'No'}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">JSON-LD</div>
                            </div>
                        </div>

                        {/* Issues & Recommendations */}
                        {(results.report.issues.length > 0 || results.report.recommendations.length > 0) && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {results.report.issues.length > 0 && (
                                    <div className="p-6 rounded-xl bg-red-50 border border-red-100">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-4">Issues</div>
                                        <ul className="space-y-2">
                                            {results.report.issues.map((issue, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm font-bold text-red-800">
                                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {issue}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {results.report.recommendations.length > 0 && (
                                    <div className="p-6 rounded-xl bg-blue-50 border border-blue-100">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">Recommendations</div>
                                        <ul className="space-y-2">
                                            {results.report.recommendations.map((rec, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm font-bold text-blue-800">
                                                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="text-center pt-4 border-t border-border-light">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                Analysis completed in {results.queryTime}ms
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <FAQ
                items={[
                    {
                        question: "What is a good SEO score?",
                        answer: "A score above 80 is generally considered good, indicating that your page follows most technical best practices. However, content quality, backlinks, and user engagement are also critical factors that this tool cannot measure."
                    },
                    {
                        question: "Why are my meta tags important?",
                        answer: "Meta tags (title and description) are the first things users see in search results. A compelling title and description improve your Click-Through Rate (CTR), which is a key ranking signal for search engines."
                    },
                    {
                        question: "What is Structured Data (JSON-LD)?",
                        answer: "Structured data is a standardized format for providing information about a page and classifying the page content. It helps search engines understand your content and can lead to rich snippets (stars, prices, FAQs) in search results."
                    },
                    {
                        question: "Why should I use only one H1 tag?",
                        answer: "The H1 tag is the main heading of the page and helps search engines understand the primary topic. Using multiple H1 tags can confuse search engines about the page's structure and focus."
                    }
                ]}
            />
        </div>
    );
}
