'use client';

import { useState, useEffect } from 'react';
import { Settings, Shield, User, Palette, Globe, Save, Trash2, AlertTriangle, Terminal, Lock, Mail, Loader2, Users, Crown, ShieldCheck, UserCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
    const { currentWorkspace, user, login, logout, userRole } = useAuth();
    const [activeTab, setActiveTab] = useState<'workspace' | 'account' | 'members'>('workspace');

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

    // Members State
    const [members, setMembers] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
    const [inviteLoading, setInviteLoading] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmSlug, setDeleteConfirmSlug] = useState('');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const isAdmin = userRole === 'owner' || userRole === 'admin';

    const handleTerminateWorkspace = async () => {
        if (deleteConfirmSlug !== currentWorkspace?.slug) {
            showMessage('Slug does not match.', 'error');
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspaces/${currentWorkspace?._id}`, {
                method: 'DELETE',
                headers: { 'x-workspace-slug': currentWorkspace?.slug || '' },
                credentials: 'include'
            });
            if (res.ok) {
                showMessage('Workspace terminated. Logging out...');
                setShowDeleteModal(false);

                // Log out the user and redirect to landing page
                // We use window.location.href to force a full page reload and clear client state
                await logout();
                window.location.href = '/';
            } else {
                const data = await res.json();
                showMessage(data.message || 'Termination failed.', 'error');
            }
        } catch (e) {
            showMessage('Connection error.', 'error');
        }
    };

    useEffect(() => {
        if (currentWorkspace) setWsName(currentWorkspace.name);
        if (user) {
            setUserName(user.name);
            setUserEmail(user.email);
        }
    }, [currentWorkspace, user]);

    const fetchMembers = async () => {
        if (!isAdmin || !currentWorkspace?._id) return;
        setMembersLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/memberships`, {
                headers: { 'x-workspace-id': currentWorkspace._id },
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setMembers(data.data);
        } catch (e) {
            console.error("Failed to fetch members", e);
        } finally {
            setMembersLoading(false);
        }
    };

    const fetchInvites = async () => {
        if (!isAdmin || !currentWorkspace?._id) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/memberships/invites/pending`, {
                headers: { 'x-workspace-id': currentWorkspace._id },
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setInvites(data.data);
        } catch (e) {
            console.error("Failed to fetch invites", e);
        }
    };

    useEffect(() => {
        if (activeTab === 'members') {
            fetchMembers();
            fetchInvites();
        }
    }, [activeTab, currentWorkspace?._id]);

    const handleUpdateRole = async (membershipId: string, role: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/memberships/${membershipId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-workspace-id': currentWorkspace?._id || ''
                },
                body: JSON.stringify({ role }),
                credentials: 'include'
            });
            if (res.ok) {
                showMessage('Member role adjusted.');
                fetchMembers();
            }
        } catch (e) {
            showMessage('Failed to update role', 'error');
        }
    };

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || !currentWorkspace?._id) return;
        setInviteLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/memberships/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-workspace-id': currentWorkspace._id
                },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                showMessage(`Vault invite dispatched to ${inviteEmail}`);
                setShowInviteModal(false);
                setInviteEmail('');
            } else {
                showMessage(data.message || 'Dispatch failed', 'error');
            }
        } catch (e) {
            showMessage('Connection error', 'error');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemoveMember = async (membershipId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/memberships/${membershipId}`, {
                method: 'DELETE',
                headers: { 'x-workspace-id': currentWorkspace?._id || '' },
                credentials: 'include'
            });
            if (res.ok) {
                showMessage('Member evicted from workspace.');
                fetchMembers();
            }
        } catch (e) {
            showMessage('Failed to remove member', 'error');
        }
    };

    const handleCancelInvite = async (inviteId: string) => {
        if (!confirm('Cancel this invitation?')) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/memberships/invites/${inviteId}`, {
                method: 'DELETE',
                headers: { 'x-workspace-id': currentWorkspace?._id || '' },
                credentials: 'include'
            });
            if (res.ok) {
                showMessage('Invitation withdrawn.');
                fetchInvites();
            }
        } catch (e) {
            showMessage('Failed to cancel invite', 'error');
        }
    };

    const handleResetMemberPassword = async (email: string) => {
        if (!confirm(`Send password reset email to ${email}?`)) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: 'include'
            });
            if (res.ok) {
                showMessage(`Reset link sent to ${email}`);
            } else {
                showMessage('Failed to send reset link', 'error');
            }
        } catch (e) {
            showMessage('Connection error', 'error');
        }
    };

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
                {isAdmin && (
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'members' ? 'text-blue-600' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Members
                        {activeTab === 'members' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
                    </button>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            {activeTab === 'workspace' && (
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
                                disabled={wsLoading || !isAdmin}
                                className="btn-primary h-11 px-6 gap-2 w-full sm:w-auto disabled:opacity-50"
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

                    {userRole === 'owner' && (
                        <div className="card border-2 border-red-100 bg-red-50/30 p-8">
                            <div className="flex items-center gap-3 mb-8 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                <h3 className="font-black text-lg tracking-tight">Destructive Protocol</h3>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-600 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-lg border-2 border-red-600 transition-all font-mono"
                            >
                                Terminate Workspace
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Termination Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-text-primary/10 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-100 p-8 space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-text-primary uppercase">Critical Authorization</h3>
                            <p className="text-xs font-bold text-text-muted leading-relaxed">
                                You are about to initiate a workspace extraction protocol. All Knowledge records, Alerts, and Chats will be purged right away.
                            </p>
                        </div>

                        <div className="bg-surface-light p-4 rounded-xl border border-border-light text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">To confirm, type the slug below:</p>
                            <p className="text-sm font-black text-blue-600 font-mono select-none">{currentWorkspace?.slug}</p>
                        </div>

                        <input
                            type="text"
                            value={deleteConfirmSlug}
                            onChange={(e) => setDeleteConfirmSlug(e.target.value)}
                            className="w-full h-11 bg-white border-2 border-border-light rounded-xl px-4 text-center text-sm font-bold outline-none focus:border-red-600 transition-all"
                            placeholder="Enter slug to synchronize"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 h-11 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary border-2 border-border-light rounded-xl transition-all"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleTerminateWorkspace}
                                className="flex-1 bg-red-600 text-white h-11 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'account' && (
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

            {activeTab === 'members' && (
                <div className="space-y-6 animate-in fade-in duration-400">
                    <div className="card p-0 border-2 border-border-light overflow-hidden">
                        <div className="p-8 border-b border-border-light flex items-center justify-between bg-surface-light/50">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-blue-600" />
                                <h3 className="font-black text-lg tracking-tight">Workspace Members</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{members.length} Controlled Identities</div>
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="h-8 px-4 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm"
                                    >
                                        Invite Personnel
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="divide-y divide-border-light">
                            {membersLoading ? (
                                <div className="p-12 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest text-text-muted">Fetching membership records...</p>
                                </div>
                            ) : members.map((member) => (
                                <div key={member._id} className="p-6 flex items-center justify-between hover:bg-surface-light/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border-2 border-blue-100 font-black">
                                            {member.userId?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-black text-text-primary">{member.userId?.name}</h4>
                                                {member.role === 'owner' && <Crown className="h-3 w-3 text-amber-500" />}
                                                {member.userId?._id === user?._id && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">You</span>}
                                            </div>
                                            <p className="text-[10px] font-bold text-text-muted font-mono">{member.userId?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end gap-1">
                                            <label className="text-[8px] font-black uppercase tracking-widest text-text-muted">Access Level</label>
                                            <select
                                                value={member.role}
                                                disabled={member.role === 'owner' || member.userId?._id === user?._id}
                                                onChange={(e) => handleUpdateRole(member._id, e.target.value)}
                                                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-blue-600 outline-none cursor-pointer disabled:opacity-50"
                                            >
                                                <option value="owner" disabled>Owner</option>
                                                <option value="admin">Administrator</option>
                                                <option value="member">Member</option>
                                                <option value="viewer">Viewer</option>
                                            </select>
                                        </div>

                                        {member.role !== 'owner' && member.userId?._id !== user?._id && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleResetMemberPassword(member.userId?.email)}
                                                    className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    title="Send Password Reset Email"
                                                >
                                                    <Lock className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveMember(member._id)}
                                                    className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-all"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {isAdmin && invites.length > 0 && (
                        <div className="card p-0 border-2 border-border-light overflow-hidden mt-8">
                            <div className="p-8 border-b border-border-light flex items-center gap-3 bg-surface-light/50">
                                <Mail className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-black text-lg tracking-tight">Pending Invitations</h3>
                            </div>
                            <div className="divide-y divide-border-light">
                                {invites.map((invite) => (
                                    <div key={invite._id} className="p-6 flex items-center justify-between hover:bg-surface-light/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border-2 border-indigo-100 font-black">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-text-primary">{invite.email}</h4>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted">
                                                    <span>Role: <span className="text-blue-600 uppercase">{invite.role}</span></span>
                                                    <span>•</span>
                                                    <span>Invited by: {invite.invitedBy?.name || 'Admin'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCancelInvite(invite._id)}
                                            className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {showInviteModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-text-primary/10 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border-light p-8 space-y-6 animate-in zoom-in-95 duration-200">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight text-text-primary">Recruit Workspace Member</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Authorization will be sent via encrypted email</p>
                                </div>
                                <form onSubmit={handleInviteSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Personnel Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                                            placeholder="colleague@company.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Assignment Role</label>
                                        <select
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value as any)}
                                            className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
                                        >
                                            <option value="admin">Administrator (Full Control)</option>
                                            <option value="member">Standard Member (Read/Write)</option>
                                            <option value="viewer">Guest Viewer (Read-Only)</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowInviteModal(false)}
                                            className="flex-1 h-11 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary border-2 border-border-light rounded-xl transition-all"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={inviteLoading}
                                            className="flex-1 btn-primary h-11 gap-2"
                                        >
                                            {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                                            Send Invite
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}


        </div>
    )
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
