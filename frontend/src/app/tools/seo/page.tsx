'use client';

import Link from 'next/link';

import { useEffect, useMemo, useState } from 'react';
import {
    Search,
    FileText,
    Image,
    Link2,
    AlertCircle,
    CheckCircle,
    Activity,
    Hash,
    Code,
    ArrowLeft,
    Gauge,
    Download,
    History,
    TrendingUp,
    Users,
    Network,
    ShieldAlert,
    BarChart3
} from 'lucide-react';
import FAQ from '@/components/FAQ';

interface SEOResults {
    url: string;
    queryTime: number;
    crawl: {
        pagesScanned: number;
        indexableCount: number;
        nonIndexableCount: number;
        issues: string[];
        pages: Array<{
            url: string;
            status: number;
            title: string | null;
            indexable: boolean;
            issues: string[];
        }>;
        robots: {
            status: string;
            disallowCount: number;
            allowsTargetPath: boolean;
        };
        sitemap: {
            status: string;
            url: string;
            urlCount: number;
            errors: string[];
        };
    };
    performance: {
        status: string;
        reason?: string | null;
        metrics?: {
            lcp: string | null;
            cls: string | null;
            inp: string | null;
        };
        score?: number | null;
    };
    content: {
        wordCount: number;
        keywordStats: Array<{
            keyword: string;
            occurrences: number;
            density: number;
            inTitle: boolean;
            inDescription: boolean;
            inH1: boolean;
        }>;
        topTerms: Array<{ term: string; count: number }>;
        qualityScore: number;
        semanticSuggestions: string[];
        competitorBenchmarks: Array<{ url: string; wordCount: number; keywordCoverage: number }>;
        gapAnalysis: number;
    };
    backlinks: {
        status: string;
        reason: string | null;
        totalBacklinks: number | null;
        referringDomains: number | null;
        authorityScore: number | null;
        toxicLinks: number | null;
    };
    rankTracking: {
        status: string;
        reason: string | null;
        keywords: string[];
        positions: Array<{ keyword: string; position: number | null; url: string | null }>;
    };
    userBehavior: {
        status: string;
        reason: string | null;
        bounceRate: number | null;
        engagementTime: number | null;
        lowEngagementPages: string[];
    };
    competitorSerp: {
        status: string;
        reason: string | null;
        serpFeatures: string[];
        competitorGaps: Array<{ url: string; wordCount: number; keywordCoverage: number }>;
    };
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
        remediation: Array<{
            issue: string;
            severity: 'high' | 'medium' | 'low';
            impact: string;
            fix: string;
            example?: string;
        }>;
        summary: string;
    };
}

