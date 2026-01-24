'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    LayoutDashboard, Users, MessageSquare, Settings,
    CheckCircle, XCircle, Trash2,
    Search, Shield, LogOut
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    Legend
} from 'recharts';

type OverviewStats = {
    totalUsers: number;
    activeTenants: number;
    pendingReviews: number;
    totalTokens: number;
    uptimeSeconds: number;
    systemStatus: string;
    workspaceUsage: {
        _id: string;
        totalTokens: number;
        requestCount: number;
        workspaceName: string;
    }[];
};

type OverviewCharts = {
    labels: string[];
    usageTokens: number[];
    newUsers: number[];
    newWorkspaces: number[];
};

type TenantRow = {
    _id: string;
    role: string;
    createdAt: string;
    user: {
        _id: string;
        name: string;
        email: string;
        isVerified: boolean;
    };
    workspace: {
        _id: string;
        name: string;
    };
};

type TestimonialRow = {
    _id: string;
    name: string;
    role: string;
    text: string;
    rating: number;
    createdAt: string;
    isApproved: boolean;
};

type SystemConfig = {
    environment: string;
    frontendUrl: string | null;
    apiBaseUrl: string | null;
    rateLimits: {
        global: string;
        auth: string;
        ai: string;
    };
    totals: {
        users: number;
        workspaces: number;
        alerts: number;
        pendingReviews: number;
    };
    server: {
        uptimeSeconds: number;
        nodeVersion: string;
    };
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [overview, setOverview] = useState<OverviewStats | null>(null);
    const [charts, setCharts] = useState<OverviewCharts | null>(null);
    const [tenants, setTenants] = useState<TenantRow[]>([]);
    const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
    const [loadingOverview, setLoadingOverview] = useState(true);
    const [loadingTenants, setLoadingTenants] = useState(false);
    const [loadingTestimonials, setLoadingTestimonials] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionBusyId, setActionBusyId] = useState<string | null>(null);
    const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
    const [loadingSystemConfig, setLoadingSystemConfig] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const fetchOverview = async () => {
        setLoadingOverview(true);
        try {
            const res = await fetch(`${apiUrl}/api/admin/overview`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setOverview(data.data.overview);
                setCharts(data.data.charts);
            }
        } catch (error) {
            console.error('Failed to load admin overview', error);
        } finally {
            setLoadingOverview(false);
        }
    };

    const fetchTestimonials = async () => {
        setLoadingTestimonials(true);
        try {
            const res = await fetch(`${apiUrl}/api/admin/testimonials?status=pending`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setTestimonials(data.data || []);
            }
        } catch (error) {
            console.error('Failed to load testimonials', error);
        } finally {
            setLoadingTestimonials(false);
        }
    };

    const fetchTenants = async (term = '') => {
        setLoadingTenants(true);
        try {
            const searchQuery = term ? `?search=${encodeURIComponent(term)}` : '';
            const res = await fetch(`${apiUrl}/api/admin/tenants${searchQuery}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setTenants(data.data || []);
            }
        } catch (error) {
            console.error('Failed to load tenants', error);
        } finally {
            setLoadingTenants(false);
        }
    };

    const handleApprove = async (id: string) => {
        setActionBusyId(id);
        try {
            const res = await fetch(`${apiUrl}/api/admin/testimonials/${id}/approve`, {
                method: 'PUT',
                credentials: 'include'
            });
            if (res.ok) {
                setTestimonials((prev) => prev.filter((item) => item._id !== id));
                fetchOverview();
            }
        } catch (error) {
            console.error('Failed to approve testimonial', error);
        } finally {
            setActionBusyId(null);
        }
    };

    const handleReject = async (id: string) => {
        setActionBusyId(id);
        try {
            const res = await fetch(`${apiUrl}/api/admin/testimonials/${id}/reject`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setTestimonials((prev) => prev.filter((item) => item._id !== id));
                fetchOverview();
            }
        } catch (error) {
            console.error('Failed to reject testimonial', error);
        } finally {
            setActionBusyId(null);
        }
    };

    const fetchSystemConfig = async () => {
        setLoadingSystemConfig(true);
        try {
            const res = await fetch(`${apiUrl}/api/admin/system-config`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setSystemConfig(data.data);
            }
        } catch (error) {
            console.error('Failed to load system config', error);
        } finally {
            setLoadingSystemConfig(false);
        }
    };

    useEffect(() => {
        fetchOverview();
        fetchTestimonials();
        fetchTenants();
        fetchSystemConfig();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchTenants(searchTerm);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const formattedUptime = useMemo(() => {
        const uptime = overview?.uptimeSeconds ?? 0;
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        if (days > 0) {
            return `${days}d ${hours}h`;
        }
        const minutes = Math.floor((uptime % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }, [overview?.uptimeSeconds]);

    const usageChartData = useMemo(() => {
        if (!charts) return [];
        return charts.labels.map((label, index) => ({
            date: new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            tokens: charts.usageTokens[index] || 0
        }));
    }, [charts]);

    const growthChartData = useMemo(() => {
        if (!charts) return [];
        return charts.labels.map((label, index) => ({
            date: new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            users: charts.newUsers[index] || 0,
            workspaces: charts.newWorkspaces[index] || 0
        }));
    }, [charts]);

    const workspaceUsageData = useMemo(() => {
        return (
            overview?.workspaceUsage?.map((workspace) => ({
                name: workspace.workspaceName,
                tokens: workspace.totalTokens,
                requests: workspace.requestCount
            })) || []
        );
    }, [overview?.workspaceUsage]);

    const formattedSystemUptime = useMemo(() => {
        const uptime = systemConfig?.server.uptimeSeconds ?? 0;
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        if (days > 0) {
            return `${days}d ${hours}h`;
        }
        return `${hours}h ${minutes}m`;
    }, [systemConfig?.server.uptimeSeconds]);

    return (
        <div className="flex min-h-screen bg-zinc-50">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-900 text-white flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div className="font-black tracking-tight">Admin<span className="text-zinc-500">Panel</span></div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <LayoutDashboard className="h-4 w-4" /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('tenants')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'tenants' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Users className="h-4 w-4" /> Tenant Management
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'reviews' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <MessageSquare className="h-4 w-4" />
                        Reviews
                        {(overview?.pendingReviews || 0) > 0 && (
                            <span className="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                                {overview?.pendingReviews || 0}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Settings className="h-4 w-4" /> System Config
                    </button>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Dashboard Overview</h1>
                        <p className="text-zinc-500 text-sm font-bold">Welcome back, Administrator.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full text-xs font-bold text-emerald-600 shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            {overview?.systemStatus || 'Checking Status'}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="space-y-8">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Users</div>
                                    <div className="text-3xl font-black text-zinc-900">{overview?.totalUsers?.toLocaleString() || 0}</div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Active Tenants</div>
                                    <div className="text-3xl font-black text-zinc-900">{overview?.activeTenants?.toLocaleString() || 0}</div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Pending Reviews</div>
                                    <div className="text-3xl font-black text-zinc-900">{overview?.pendingReviews?.toLocaleString() || 0}</div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Uptime</div>
                                    <div className="text-3xl font-black text-zinc-900">{formattedUptime}</div>
                                    <div className="text-[11px] text-zinc-400 font-semibold mt-1">Since last restart</div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Workspace Consumption</div>
                                        <div className="text-lg font-black text-zinc-900">Top Workspaces by Tokens</div>
                                    </div>
                                    <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                        {overview?.workspaceUsage?.length || 0} tracked
                                    </div>
                                </div>
                                <div className="h-[260px]">
                                    {loadingOverview ? (
                                        <div className="flex h-full items-center justify-center text-sm text-zinc-400">Loading analytics…</div>
                                    ) : workspaceUsageData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={workspaceUsageData} layout="vertical" margin={{ left: 20 }}>
                                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                                <Bar dataKey="tokens" name="Tokens" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                                                <Bar dataKey="requests" name="Requests" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-zinc-400">No workspace usage yet.</div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Platform Usage</div>
                                            <div className="text-lg font-black text-zinc-900">Token Consumption (30 Days)</div>
                                        </div>
                                        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                            {overview?.totalTokens?.toLocaleString() || 0} total
                                        </div>
                                    </div>
                                    <div className="h-[260px]">
                                        {loadingOverview ? (
                                            <div className="flex h-full items-center justify-center text-sm text-zinc-400">Loading analytics…</div>
                                        ) : usageChartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={usageChartData}>
                                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                                    <YAxis tick={{ fontSize: 11 }} />
                                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                                    <Line type="monotone" dataKey="tokens" stroke="#2563eb" strokeWidth={2} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-sm text-zinc-400">No usage data yet.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Growth</div>
                                            <div className="text-lg font-black text-zinc-900">New Users & Workspaces</div>
                                        </div>
                                        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                            Last 30 days
                                        </div>
                                    </div>
                                    <div className="h-[260px]">
                                        {loadingOverview ? (
                                            <div className="flex h-full items-center justify-center text-sm text-zinc-400">Loading analytics…</div>
                                        ) : growthChartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={growthChartData}>
                                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                                    <YAxis tick={{ fontSize: 11 }} />
                                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                                    <Bar dataKey="users" name="Users" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="workspaces" name="Workspaces" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-sm text-zinc-400">No growth data yet.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                                <h3 className="font-bold text-lg text-zinc-900">Review Moderation Queue</h3>
                                <div className="text-xs font-semibold text-zinc-400">
                                    {loadingTestimonials ? 'Refreshing…' : `${testimonials.length} pending`}
                                </div>
                            </div>
                            <div className="divide-y divide-zinc-100">
                                {loadingTestimonials ? (
                                    <div className="p-6 text-sm text-zinc-500">Loading reviews…</div>
                                ) : testimonials.length === 0 ? (
                                    <div className="p-6 text-sm text-zinc-500">No pending reviews. 🎉</div>
                                ) : (
                                    testimonials.map((review) => (
                                        <div key={review._id} className="p-6 flex items-start gap-6 hover:bg-zinc-50 transition-colors">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                                                {review.rating}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <h4 className="font-bold text-zinc-900">{review.name}</h4>
                                                    <span className="text-xs font-bold text-zinc-400">{review.role}</span>
                                                </div>
                                                <p className="text-sm text-zinc-600 mb-4">"{review.text}"</p>
                                                <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-zinc-400 mb-4">
                                                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    <span className="uppercase tracking-widest">Pending</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(review._id)}
                                                        disabled={actionBusyId === review._id}
                                                        className="btn-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        <CheckCircle className="h-3 w-3" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(review._id)}
                                                        disabled={actionBusyId === review._id}
                                                        className="btn-sm bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        <XCircle className="h-3 w-3" /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tenants Tab */}
                    {activeTab === 'tenants' && (
                        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                                <h3 className="font-bold text-lg text-zinc-900">Tenant Directory</h3>
                                <div className="relative">
                                    <Search className="h-4 w-4 absolute left-3 top-3 text-zinc-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search tenants..."
                                        className="pl-9 pr-4 py-2 rounded-lg border border-zinc-200 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase text-[10px] tracking-widest border-b border-zinc-200">
                                        <tr>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Workspace</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {loadingTenants ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-400">
                                                    Loading tenants…
                                                </td>
                                            </tr>
                                        ) : tenants.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-400">
                                                    No tenant matches found.
                                                </td>
                                            </tr>
                                        ) : (
                                            tenants.map((tenant) => (
                                                <tr key={tenant._id} className="hover:bg-zinc-50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-zinc-900">
                                                        <div>{tenant.user.name}</div>
                                                        <div className="text-zinc-500 font-medium text-xs">{tenant.user.email}</div>
                                                        <div className="text-[10px] font-semibold text-zinc-400 mt-1">
                                                            Joined {new Date(tenant.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-zinc-600">{tenant.workspace.name}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 capitalize">
                                                            {tenant.role}
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-4 font-bold text-xs ${tenant.user.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {tenant.user.isVerified ? 'Verified' : 'Pending'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-zinc-400 hover:text-red-500 transition-colors" disabled>
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* System Config Tab */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-900">System Configuration</h3>
                                        <p className="text-sm text-zinc-500">Live configuration and platform status.</p>
                                    </div>
                                    <div className="text-xs font-semibold text-zinc-400">
                                        {loadingSystemConfig ? 'Refreshing…' : 'Live'}
                                    </div>
                                </div>

                                {loadingSystemConfig ? (
                                    <div className="text-sm text-zinc-500">Loading system configuration…</div>
                                ) : systemConfig ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        <div className="border border-zinc-200 rounded-xl p-4">
                                            <div className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold">Environment</div>
                                            <div className="text-lg font-black text-zinc-900 mt-2">{systemConfig.environment}</div>
                                            <div className="text-xs text-zinc-500 mt-2">Node {systemConfig.server.nodeVersion}</div>
                                        </div>
                                        <div className="border border-zinc-200 rounded-xl p-4">
                                            <div className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold">Frontend URL</div>
                                            <div className="text-sm font-semibold text-zinc-900 mt-2 break-all">
                                                {systemConfig.frontendUrl || 'Not configured'}
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-2">API: {systemConfig.apiBaseUrl || apiUrl}</div>
                                        </div>
                                        <div className="border border-zinc-200 rounded-xl p-4">
                                            <div className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold">Server Uptime</div>
                                            <div className="text-lg font-black text-zinc-900 mt-2">{formattedSystemUptime}</div>
                                            <div className="text-xs text-zinc-500 mt-2">Since last restart</div>
                                        </div>
                                        <div className="border border-zinc-200 rounded-xl p-4">
                                            <div className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold">Rate Limits</div>
                                            <div className="text-sm font-semibold text-zinc-900 mt-2">Global: {systemConfig.rateLimits.global}</div>
                                            <div className="text-sm font-semibold text-zinc-900 mt-1">Auth: {systemConfig.rateLimits.auth}</div>
                                            <div className="text-sm font-semibold text-zinc-900 mt-1">AI: {systemConfig.rateLimits.ai}</div>
                                        </div>
                                        <div className="border border-zinc-200 rounded-xl p-4">
                                            <div className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold">Totals</div>
                                            <div className="text-sm font-semibold text-zinc-900 mt-2">Users: {systemConfig.totals.users.toLocaleString()}</div>
                                            <div className="text-sm font-semibold text-zinc-900 mt-1">Workspaces: {systemConfig.totals.workspaces.toLocaleString()}</div>
                                            <div className="text-sm font-semibold text-zinc-900 mt-1">Alerts: {systemConfig.totals.alerts.toLocaleString()}</div>
                                            <div className="text-sm font-semibold text-zinc-900 mt-1">Pending Reviews: {systemConfig.totals.pendingReviews.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-zinc-500">Unable to load system configuration.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
