'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Zap, FileText, Users, TrendingUp, ArrowUpRight, Terminal, Activity, Coins, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DashboardSkeleton } from '@/components/Skeleton';

export default function Dashboard() {
    const { currentWorkspace } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('monthly');

    const fetchStats = async () => {
        if (!currentWorkspace) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspace-data/stats?filter=${timeRange}`, {
                headers: {
                    'x-workspace-slug': currentWorkspace?.slug || '',
                    'x-workspace-id': currentWorkspace?._id || ''
                },
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setStats(data.data);
        } catch (e) {
            console.error("Failed to fetch stats", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [currentWorkspace, timeRange]);

    if (loading && !stats) {
        return <DashboardSkeleton />;
    }

    const statCards = [
        { label: 'Token Utilization', value: stats?.counts?.tokens?.toLocaleString() || '0', trend: 'AI Usage', icon: Coins, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Active Personnel', value: stats?.counts?.members || '0', trend: 'Nodes', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'RAG Intelligence', value: stats?.counts?.chats || '0', trend: 'Signals', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Knowledge Assets', value: stats?.counts?.documents || '0', trend: 'Records', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
                <div className="flex items-center gap-2 bg-surface-light border-2 border-border-light rounded-xl px-3 h-10">
                    <Calendar className="h-3.5 w-3.5 text-text-muted" />
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest text-text-primary outline-none cursor-pointer"
                    >
                        <option value="daily">Daily Pulse</option>
                        <option value="weekly">Weekly Cycle</option>
                        <option value="monthly">Monthly Audit</option>
                        <option value="yearly">Yearly Outlook</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <div key={stat.label} className="card p-5 hover:border-blue-200 transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-text-muted uppercase`}>
                                {stat.trend}
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

            <div className={`grid grid-cols-1 ${stats?.usage?.tokens > 0 ? 'md:grid-cols-2' : ''} gap-8`}>
                <div className="card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-text-primary">
                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-black text-lg tracking-tight">AI Compute Analysis</h3>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Tokens: {stats?.usage?.tokens?.toLocaleString()}</div>
                    </div>
                    {stats?.usage?.tokens > 0 ? (
                        <div className="flex items-end justify-between h-40 gap-2 mb-4">
                            {(stats?.chartData?.tokens || []).map((val: number, i: number) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div
                                        className="w-full bg-blue-600 rounded-t-md transition-all duration-500 hover:bg-indigo-600 relative"
                                        style={{ height: `${(val / (Math.max(...(stats?.chartData?.tokens || [1])) || 1)) * 100}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {val} TOKENS
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-text-muted uppercase">{stats?.chartData?.labels?.[i]}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-40 items-center justify-center border-2 border-dashed border-border-light rounded-xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">No computation signals detected in this cycle.</p>
                        </div>
                    )}
                </div>

                {stats?.usage?.tokens > 0 && (
                    <div className="card p-8">
                        <div className="flex items-center gap-2 mb-8 text-text-primary">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <h3 className="font-black text-lg tracking-tight">System Status</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-border-light">
                                <span className="text-sm font-black text-text-primary">Network Availability</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border-light">
                                <span className="text-sm font-black text-text-primary">Index Propagation</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Optimized</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border-light">
                                <span className="text-sm font-black text-text-primary">Security Layer</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Shielded</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