export default function SEOChecker() {
    const [url, setUrl] = useState('');
    const [keywords, setKeywords] = useState('');
    const [competitors, setCompetitors] = useState('');
    const [results, setResults] = useState<SEOResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<Array<{ url: string; keywords: string; score: number; date: string }>>([]);

    useEffect(() => {
        const stored = localStorage.getItem('seo-history');
        if (stored) {
            setHistory(JSON.parse(stored));
        }
    }, []);

    const normalizeUrl = (value: string) => {
        if (!value) return '';
        if (!/^https?:\/\//i.test(value)) {
            return `https://${value}`;
        }
        return value;
    };

    const competitorList = useMemo(() => {
        return competitors
            .split('\n')
            .map((entry) => entry.trim())
            .filter(Boolean)
            .map(normalizeUrl)
            .slice(0, 5);
    }, [competitors]);

    const handleAnalyze = async () => {
        let target = url;
        if (!target) return;

        // Force full URL format
        target = normalizeUrl(target);
        setUrl(target);

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/tools/seo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: target,
                    keywords,
                    competitors: competitorList
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Analysis failed');
            setResults(data.data);
            setHistory((prev) => {
                const updated = [
                    { url: target, keywords, score: data.data.report.score, date: new Date().toISOString() },
                    ...prev
                ].slice(0, 8);
                localStorage.setItem('seo-history', JSON.stringify(updated));
                return updated;
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (type: 'json' | 'csv') => {
        if (!results) return;
        if (type === 'json') {
            const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'seo-report.json';
            anchor.click();
            URL.revokeObjectURL(url);
            return;
        }
        const rows = [
            ['URL', results.url],
            ['Score', results.report.score.toString()],
            ['Title', results.meta.title || ''],
            ['Description', results.meta.description || ''],
            ['Word Count', results.content.wordCount.toString()],
            ['Indexable Pages', results.crawl.indexableCount.toString()]
        ];
        const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'seo-report.csv';
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        if (!results) return;
        window.print();
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
        if (severity === 'high') return 'bg-red-100 text-red-700';
        if (severity === 'medium') return 'bg-amber-100 text-amber-700';
        return 'bg-emerald-100 text-emerald-700';
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
                    Full-stack SEO analyzer with crawl diagnostics, Core Web Vitals, keyword insights, competitor context, and remediation guidance.
                </p>
            </div>

            <div className="card border border-border-light bg-white p-6 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-8">
                    <div className="space-y-3">
                        <input
                            type="url"
                            placeholder="Enter full URL (https://example.com)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                            className="h-10 w-full rounded-lg border border-border-light bg-surface-light px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                        />
                        <input
                            type="text"
                            placeholder="Target keywords (comma-separated)"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            className="h-10 w-full rounded-lg border border-border-light bg-surface-light px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                        />
                        <textarea
                            placeholder="Competitor URLs (one per line)"
                            value={competitors}
                            onChange={(e) => setCompetitors(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-border-light bg-surface-light px-4 py-3 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-3 justify-between">
                        <button onClick={handleAnalyze} className="btn-primary h-10 px-6 gap-2" disabled={loading || !url}>
                            {loading ? <Activity className="h-4 w-4 animate-spin" /> : 'Analyze'}
                        </button>
                        <div className="rounded-lg border border-border-light bg-surface-light p-4 text-xs font-semibold text-text-muted">
                            Add keywords to unlock density, intent, and competitor gap insights.
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm font-bold">
                        <AlertCircle className="h-5 w-5" /> {error}
                    </div>
                )}

                {results && (
                    <div className="space-y-10 animate-in fade-in duration-300">
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
                            <dl className="rounded-xl border border-border-light bg-white">
                                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[180px_1fr] md:items-start">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-text-muted">Title ({results.meta.titleLength} chars)</dt>
                                    <dd className="text-sm font-bold text-text-primary break-words">{results.meta.title || '—'}</dd>
                                </div>
                                <div className="border-t border-border-light" />
                                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[180px_1fr] md:items-start">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-text-muted">Description ({results.meta.descriptionLength} chars)</dt>
                                    <dd className="text-sm font-bold text-text-primary break-words">{results.meta.description || '—'}</dd>
                                </div>
                                <div className="border-t border-border-light" />
                                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[180px_1fr] md:items-start">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-text-muted">Canonical</dt>
                                    <dd className="text-sm font-bold text-text-primary break-all">{results.meta.canonical || '—'}</dd>
                                </div>
                                <div className="border-t border-border-light" />
                                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[180px_1fr] md:items-start">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-text-muted">Robots</dt>
                                    <dd className="text-sm font-bold text-text-primary break-words">{results.meta.robots || '—'}</dd>
                                </div>
                                <div className="border-t border-border-light" />
                                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[180px_1fr] md:items-start">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-text-muted">OG Title</dt>
                                    <dd className="text-sm font-bold text-text-primary break-words">{results.meta.ogTitle || '—'}</dd>
                                </div>
                                <div className="border-t border-border-light" />
                                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[180px_1fr] md:items-start">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-text-muted">OG Description</dt>
                                    <dd className="text-sm font-bold text-text-primary break-words">{results.meta.ogDescription || '—'}</dd>
                                </div>
                                <div className="border-t border-border-light" />
                                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[180px_1fr] md:items-start">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-text-muted">OG Image</dt>
                                    <dd className="text-sm font-bold text-text-primary break-all">{results.meta.ogImage || '—'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Stats Grid */}
                        <div className="rounded-xl border border-border-light bg-white">
                            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className="flex items-center gap-3">
                                    <Hash className="h-4 w-4 text-blue-600" />
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">H1 Tags</div>
                                        <div className="text-xl font-black text-text-primary">{results.headings.h1.length}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Image className="h-4 w-4 text-emerald-600" />
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Images w/ Alt</div>
                                        <div className="text-xl font-black text-text-primary">{results.images.withAlt}/{results.images.total}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link2 className="h-4 w-4 text-amber-600" />
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Links</div>
                                        <div className="text-xl font-black text-text-primary">{results.links.total}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Code className="h-4 w-4 text-indigo-600" />
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">JSON-LD</div>
                                        <div className="text-xl font-black text-text-primary">{results.structuredData.hasJsonLd ? 'Yes' : 'No'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Crawl & Indexing */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <Network className="h-3 w-3" /> Crawl & Indexing
                            </div>
                            <div className="rounded-xl border border-border-light bg-white mb-4">
                                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Pages Crawled</div>
                                        <div className="text-2xl font-black text-text-primary">{results.crawl.pagesScanned}</div>
                                        <div className="text-xs font-bold text-text-muted">Indexable: {results.crawl.indexableCount} / {results.crawl.pagesScanned}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Robots.txt</div>
                                        <div className="text-sm font-black text-text-primary">{results.crawl.robots.status}</div>
                                        <div className="text-xs font-bold text-text-muted">Disallow rules: {results.crawl.robots.disallowCount}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Sitemap</div>
                                        <div className="text-sm font-black text-text-primary">{results.crawl.sitemap.status}</div>
                                        <div className="text-xs font-bold text-text-muted">URLs: {results.crawl.sitemap.urlCount}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {results.crawl.pages.map((page) => (
                                    <div key={page.url} className="flex flex-col gap-2 rounded-xl border border-border-light bg-white p-4">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div className="text-sm font-black text-text-primary break-words">{page.title || page.url}</div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${page.indexable ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {page.indexable ? 'Indexable' : 'Blocked'}
                                            </span>
                                        </div>
                                        <div className="text-xs font-bold text-text-muted break-all">{page.url}</div>
                                        {page.issues.length > 0 && (
                                            <ul className="text-xs font-bold text-red-600 space-y-1">
                                                {page.issues.map((issue, index) => (
                                                    <li key={index}>• {issue}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Performance */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <Gauge className="h-3 w-3" /> Performance & Core Web Vitals
                            </div>
                            <div className="rounded-xl border border-border-light bg-white p-4">
                                {results.performance.status === 'available' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">LCP</div>
                                            <div className="text-lg font-black text-text-primary">{results.performance.metrics?.lcp || '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">CLS</div>
                                            <div className="text-lg font-black text-text-primary">{results.performance.metrics?.cls || '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">INP</div>
                                            <div className="text-lg font-black text-text-primary">{results.performance.metrics?.inp || '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Score</div>
                                            <div className="text-lg font-black text-text-primary">{results.performance.score ?? '—'}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm font-bold text-text-muted">
                                        {results.performance.reason || 'Performance data unavailable. Add PAGESPEED_API_KEY to enable Core Web Vitals.'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Keyword & Content */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <BarChart3 className="h-3 w-3" /> Keyword & Content Optimization
                            </div>
                            <div className="rounded-xl border border-border-light bg-white mb-4">
                                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Word Count</div>
                                        <div className="text-2xl font-black text-text-primary">{results.content.wordCount}</div>
                                        {results.content.gapAnalysis !== 0 && (
                                            <div className="text-xs font-bold text-text-muted">
                                                {results.content.gapAnalysis > 0 ? `${results.content.gapAnalysis} words behind competitors` : 'Ahead of competitor average'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Content Quality</div>
                                        <div className="text-2xl font-black text-text-primary">{results.content.qualityScore}</div>
                                        <div className="text-xs font-bold text-text-muted">Based on depth & keyword coverage</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Top Terms</div>
                                        <div className="text-xs font-bold text-text-primary space-y-1">
                                            {results.content.topTerms.map((term) => (
                                                <div key={term.term} className="flex justify-between gap-4">
                                                    <span className="break-words">{term.term}</span>
                                                    <span className="text-text-muted">{term.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Semantic Suggestions</div>
                                        <div className="text-xs font-bold text-text-primary space-y-1">
                                            {results.content.semanticSuggestions.length > 0 ? results.content.semanticSuggestions.map((term) => (
                                                <div key={term} className="break-words">• {term}</div>
                                            )) : (
                                                <div className="text-text-muted">Add content to surface related concepts.</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 xl:col-span-2">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Competitor Benchmarks</div>
                                        <div className="text-xs font-bold text-text-primary space-y-2">
                                            {results.content.competitorBenchmarks.length > 0 ? results.content.competitorBenchmarks.map((item) => (
                                                <div key={item.url} className="border-b border-border-light pb-2 last:border-b-0">
                                                    <div className="break-all">{item.url}</div>
                                                    <div className="text-text-muted">Words: {item.wordCount} · Keyword coverage: {item.keywordCoverage}%</div>
                                                </div>
                                            )) : (
                                                <div className="text-text-muted">Add competitor URLs for gap insights.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-border-light bg-white p-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Keyword Density</div>
                                {results.content.keywordStats.length > 0 ? (
                                    <div className="space-y-2">
                                        {results.content.keywordStats.map((keyword) => (
                                            <div key={keyword.keyword} className="flex flex-col gap-2 border-b border-border-light pb-2 last:border-b-0">
                                                <div className="flex items-center justify-between gap-4 text-sm font-bold text-text-primary">
                                                    <span className="break-words">{keyword.keyword}</span>
                                                    <span className="text-text-muted">{keyword.density}%</span>
                                                </div>
                                                <div className="text-xs font-bold text-text-muted">
                                                    Title: {keyword.inTitle ? 'Yes' : 'No'} · Description: {keyword.inDescription ? 'Yes' : 'No'} · H1: {keyword.inH1 ? 'Yes' : 'No'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm font-bold text-text-muted">Add keywords to calculate density and relevance.</div>
                                )}
                            </div>
                        </div>

                        {/* Backlinks */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <Link2 className="h-3 w-3" /> Backlink Analysis
                            </div>
                            <div className="rounded-xl border border-border-light bg-white p-4 text-sm font-bold text-text-muted">
                                {results.backlinks.status === 'available'
                                    ? 'Backlink data connected. Metrics will appear here.'
                                    : results.backlinks.reason || 'Backlink data unavailable. Configure BACKLINKS_API_URL to enable.'}
                            </div>
                        </div>

                        {/* Rank Tracking */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <TrendingUp className="h-3 w-3" /> Rank Tracking
                            </div>
                            <div className="rounded-xl border border-border-light bg-white p-4 text-sm font-bold text-text-muted">
                                {results.rankTracking.status === 'available' ? (
                                    results.rankTracking.positions.length > 0 ? (
                                        <div className="space-y-2">
                                            {results.rankTracking.positions.map((item) => (
                                                <div key={item.keyword} className="flex items-center justify-between gap-4 text-xs font-bold text-text-primary">
                                                    <span className="break-words">{item.keyword}</span>
                                                    <span>{item.position ? `#${item.position}` : 'Not in top 10'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        'Rank tracking connected. Add keywords to fetch positions.'
                                    )
                                ) : (
                                    results.rankTracking.reason || 'Rank tracking unavailable. Configure SERPAPI_KEY to enable.'
                                )}
                            </div>
                        </div>

                        {/* User Behavior */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <Users className="h-3 w-3" /> User Behavior Integration
                            </div>
                            <div className="rounded-xl border border-border-light bg-white p-4 text-sm font-bold text-text-muted">
                                {results.userBehavior.status === 'available'
                                    ? 'Analytics connected. Engagement insights will appear here.'
                                    : results.userBehavior.reason || 'Connect Google Analytics to surface engagement priorities.'}
                            </div>
                        </div>

                        {/* Competitor & SERP */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <Search className="h-3 w-3" /> Competitor & SERP Analysis
                            </div>
                            <div className="rounded-xl border border-border-light bg-white p-4 text-sm font-bold text-text-muted">
                                {results.competitorSerp.status === 'available' ? (
                                    results.competitorSerp.serpFeatures.length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="text-xs font-bold text-text-muted">Detected SERP Features</div>
                                            <div className="flex flex-wrap gap-2">
                                                {results.competitorSerp.serpFeatures.map((feature) => (
                                                    <span key={feature} className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-black text-blue-700">
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        'SERP analysis connected. Feature data will appear here.'
                                    )
                                ) : (
                                    results.competitorSerp.reason || 'Configure SERPAPI_KEY to enable SERP feature analysis.'
                                )}
                            </div>
                        </div>

                        {/* Remediation Engine */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <ShieldAlert className="h-3 w-3" /> Remediation Engine
                            </div>
                            <div className="space-y-3">
                                {results.report.remediation.map((item, index) => (
                                    <div key={`${item.issue}-${index}`} className="rounded-xl border border-border-light bg-white p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="text-sm font-black text-text-primary break-words">{item.issue}</div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${getSeverityColor(item.severity)}`}>
                                                {item.severity}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs font-bold text-text-muted break-words">{item.impact}</div>
                                        <div className="mt-2 text-xs font-bold text-text-primary break-words">{item.fix}</div>
                                        {item.example && <div className="mt-2 text-xs font-bold text-text-muted break-words">{item.example}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Export */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <Download className="h-3 w-3" /> Exportable Reports
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => handleExport('json')} className="btn-secondary h-10 px-5 gap-2">
                                    <Download className="h-4 w-4" /> JSON
                                </button>
                                <button onClick={() => handleExport('csv')} className="btn-secondary h-10 px-5 gap-2">
                                    <Download className="h-4 w-4" /> CSV
                                </button>
                                <button onClick={handlePrint} className="btn-secondary h-10 px-5 gap-2">
                                    <Download className="h-4 w-4" /> PDF
                                </button>
                            </div>
                        </div>

                        {/* History */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <History className="h-3 w-3" /> Historical Scans
                            </div>
                            <div className="space-y-3">
                                {history.length > 0 ? history.map((entry) => (
                                    <div key={`${entry.url}-${entry.date}`} className="rounded-xl border border-border-light bg-white p-4">
                                        <div className="flex items-center justify-between text-sm font-bold text-text-primary">
                                            <span className="break-all">{entry.url}</span>
                                            <span>{entry.score}</span>
                                        </div>
                                        <div className="text-xs font-bold text-text-muted">Keywords: {entry.keywords || '—'}</div>
                                        <div className="text-xs font-bold text-text-muted">Scan: {new Date(entry.date).toLocaleString()}</div>
                                    </div>
                                )) : (
                                    <div className="rounded-xl border border-border-light bg-surface-light p-4 text-sm font-bold text-text-muted">
                                        Run an analysis to populate historical scans.
                                    </div>
                                )}
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
                        answer: "A score above 80 is generally considered good, indicating that your page follows most technical best practices. Content quality, backlinks, and user engagement are also critical factors, which you can now connect via the enhanced modules."
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
