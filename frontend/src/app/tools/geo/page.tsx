'use client';

import { useState } from 'react';
import { Sparkles, User, Calendar, Link2, AlertCircle, CheckCircle, Activity, Zap } from 'lucide-react';

interface GEOResults {
    url: string;
    queryTime: number;
    signals: {
        hasStructuredData: boolean;
        hasAuthor: boolean;
        hasDatePublished: boolean;
        entityDensity: string;
        contentClarity: string;
        citationLinks: number;
    };
    issues: string[];
    recommendations: string[];
    report: {
        score: number;
        summary: string;
    };
}

export default function GEOChecker() {
    const [url, setUrl] = useState('');
    const [results, setResults] = useState<GEOResults | null>(null);
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
            const response = await fetch(`${apiUrl}/api/tools/geo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
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
            <div className="mb-10">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Sparkles className="h-3.5 w-3.5" /> WorkToolsHub / GEO Checker
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">Generative Engine Optimization.</h1>
                <p className="mt-3 text-sm font-bold text-text-secondary max-w-2xl">
                    Analyze your content's visibility potential in AI-generated responses like ChatGPT, Perplexity, and Google SGE.
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
                            <div className="text-sm font-black uppercase tracking-widest mt-2">AI Visibility Score</div>
                            <p className="mt-4 text-sm font-bold opacity-80">{results.report.summary}</p>
                        </div>

                        {/* E-E-A-T Signals */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Author Info', value: results.signals.hasAuthor, icon: User },
                                { label: 'Date Published', value: results.signals.hasDatePublished, icon: Calendar },
                                { label: 'Structured Data', value: results.signals.hasStructuredData, icon: Zap },
                                { label: 'Citations', value: results.signals.citationLinks >= 2, icon: Link2, count: results.signals.citationLinks },
                            ].map((item, i) => (
                                <div key={i} className={`p-4 rounded-xl border-2 text-center ${item.value ? 'bg-emerald-50 border-emerald-200' : 'bg-surface-light border-border-light'}`}>
                                    <item.icon className={`h-5 w-5 mx-auto mb-2 ${item.value ? 'text-emerald-600' : 'text-text-muted'}`} />
                                    <div className={`text-lg font-black ${item.value ? 'text-emerald-600' : 'text-text-muted'}`}>
                                        {item.count !== undefined ? item.count : (item.value ? 'YES' : 'NO')}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">{item.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Content Quality */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl bg-surface-light border border-border-light">
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Entity Density</div>
                                <div className="text-xl font-black text-text-primary capitalize">{results.signals.entityDensity}</div>
                            </div>
                            <div className="p-5 rounded-xl bg-surface-light border border-border-light">
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Content Clarity</div>
                                <div className="text-xl font-black text-text-primary capitalize">{results.signals.contentClarity}</div>
                            </div>
                        </div>

                        {/* Issues & Recommendations */}
                        {(results.issues.length > 0 || results.recommendations.length > 0) && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {results.issues.length > 0 && (
                                    <div className="p-6 rounded-xl bg-amber-50 border border-amber-100">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-4">Issues</div>
                                        <ul className="space-y-2">
                                            {results.issues.map((issue, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm font-bold text-amber-800">
                                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {issue}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {results.recommendations.length > 0 && (
                                    <div className="p-6 rounded-xl bg-blue-50 border border-blue-100">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">Recommendations</div>
                                        <ul className="space-y-2">
                                            {results.recommendations.map((rec, i) => (
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
        </div>
    );
}
