'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Clock, Plus, Trash2, Terminal, Eye, Search, Filter, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AlertsSkeleton } from '@/components/Skeleton';

interface Alert {
    _id: string;
    title: string;
    description?: string;
    severity: 'high' | 'medium' | 'low';
    status: 'open' | 'resolved';
    createdAt: string;
    updatedAt?: string;
    createdBy?: { name?: string; email?: string };
    updatedBy?: { name?: string; email?: string };
}

export default function AlertsPage() {
    const { currentWorkspace, userRole } = useAuth();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newAlert, setNewAlert] = useState({ title: '', description: '', severity: 'low' as const });
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
    const [editAlert, setEditAlert] = useState({ title: '', description: '', severity: 'low' as const });

    const isAdmin = userRole === 'owner' || userRole === 'admin';

    const fetchAlerts = async () => {
        if (!currentWorkspace?._id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/alerts`, {
                headers: {
                    'x-workspace-id': currentWorkspace._id,
                    'x-workspace-slug': currentWorkspace.slug || ''
                },
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setAlerts(data.data);
        } catch (e) {
            console.error("Failed to fetch alerts", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, [currentWorkspace?._id]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/alerts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-workspace-id': currentWorkspace?._id || '',
                    'x-workspace-slug': currentWorkspace?.slug || ''
                },
                body: JSON.stringify(newAlert),
                credentials: 'include'
            });
            if (res.ok) {
                setShowCreate(false);
                setNewAlert({ title: '', description: '', severity: 'low' });
                fetchAlerts();
            }
        } catch (e) {
            console.error("Create failed", e);
        }
    };

    const handleResolve = async (id: string) => {
        if (!currentWorkspace?._id) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/alerts/${id}/resolve`, {
                method: 'PUT',
                headers: {
                    'x-workspace-id': currentWorkspace._id,
                    'x-workspace-slug': currentWorkspace.slug || ''
                },
                credentials: 'include'
            });
            if (res.ok) fetchAlerts();
        } catch (e) {
            console.error("Resolve failed", e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!currentWorkspace?._id || !isAdmin) return;
        if (!confirm('Are you sure you want to delete this alert?')) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/alerts/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-workspace-id': currentWorkspace._id,
                    'x-workspace-slug': currentWorkspace.slug || ''
                },
                credentials: 'include'
            });
            if (res.ok) fetchAlerts();
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    const recordAlertView = async (id: string) => {
        if (!currentWorkspace?._id) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await fetch(`${apiUrl}/api/alerts/${id}/view`, {
                method: 'POST',
                headers: {
                    'x-workspace-id': currentWorkspace._id,
                    'x-workspace-slug': currentWorkspace.slug || ''
                },
                credentials: 'include'
            });
        } catch (e) {
            console.error('Failed to record alert view', e);
        }
    };

    const handleView = (alert: Alert) => {
        setSelectedAlert(alert);
        recordAlertView(alert._id);
    };

    const handleEditOpen = (alert: Alert) => {
        setEditingAlert(alert);
        setEditAlert({
            title: alert.title,
            description: alert.description || '',
            severity: alert.severity as any
        });
    };

    const handleEditClose = () => {
        setEditingAlert(null);
        setEditAlert({ title: '', description: '', severity: 'low' });
    };

    const handleEditSubmit = async () => {
        if (!editingAlert || !currentWorkspace?._id) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/alerts/${editingAlert._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-workspace-id': currentWorkspace._id,
                    'x-workspace-slug': currentWorkspace.slug || ''
                },
                body: JSON.stringify(editAlert),
                credentials: 'include'
            });
            if (res.ok) {
                await fetchAlerts();
                handleEditClose();
            }
        } catch (e) {
            console.error("Update failed", e);
        }
    };

    const truncateDetails = (value?: string, maxLength = 140) => {
        if (!value) return 'No details provided.';
        if (value.length <= maxLength) return value;
        return `${value.slice(0, maxLength).trimEnd()}…`;
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch = alert.title.toLowerCase().includes(search.toLowerCase()) ||
            (alert.description || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
        const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
        return matchesSearch && matchesStatus && matchesSeverity;
    });

    const formatUser = (user?: { name?: string; email?: string }) => user?.name || user?.email || 'Unknown';

    if (loading && alerts.length === 0) {
        return <AlertsSkeleton />;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                        <Terminal className="h-3.5 w-3.5" /> Workspace / Security Console
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-text-primary">Alert Center.</h1>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="btn-primary h-10 px-4 gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Manual Alert
                    </button>
                )}
            </div>

            {showCreate && (
                <div className="card p-6 animate-in slide-in-from-top-4">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text" placeholder="Alert Title" required
                                className="w-full h-10 bg-surface-light border-2 border-border-light rounded-xl px-4 text-xs font-bold outline-none"
                                value={newAlert.title}
                                onChange={e => setNewAlert({ ...newAlert, title: e.target.value })}
                            />
                            <select
                                className="w-full h-10 bg-surface-light border-2 border-border-light rounded-xl px-4 text-xs font-bold outline-none"
                                value={newAlert.severity}
                                onChange={e => setNewAlert({ ...newAlert, severity: e.target.value as any })}
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                        </div>
                        <textarea
                            placeholder="Description"
                            className="w-full bg-surface-light border-2 border-border-light rounded-xl p-4 text-xs font-bold outline-none min-h-[100px]"
                            value={newAlert.description}
                            onChange={e => setNewAlert({ ...newAlert, description: e.target.value })}
                        />
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary h-9 px-4 text-xs font-black uppercase">Cancel</button>
                            <button type="submit" className="btn-primary h-9 px-4 text-xs font-black uppercase">Log Alert</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search alerts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 bg-surface-light border-2 border-border-light rounded-xl pl-10 pr-4 text-xs font-bold outline-none focus:border-blue-600 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 bg-surface-light border-2 border-border-light rounded-xl px-3 h-10">
                    <Filter className="h-3.5 w-3.5 text-text-muted" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest text-text-primary outline-none cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-surface-light border-2 border-border-light rounded-xl px-3 h-10">
                    <Filter className="h-3.5 w-3.5 text-text-muted" />
                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest text-text-primary outline-none cursor-pointer"
                    >
                        <option value="all">All Severities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filteredAlerts.length > 0 && (
                    <div className="card overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 bg-surface-light px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                            <div className="col-span-4">Title</div>
                            <div className="col-span-2">Timestamp</div>
                            <div className="col-span-3">Details</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>
                        <div className="divide-y divide-border-light">
                            {filteredAlerts.map(alert => (
                                <div key={alert._id} className="grid grid-cols-12 gap-4 px-6 py-5 items-start">
                                    <div className="col-span-4 flex gap-3">
                                        <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg ${alert.severity === 'high' ? 'bg-red-500/10 text-red-500' :
                                            alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            <ShieldAlert className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${alert.severity === 'high' ? 'border-red-500/20 text-red-600 bg-red-50' :
                                                    alert.severity === 'medium' ? 'border-amber-500/20 text-amber-600 bg-amber-50' :
                                                        'border-blue-500/20 text-blue-600 bg-blue-50'
                                                    }`}>
                                                    {alert.severity} Priority
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-black text-text-primary tracking-tight truncate">{alert.title}</h3>
                                            <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                                Added by {formatUser(alert.createdBy)} · Edited by {formatUser(alert.updatedBy)}
                                                {alert.updatedAt && ` · Modified ${new Date(alert.updatedAt).toLocaleDateString()}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-xs font-bold text-text-muted flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {new Date(alert.createdAt).toLocaleString()}
                                    </div>
                                    <div className="col-span-3 text-xs font-bold text-text-secondary">
                                        {truncateDetails(alert.description)}
                                    </div>
                                    <div className="col-span-1">
                                        {alert.status === 'open' ? (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                                Open
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                                Resolved
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-span-2 flex items-center justify-end gap-2 flex-wrap">
                                        <button
                                            onClick={() => handleView(alert)}
                                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-border-light text-text-muted hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                                            aria-label="View alert"
                                            title="View alert"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleEditOpen(alert)}
                                                className="h-9 w-9 flex items-center justify-center rounded-lg border border-border-light text-text-muted hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                                                aria-label="Edit alert"
                                                title="Edit alert"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        )}
                                        {alert.status === 'open' && isAdmin && (
                                            <button
                                                className="h-9 w-9 flex items-center justify-center rounded-lg border border-border-light text-text-muted hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                                                onClick={() => handleResolve(alert._id)}
                                                aria-label="Resolve alert"
                                                title="Resolve alert"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                            </button>
                                        )}
                                        {alert.status !== 'open' && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                Optimized
                                            </div>
                                        )}
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDelete(alert._id)}
                                                className="h-9 w-9 flex items-center justify-center rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                                                aria-label="Delete alert"
                                                title="Delete alert"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {filteredAlerts.length === 0 && !loading && (
                    <div className="p-12 bg-surface-light rounded-xl border border-dashed border-border-light text-center">
                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-3 opacity-50" />
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                            {search || statusFilter !== 'all' || severityFilter !== 'all'
                                ? 'No alerts match your filters.'
                                : 'Protocol Nominal. No active alerts.'}
                        </p>
                    </div>
                )}
            </div>
            {selectedAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="card w-full max-w-2xl p-6 relative">
                        <button
                            onClick={() => setSelectedAlert(null)}
                            className="absolute right-4 top-4 text-text-muted hover:text-text-primary"
                            aria-label="Close alert details"
                        >
                            ✕
                        </button>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${selectedAlert.severity === 'high' ? 'bg-red-500/10 text-red-500' :
                                selectedAlert.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-blue-500/10 text-blue-500'
                                }`}>
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-text-primary">{selectedAlert.title}</h2>
                                <p className="text-xs font-bold text-text-muted flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3" /> {new Date(selectedAlert.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-4">
                            <span className={`px-2 py-1 rounded-full border ${selectedAlert.severity === 'high' ? 'border-red-500/20 text-red-600 bg-red-50' :
                                selectedAlert.severity === 'medium' ? 'border-amber-500/20 text-amber-600 bg-amber-50' :
                                    'border-blue-500/20 text-blue-600 bg-blue-50'
                                }`}>
                                {selectedAlert.severity} Priority
                            </span>
                            <span className={`${selectedAlert.status === 'open' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'} px-2 py-1 rounded-full border`}>
                                {selectedAlert.status === 'open' ? 'Open' : 'Resolved'}
                            </span>
                        </div>
                        <div className="text-sm font-bold text-text-secondary whitespace-pre-wrap max-h-64 overflow-y-auto pr-2">
                            {selectedAlert.description || 'No details provided.'}
                        </div>
                        <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                            Added by {formatUser(selectedAlert.createdBy)} · Edited by {formatUser(selectedAlert.updatedBy)}
                            {selectedAlert.updatedAt && ` · Modified ${new Date(selectedAlert.updatedAt).toLocaleString()}`}
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            {selectedAlert.status === 'open' && isAdmin && (
                                <button
                                    className="btn-secondary h-9 px-4 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
                                    onClick={() => handleResolve(selectedAlert._id)}
                                >
                                    Resolve
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedAlert(null)}
                                className="btn-primary h-9 px-4 text-[10px] font-black uppercase tracking-widest"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {editingAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="card w-full max-w-2xl p-6 relative">
                        <button
                            onClick={handleEditClose}
                            className="absolute right-4 top-4 text-text-muted hover:text-text-primary"
                            aria-label="Close edit alert"
                        >
                            ✕
                        </button>
                        <h2 className="text-lg font-black text-text-primary mb-4">Edit Alert</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                className="w-full h-10 bg-surface-light border-2 border-border-light rounded-xl px-4 text-xs font-bold outline-none"
                                value={editAlert.title}
                                onChange={e => setEditAlert({ ...editAlert, title: e.target.value })}
                            />
                            <select
                                className="w-full h-10 bg-surface-light border-2 border-border-light rounded-xl px-4 text-xs font-bold outline-none"
                                value={editAlert.severity}
                                onChange={e => setEditAlert({ ...editAlert, severity: e.target.value as any })}
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                            <textarea
                                className="w-full bg-surface-light border-2 border-border-light rounded-xl p-4 text-xs font-bold outline-none min-h-[120px]"
                                value={editAlert.description}
                                onChange={e => setEditAlert({ ...editAlert, description: e.target.value })}
                            />
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={handleEditClose}
                                className="btn-secondary h-9 px-4 text-xs font-black uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                className="btn-primary h-9 px-4 text-xs font-black uppercase"
                                disabled={!editAlert.title}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
