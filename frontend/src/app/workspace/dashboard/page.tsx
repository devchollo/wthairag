'use client';

import { LayoutDashboard, Zap, FileText, Users, TrendingUp, ArrowUpRight, Terminal } from 'lucide-react';

export default function Dashboard() {
    const stats = [
        { label: 'RAG Context Usage', value: '12.4k', trend: '+14%', icon: Zap },
        { label: 'Active Specs', value: '3', trend: '+1', icon: FileText },
        { label: 'System Uptime', value: '99.9%', trend: 'Stable', icon: Terminal },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                        <Terminal className="h-3.5 w-3.5" /> Workspace / Hub Intelligence
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-text-primary">Console Dashboard.</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="card p-5">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-text-muted'}`}>
                                {stat.trend} <ArrowUpRight className="h-3 w-3" />
                            </div>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                            {stat.label}
                        </div>
                        <div className="text-3xl font-black text-text-primary">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="card p-6">
                <div className="flex items-center gap-2 mb-6 text-text-primary">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h3 className="font-black text-lg tracking-tight">Technical Topic Frequency</h3>
                </div>
                <div className="divide-y divide-border-light">
                    {[
                        { topic: 'Backend Architecture', queries: 245 },
                        { topic: 'Security Prototypes', queries: 189 },
                        { topic: 'RAG Indexing Steps', queries: 132 },
                        { topic: 'Network Propagation', queries: 94 },
                    ].map((item, i) => (
                        <div key={item.topic} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-text-muted w-4">0{i + 1}.</span>
                                <span className="text-sm font-black text-text-primary">{item.topic}</span>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                {item.queries} signals
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
