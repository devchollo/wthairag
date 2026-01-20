'use client';

import { useState, useEffect } from 'react';
import { Settings, Shield, User, Palette, Globe, Save, Trash2, AlertTriangle, Terminal, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
    const { currentWorkspace, user, login } = useAuth();
    const [activeTab, setActiveTab] = useState<'workspace' | 'account'>('workspace');

    // Workspace State
    const [wsName, setWsName] = useState(currentWorkspace?.name || '');
    const [wsLoading, setWsLoading] = useState(false);

    // Account State
    const [userName, setUserName] = useState(user?.name || '');
    const [userEmail, setUserEmail] = useState(user?.email || '');
    const [accLoading, setAccLoading] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passLoading, setPassLoading] = useState(false);

    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (currentWorkspace) setWsName(currentWorkspace.name);
        if (user) {
            setUserName(user.name);
            setUserEmail(user.email);
        }
    }, [currentWorkspace, user]);

    const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSaveWorkspace = async () => {
        setWsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspaces/${currentWorkspace?._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-workspace-slug': currentWorkspace?.slug || ''
                },
                body: JSON.stringify({ name: wsName }),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to update workspace');

            // Refresh session to update workspace name in context
            const meRes = await fetch(`${apiUrl}/api/auth/me`, { credentials: 'include' });
            if (meRes.ok) {
                const meData = await meRes.json();
                login({ user: meData.data.user, memberships: meData.data.memberships });
            }
            showMessage('Workspace protocol updated.');
        } catch (e: any) {
            showMessage(e.message, 'error');
        } finally {
            setWsLoading(false);
        }
    };

    const handleSaveAccount = async () => {
        setAccLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/update-me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: userName, email: userEmail }),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update account');

            // Update context manually
            login({ user: data.data, memberships: [] }); // memberships will stay same if we don't re-fetch

            // Better to re-fetch full profile
            const meRes = await fetch(`${apiUrl}/api/auth/me`, { credentials: 'include' });
            if (meRes.ok) {
                const meData = await meRes.json();
                login({ user: meData.data.user, memberships: meData.data.memberships });
            }

            showMessage('Account identity updated.');
        } catch (e: any) {
            showMessage(e.message, 'error');
        } finally {
            setAccLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/update-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update password');

            setCurrentPassword('');
            setNewPassword('');
            showMessage('Security key rotated successfully.');
        } catch (e: any) {
            showMessage(e.message, 'error');
        } finally {
            setPassLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-[800px] space-y-12 pb-20">
            <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                    <Terminal className="h-3.5 w-3.5" /> Workspace / Governance Control
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-text-primary">System Protocol.</h1>
            </div>

            <div className="flex gap-4 border-b border-border-light pb-px">
                <button
                    onClick={() => setActiveTab('workspace')}
                    className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'workspace' ? 'text-blue-600' : 'text-text-muted hover:text-text-primary'}`}
                >
                    Workspace Info
                    {activeTab === 'workspace' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('account')}
                    className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'account' ? 'text-blue-600' : 'text-text-muted hover:text-text-primary'}`}
                >
                    Account Security
                    {activeTab === 'account' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            {activeTab === 'workspace' ? (
                <div className="space-y-6 animate-in fade-in duration-400">
                    <div className="card p-8 border-2 border-border-light">
                        <div className="flex items-center gap-3 mb-8">
                            <Globe className="h-5 w-5 text-blue-600" />
                            <h3 className="font-black text-lg tracking-tight">Organization Identity</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Public Workspace Name</label>
                                <input
                                    type="text"
                                    value={wsName}
                                    onChange={(e) => setWsName(e.target.value)}
                                    className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                                />
                            </div>
                            <button
                                onClick={handleSaveWorkspace}
                                disabled={wsLoading}
                                className="btn-primary h-11 px-6 gap-2 w-full sm:w-auto"
                            >
                                {wsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Update Identity
                            </button>
                        </div>
                    </div>

                    <div className="card border-2 border-border-light p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Shield className="h-5 w-5 text-emerald-600" />
                            <h3 className="font-black text-lg tracking-tight">Governance Status</h3>
                        </div>
                        <div className="p-4 rounded-xl bg-surface-light border border-border-light flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm font-black text-text-primary">Multi-Tenant Logical Isolation</div>
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Row-Level Integrity Verified</div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                    </div>

                    <div className="card border-2 border-red-100 bg-red-50/30 p-8">
                        <div className="flex items-center gap-3 mb-8 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            <h3 className="font-black text-lg tracking-tight">Destructive Protocol</h3>
                        </div>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-600 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-lg border-2 border-red-600 transition-all">
                            Terminate Workspace
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-400">
                    <div className="card p-8 border-2 border-border-light">
                        <div className="flex items-center gap-3 mb-8">
                            <User className="h-5 w-5 text-blue-600" />
                            <h3 className="font-black text-lg tracking-tight">Identity Parameters</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSaveAccount}
                                disabled={accLoading}
                                className="btn-primary h-11 px-6 gap-2 w-full sm:w-auto"
                            >
                                {accLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Sync Identity
                            </button>
                        </div>
                    </div>

                    <div className="card p-8 border-2 border-border-light">
                        <div className="flex items-center gap-3 mb-8">
                            <Lock className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-black text-lg tracking-tight">Security Credentials</h3>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Current Security Key</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">New Security Key</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                                        placeholder="Min. 8 characters"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={passLoading || !newPassword || !currentPassword}
                                className="btn-secondary h-11 px-6 gap-2 w-full sm:w-auto text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                            >
                                {passLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
                                Rotate Access Key
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function RefreshCcw(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
    )
}
