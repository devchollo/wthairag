'use client';

import { useState, useEffect } from 'react';
import { Bell, ShieldAlert, CheckCircle, Clock, Activity, Plus, MoreVertical, Trash2, Edit2, Terminal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AlertsSkeleton } from '@/components/Skeleton';

interface Alert {
    _id: string;
    title: string;
    description?: string;
    severity: 'high' | 'medium' | 'low';
    status: 'open' | 'resolved';
    createdAt: string;
}

export default function AlertsPage() {
    const { currentWorkspace, userRole } = useAuth();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newAlert, setNewAlert] = useState({ title: '', description: '', severity: 'low' as const });

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

            <div className="space-y-4">
                {alerts.map(alert => (
                    <div key={alert._id} className="card flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center p-6 group">
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-lg ${alert.severity === 'high' ? 'bg-red-500/10 text-red-500' :
                                alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-blue-500/10 text-blue-500'
                                }`}>
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${alert.severity === 'high' ? 'border-red-500/20 text-red-600 bg-red-50' :
                                        alert.severity === 'medium' ? 'border-amber-500/20 text-amber-600 bg-amber-50' :
                                            'border-blue-500/20 text-blue-600 bg-blue-50'
                                        }`}>
                                        {alert.severity} Priority
                                    </span>
                                    <span className="text-xs text-text-muted flex items-center gap-1 font-bold">
                                        <Clock className="h-3 w-3" /> {new Date(alert.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-text-primary tracking-tight">{alert.title}</h3>
                                {alert.description && <p className="text-xs font-bold text-text-muted mt-1">{alert.description}</p>}
                                <p className="text-sm font-bold text-text-secondary mt-1">Status: {alert.status === 'open' ? 'Immediate Action Required' : 'Resolution Confirmed'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                            {alert.status === 'open' ? (
                                <button
                                    className="btn-secondary h-9 px-4 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
                                    onClick={() => handleResolve(alert._id)}
                                >
                                    Resolve
                                </button>
                            ) : (
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Optimized
                                </div>
                            )}

                            {isAdmin && (
                                <button
                                    onClick={() => handleDelete(alert._id)}
                                    className="h-9 w-9 flex items-center justify-center rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {alerts.length === 0 && !loading && (
                    <div className="p-12 bg-surface-light rounded-xl border border-dashed border-border-light text-center">
                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-3 opacity-50" />
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Protocol Nominal. No active alerts.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

