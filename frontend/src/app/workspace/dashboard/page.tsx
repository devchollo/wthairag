'use client';

import { LayoutDashboard, Zap, FileText, Users, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
    const stats = [
        { label: 'AI Token Usage', value: '12.4k', trend: '+14%', icon: Zap },
        { label: 'Documents Ingested', value: '42', trend: '+2', icon: FileText },
        { label: 'Active Members', value: '8', trend: 'Stable', icon: Users },
    ];

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark flex items-center gap-2">
                        <LayoutDashboard className="h-6 w-6 text-primary" />
                        Workspace Overview
                    </h1>
                    <p className="text-text-secondary dark:text-muted mt-1">Insights and analytics for your private organization.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="card">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-text-muted'}`}>
                                {stat.trend} <ArrowUpRight className="h-3 w-3" />
                            </div>
                        </div>
                        <div className="text-[13px] font-bold uppercase tracking-wider text-text-muted mb-1">
                            {stat.label}
                        </div>
                        <div className="text-3xl font-extrabold text-text-primary dark:text-text-dark">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="card">
                <div className="flex items-center gap-2 mb-6 text-text-primary dark:text-text-dark">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg">Most Queried Topics</h3>
                </div>
                <div className="divide-y divide-border-light dark:divide-border-dark">
                    {[
                        { topic: 'Vacation Policy', queries: 245 },
                        { topic: 'Security Protocols', queries: 189 },
                        { topic: 'Onboarding Steps', queries: 132 },
                        { topic: 'Healthcare Benefits', queries: 94 },
                    ].map((item, i) => (
                        <div key={item.topic} className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-text-muted w-4">{i + 1}.</span>
                                <span className="font-semibold text-text-primary dark:text-text-dark">{item.topic}</span>
                            </div>
                            <div className="text-sm text-text-secondary dark:text-muted">
                                {item.queries} queries
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

