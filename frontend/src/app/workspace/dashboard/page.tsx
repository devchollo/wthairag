'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Terminal, User, FileText, Bell, BarChart3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DashboardSkeleton } from '@/components/Skeleton';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Dashboard() {
    const { currentWorkspace, user, userRole } = useAuth();
    const [userStats, setUserStats] = useState<any>(null);
    const [workspaceStats, setWorkspaceStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

    const userTopQueriesData = userStats?.topQueries?.map((query: any) => ({
        name: query.query,
        count: query.count
    })) || [];

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
                            {userTopQueriesData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={userTopQueriesData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                                        <XAxis dataKey="name" tick={false} />
                                        <YAxis allowDecimals={false} />
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
                        {userStats?.topQueries?.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {userStats.topQueries.map((q: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-border-light last:border-0">
                                        <span className="text-sm font-medium text-text-secondary truncate max-w-[70%]">{q.query}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black bg-surface-light px-2 py-1 rounded text-text-muted">{q.count} queries</span>
                                            <span className="text-[10px] text-text-muted">{new Date(q.lastUsed).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card p-6">
                        <h3 className="text-sm font-black text-text-primary mb-4 uppercase tracking-wide flex items-center gap-2">
                            {userStats?.recentItem?.type === 'alert' ? (
                                <Bell className="h-4 w-4 text-amber-600" />
                            ) : (
                                <FileText className="h-4 w-4 text-emerald-600" />
                            )}
                            Recently Viewed
                        </h3>
                        {userStats?.recentItem ? (
                            <div className="space-y-3">
                                <div className="text-sm font-bold text-text-primary">{userStats.recentItem.title}</div>
                                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-text-muted">
                                    <span className="rounded-full bg-surface-light px-2 py-1 font-black">
                                        {userStats.recentItem.type === 'alert' ? 'Alert' : 'Knowledge Base'}
                                    </span>
                                    {userStats.recentItem.status && (
                                        <span className="rounded-full bg-amber-50 px-2 py-1 font-black text-amber-700">
                                            {userStats.recentItem.status}
                                        </span>
                                    )}
                                    {userStats.recentItem.updatedAt && (
                                        <span>{new Date(userStats.recentItem.updatedAt).toLocaleDateString()}</span>
                                    )}
                                </div>
                                {userStats.recentItem.link && (
                                    <Link href={userStats.recentItem.link} className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">
                                        View Details
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted italic">No recent knowledge base file or alert viewed.</p>
                        )}
                    </div>
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
                            {workspaceStats?.topQueries?.length > 0 ? (
                                <div className="space-y-3">
                                    {workspaceStats.topQueries.map((q: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-border-light last:border-0">
                                            <span className="text-sm font-medium text-text-secondary truncate max-w-[70%]">{q.query}</span>
                                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{q.count} queries</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-text-muted italic">No activity recorded.</p>
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
                </div>
            )}
        </div>
    );
}
