'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Terminal, User, FileText, Bell, BarChart3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DashboardSkeleton } from '@/components/Skeleton';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    AreaChart,
    Area
} from 'recharts';

export default function Dashboard() {
    const { currentWorkspace, user, userRole } = useAuth();
    const [userStats, setUserStats] = useState<any>(null);
    const [workspaceStats, setWorkspaceStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userTopQueryVisible, setUserTopQueryVisible] = useState(5);
    const [workspaceTopQueryVisible, setWorkspaceTopQueryVisible] = useState(5);

    useEffect(() => {
        if (!currentWorkspace || !user) return;

        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const headers = {
                    'x-workspace-id': currentWorkspace._id,
                    'Content-Type': 'application/json'
                };

                // Fetch User Stats
                const userRes = await fetch(`${apiUrl}/api/analytics/user`, { headers, credentials: 'include' });
                if (userRes.ok) {
                    const data = await userRes.json();
                    setUserStats(data.data);
                }

                // If Admin/Owner, Fetch Workspace Stats
                const role = userRole || 'member'; // Fallback
                if (role === 'admin' || role === 'owner') {
                    const wsRes = await fetch(`${apiUrl}/api/analytics/workspace`, { headers, credentials: 'include' });
                    if (wsRes.ok) {
                        const data = await wsRes.json();
                        setWorkspaceStats(data.data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [currentWorkspace, user, userRole]);

    if (loading && !userStats) {
        return <DashboardSkeleton />;
    }

    // Format chart data for Recharts
    const userChartData = userStats?.chartData?.labels?.map((label: string, i: number) => ({
        name: label,
        tokens: userStats.chartData.tokens[i]
    })) || [];

    const wsChartData = workspaceStats?.chartData?.labels?.map((label: string, i: number) => ({
        name: label,
        tokens: workspaceStats.chartData.tokens[i]
    })) || [];

    const aggregateTopQueries = (queries: any[] = []) => {
        const grouped = new Map<string, { topic: string; count: number }>();

        queries.forEach((query) => {
            const topicLabel = (query?.topic ?? query?.query ?? 'Unknown topic').trim();
            const key = topicLabel.length > 0 ? topicLabel : 'Unknown topic';
            const existing = grouped.get(key) ?? { topic: key, count: 0 };
            existing.count += query?.count ?? 0;
            grouped.set(key, existing);
        });

        return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
    };

    const userTopQueryList = aggregateTopQueries(userStats?.topQueries);
    const workspaceTopQueryList = aggregateTopQueries(workspaceStats?.topQueries);

    const userTopQueriesData = userTopQueryList.map((query) => ({
        name: query.topic,
        count: query.count
    }));

    const workspaceTopQueriesData = workspaceTopQueryList.map((query) => ({
        name: query.topic,
        count: query.count
    }));

    const visibleUserTopQueries = userTopQueryList.slice(0, userTopQueryVisible);
    const visibleWorkspaceTopQueries = workspaceTopQueryList.slice(0, workspaceTopQueryVisible);

    const chartUserTopQueries = userTopQueriesData.slice(0, 5);
    const chartWorkspaceTopQueries = workspaceTopQueriesData.slice(0, 5);

    const buildSeries = (labels?: string[], values?: number[], key = 'value') =>
        labels?.map((label, i) => ({
            name: label,
            [key]: values?.[i] ?? 0
        })) || [];

    const recentKnowledgeSeries = buildSeries(
        userStats?.recentKnowledgeBase?.labels,
        userStats?.recentKnowledgeBase?.counts,
        'count'
    );
    const recentAlertSeries = buildSeries(
        userStats?.recentAlerts?.labels,
        userStats?.recentAlerts?.counts,
        'count'
    );

    const workspaceRecentKnowledgeSeries = buildSeries(
        workspaceStats?.recentKnowledgeBase?.labels,
        workspaceStats?.recentKnowledgeBase?.counts,
        'count'
    );
    const workspaceRecentAlertSeries = buildSeries(
        workspaceStats?.recentAlerts?.labels,
        workspaceStats?.recentAlerts?.counts,
        'count'
    );
    const recentViewedType = userStats?.recentItems?.[0]?.type ?? userStats?.recentItem?.type;

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

            {/* Admin Workspace Stats Section */}
            {(userRole === 'admin' || userRole === 'owner') && workspaceStats && (
                <div className="space-y-6 pt-8 border-t-2 border-dashed border-border-light">
                    <h2 className="text-lg font-black tracking-tight text-text-primary flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-indigo-600" /> Workspace Overview
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="card p-5 border-l-4 border-l-indigo-500">
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Total Workspace Tokens</div>
                            <div className="text-3xl font-black text-text-primary">{workspaceStats?.totalTokens?.toLocaleString() || 0}</div>
                        </div>
                        <div className="lg:col-span-3 card p-5 relative min-h-[120px] flex flex-col justify-between">
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Workspace Activity</div>
                            <div className="h-[100px] w-full">
                                {wsChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={wsChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={6} />
                                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                            <Tooltip
                                                cursor={{ fill: '#f1f5f9' }}
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                            />
                                            <Bar dataKey="tokens" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-text-muted italic">No data available</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Topics */}
                        <div className="card p-6">
                            <h3 className="text-sm font-black text-text-primary mb-4 uppercase tracking-wide">Most Popular Topics</h3>
                            <div className="h-[180px]">
                                {chartWorkspaceTopQueries.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartWorkspaceTopQueries} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                            <Tooltip
                                                cursor={{ fill: '#f1f5f9' }}
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                            />
                                            <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-text-muted italic">No activity recorded.</div>
                                )}
                            </div>
                            {workspaceTopQueryList.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {visibleWorkspaceTopQueries.map((q: any, i: number) => (
                                        <div key={i} className="flex justify-between items-start py-2 border-b border-border-light last:border-0 gap-4">
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-text-secondary truncate max-w-[70%]">{q.topic}</div>
                                            </div>
                                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-1 rounded whitespace-nowrap">{q.count} queries</span>
                                        </div>
                                    ))}
                                    {workspaceTopQueryList.length > workspaceTopQueryVisible && (
                                        <button
                                            onClick={() => setWorkspaceTopQueryVisible(prev => prev + 5)}
                                            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
                                        >
                                            Show more
                                        </button>
                                    )}
                                    {workspaceTopQueryVisible > 5 && (
                                        <button
                                            onClick={() => setWorkspaceTopQueryVisible(5)}
                                            className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-secondary"
                                        >
                                            Show less
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Top Users */}
                        <div className="card p-6">
                            <h3 className="text-sm font-black text-text-primary mb-4 uppercase tracking-wide">Top Contributors</h3>
                            {workspaceStats?.topUsers?.length > 0 ? (
                                <div className="space-y-3">
                                    {workspaceStats.topUsers.map((u: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-border-light last:border-0">
                                            <div>
                                                <div className="text-sm font-bold text-text-primary">{u.name}</div>
                                                <div className="text-[10px] text-text-muted">{u.email}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-indigo-600">{u.totalTokens.toLocaleString()}</div>
                                                <div className="text-[8px] uppercase tracking-wider text-text-muted">Tokens</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-text-muted italic">No user activity.</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card p-6">
                            <h3 className="text-sm font-black text-text-primary mb-4 uppercase tracking-wide flex items-center gap-2">
                                <FileText className="h-4 w-4 text-emerald-600" /> Recently Added Knowledge Base
                            </h3>
                            <div className="h-[180px]">
                                {workspaceRecentKnowledgeSeries.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={workspaceRecentKnowledgeSeries}>
                                            <defs>
                                                <linearGradient id="workspaceKnowledgeGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={6} />
                                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                            />
                                            <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#workspaceKnowledgeGradient)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-text-muted italic">No recent knowledge base activity.</div>
                                )}
                            </div>
                            {workspaceStats?.recentKnowledgeBase?.items?.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {workspaceStats.recentKnowledgeBase.items.slice(0, 5).map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between gap-4 border-b border-border-light pb-2 last:border-0 last:pb-0">
                                            <span className="text-sm font-medium text-text-secondary truncate">{item.title}</span>
                                            <span className="text-[10px] text-text-muted whitespace-nowrap">
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="card p-6">
                            <h3 className="text-sm font-black text-text-primary mb-4 uppercase tracking-wide flex items-center gap-2">
                                <Bell className="h-4 w-4 text-amber-600" /> Recently Added Alerts
                            </h3>
                            <div className="h-[180px]">
                                {workspaceRecentAlertSeries.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={workspaceRecentAlertSeries}>
                                            <defs>
                                                <linearGradient id="workspaceAlertGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={6} />
                                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                            />
                                            <Area type="monotone" dataKey="count" stroke="#f59e0b" fill="url(#workspaceAlertGradient)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-text-muted italic">No recent alerts activity.</div>
                                )}
                            </div>
                            {workspaceStats?.recentAlerts?.items?.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {workspaceStats.recentAlerts.items.slice(0, 5).map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between gap-4 border-b border-border-light pb-2 last:border-0 last:pb-0">
                                            <span className="text-sm font-medium text-text-secondary truncate">{item.title}</span>
                                            <span className="text-[10px] text-text-muted whitespace-nowrap">
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* User Stats Section */}
            <div className="space-y-6">
                <h2 className="text-lg font-black tracking-tight text-text-primary flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" /> My Performance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card p-5 border-l-4 border-l-blue-500">
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">My Token Usage</div>
                        <div className="text-3xl font-black text-text-primary">{userStats?.totalTokens?.toLocaleString() || 0}</div>
                        <div className="text-[10px] text-text-muted mt-2">Personal usage consumption</div>
                    </div>
                    <div className="lg:col-span-3 card p-5 relative min-h-[120px] flex flex-col justify-between">
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Usage Trend (30 Days)</div>
                        <div className="h-[100px] w-full">
                            {userChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={userChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={6} />
                                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                        />
                                        <Line type="monotone" dataKey="tokens" stroke="#2563eb" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs text-text-muted italic">No data available</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card p-6">
                        <h3 className="text-sm font-black text-text-primary mb-4 uppercase tracking-wide flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-600" /> Most Queried Topics
                        </h3>
                        <div className="h-[180px]">
                            {chartUserTopQueries.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartUserTopQueries} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                        />
                                        <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs text-text-muted italic">No queries recorded yet.</div>
                            )}
                        </div>
                        {userTopQueryList.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {visibleUserTopQueries.map((q: any, i: number) => (
                                    <div key={i} className="flex justify-between items-start py-2 border-b border-border-light last:border-0 gap-4">
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-text-secondary truncate max-w-[70%]">{q.topic}</div>
                                        </div>
                                        <span className="text-[10px] font-black bg-surface-light px-2 py-1 rounded text-text-muted whitespace-nowrap">{q.count} queries</span>
                                    </div>
                                ))}
                                {userTopQueryList.length > userTopQueryVisible && (
                                    <button
                                        onClick={() => setUserTopQueryVisible(prev => prev + 5)}
                                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                                    >
                                        Show more
                                    </button>
                                )}
                                {userTopQueryVisible > 5 && (
                                    <button
                                        onClick={() => setUserTopQueryVisible(5)}
                                        className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-secondary"
                                    >
                                        Show less
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="card p-6">
                        <h3 className="text-sm font-black text-text-primary mb-4 uppercase tracking-wide flex items-center gap-2">
                            {recentViewedType === 'alert' ? (
                                <Bell className="h-4 w-4 text-amber-600" />
                            ) : recentViewedType === 'query' ? (
                                <Terminal className="h-4 w-4 text-blue-600" />
                            ) : (
                                <FileText className="h-4 w-4 text-emerald-600" />
                            )}
                            Recently Viewed
                        </h3>
                        {userStats?.recentItems?.length > 0 ? (
                            <div className="space-y-3">
                                {userStats.recentItems.slice(0, 10).map((item: any, index: number) => (
                                    <div key={`${item.title}-${index}`} className="flex items-center justify-between gap-4 border-b border-border-light pb-3 last:border-0 last:pb-0">
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-text-primary truncate">{item.title}</div>
                                            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-text-muted">
                                                <span className="rounded-full bg-surface-light px-2 py-1 font-black">
                                                    {item.type === 'alert'
                                                        ? 'Alert'
                                                        : item.type === 'query'
                                                            ? 'Query'
                                                            : 'Knowledge Base'}
                                                </span>
                                                {item.status && (
                                                    <span className="rounded-full bg-amber-50 px-2 py-1 font-black text-amber-700">
                                                        {item.status}
                                                    </span>
                                                )}
                                                {(item.viewedAt || item.updatedAt) && (
                                                    <span>{new Date(item.viewedAt || item.updatedAt).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                        {item.link && (
                                            <Link href={item.link} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 whitespace-nowrap">
                                                View Details
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted italic">No recent knowledge base file or alert viewed.</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card p-6">
                        <h3 className="text-sm font-black text-text-primary mb-4 uppercase tracking-wide flex items-center gap-2">
                            <FileText className="h-4 w-4 text-emerald-600" /> Recently Added Knowledge Base
                        </h3>
                        <div className="h-[180px]">
                            {recentKnowledgeSeries.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={recentKnowledgeSeries}>
                                        <defs>
                                            <linearGradient id="knowledgeGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={6} />
                                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#knowledgeGradient)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs text-text-muted italic">No recent knowledge base activity.</div>
                            )}
                        </div>
                        {userStats?.recentKnowledgeBase?.items?.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {userStats.recentKnowledgeBase.items.slice(0, 5).map((item: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between gap-4 border-b border-border-light pb-2 last:border-0 last:pb-0">
                                        <span className="text-sm font-medium text-text-secondary truncate">{item.title}</span>
                                        <span className="text-[10px] text-text-muted whitespace-nowrap">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="card p-6">
                        <h3 className="text-sm font-black text-text-primary mb-4 uppercase tracking-wide flex items-center gap-2">
                            <Bell className="h-4 w-4 text-amber-600" /> Recently Added Alerts
                        </h3>
                        <div className="h-[180px]">
                            {recentAlertSeries.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={recentAlertSeries}>
                                        <defs>
                                            <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={6} />
                                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#f59e0b" fill="url(#alertGradient)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs text-text-muted italic">No recent alerts activity.</div>
                            )}
                        </div>
                        {userStats?.recentAlerts?.items?.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {userStats.recentAlerts.items.slice(0, 5).map((item: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between gap-4 border-b border-border-light pb-2 last:border-0 last:pb-0">
                                        <span className="text-sm font-medium text-text-secondary truncate">{item.title}</span>
                                        <span className="text-[10px] text-text-muted whitespace-nowrap">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
