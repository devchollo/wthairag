'use client';

import { useState, useEffect } from 'react';
import { Bell, ShieldAlert, CheckCircle, Clock, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Alert {
    _id: string;
    title: string;
    severity: 'high' | 'medium' | 'low';
    status: 'open' | 'resolved';
    createdAt: string;
}

export default function AlertsPage() {
    const { currentWorkspace } = useAuth();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        if (!currentWorkspace?._id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/alerts`, {
                headers: { 'x-workspace-id': currentWorkspace._id },
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

    const handleResolve = async (id: string) => {
        if (!currentWorkspace?._id) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/alerts/${id}/resolve`, {
                method: 'PUT',
                headers: { 'x-workspace-id': currentWorkspace._id },
                credentials: 'include'
            });
            if (res.ok) fetchAlerts();
        } catch (e) {
            console.error("Resolve failed", e);
        }
    };

    if (loading && alerts.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Activity className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
                        <Bell className="h-6 w-6 text-blue-600" />
                        Security Alerts
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm font-bold">Real-time monitoring and threat detection for {currentWorkspace?.name}.</p>
                </div>
            </div>

            <div className="space-y-4">
                {alerts.map(alert => (
                    <div key={alert._id} className="card flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center p-6">
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
                                <p className="text-sm font-bold text-text-secondary">Status: {alert.status === 'open' ? 'Immediate Action Required' : 'Resolution Confirmed'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                            {alert.status === 'open' ? (
                                <button
                                    className="btn-secondary h-9 px-4 text-xs font-black uppercase tracking-widest border-2"
                                    onClick={() => handleResolve(alert._id)}
                                >
                                    Resolve Incident
                                </button>
                            ) : (
                                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-600">
                                    <CheckCircle className="h-4 w-4" />
                                    Resolved
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="p-12 bg-surface-light rounded-xl border border-dashed border-border-light text-center">
                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-3 opacity-50" />
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Protocol Nominal. No active alerts.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

