'use client';

import { useState } from 'react';
import {
    LayoutDashboard, Users, MessageSquare, Settings,
    BarChart3, CheckCircle, XCircle, Trash2,
    Search, Shield, LogOut, ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    // Mock Data (To be replaced with API calls)
    const stats = {
        totalUsers: 1248,
        activeTenants: 86,
        pendingReviews: 14,
        systemHealth: '99.99%'
    };

    const testimonials = [
        { id: 1, name: 'John Doe', role: 'Dev', text: 'Great tool!', rating: 5, status: 'pending' },
        { id: 2, name: 'Jane Smith', role: 'CTO', text: 'Saved us time.', rating: 5, status: 'pending' }
    ];

    const users = [
        { id: 1, name: 'Alice', email: 'alice@corp.com', role: 'Owner', workspace: 'Corp Inc.' },
        { id: 2, name: 'Bob', email: 'bob@startup.io', role: 'Member', workspace: 'StartupIO' }
    ];

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
                        {stats.pendingReviews > 0 && <span className="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">{stats.pendingReviews}</span>}
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
                            System Operational
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
                                    <div className="text-3xl font-black text-zinc-900">{stats.totalUsers}</div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Active Tenants</div>
                                    <div className="text-3xl font-black text-zinc-900">{stats.activeTenants}</div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Pending Reviews</div>
                                    <div className="text-3xl font-black text-zinc-900">{stats.pendingReviews}</div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Uptime</div>
                                    <div className="text-3xl font-black text-zinc-900">{stats.systemHealth}</div>
                                </div>
                            </div>

                            {/* Chart Placeholder */}
                            <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm min-h-[400px] flex items-center justify-center">
                                <div className="text-center opacity-50">
                                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-zinc-300" />
                                    <p className="font-bold text-zinc-400">Activity Analytics Visualization Loading...</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                                <h3 className="font-bold text-lg text-zinc-900">Review Moderation Queue</h3>
                            </div>
                            <div className="divide-y divide-zinc-100">
                                {testimonials.map(review => (
                                    <div key={review.id} className="p-6 flex items-start gap-6 hover:bg-zinc-50 transition-colors">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                                            {review.rating}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <h4 className="font-bold text-zinc-900">{review.name}</h4>
                                                <span className="text-xs font-bold text-zinc-400">{review.role}</span>
                                            </div>
                                            <p className="text-sm text-zinc-600 mb-4">"{review.text}"</p>
                                            <div className="flex gap-2">
                                                <button className="btn-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                                                    <CheckCircle className="h-3 w-3" /> Approve
                                                </button>
                                                <button className="btn-sm bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                                                    <XCircle className="h-3 w-3" /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                                    <input type="text" placeholder="Search tenants..." className="pl-9 pr-4 py-2 rounded-lg border border-zinc-200 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
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
                                        {users.map(user => (
                                            <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-zinc-900">
                                                    <div>{user.name}</div>
                                                    <div className="text-zinc-500 font-medium text-xs">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-zinc-600">{user.workspace}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">{user.role}</span>
                                                </td>
                                                <td className="px-6 py-4 text-emerald-600 font-bold text-xs">Active</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-zinc-400 hover:text-red-500 transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
