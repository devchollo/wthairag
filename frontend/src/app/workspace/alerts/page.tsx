'use client';

import { useState } from 'react';
import { Bell, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

interface Alert {
    id: string;
    title: string;
    severity: 'high' | 'medium' | 'low';
    status: 'open' | 'resolved';
    timestamp: string;
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([
        { id: '1', title: 'Unauthorized Login Attempt', severity: 'high', status: 'open', timestamp: '2 mins ago' },
        { id: '2', title: 'Server Memory Spike', severity: 'medium', status: 'resolved', timestamp: '1 hour ago' },
        { id: '3', title: 'New Knowledge Base Access', severity: 'low', status: 'open', timestamp: '4 hours ago' },
    ]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark flex items-center gap-2">
                        <Bell className="h-6 w-6 text-primary" />
                        Security Alerts
                    </h1>
                    <p className="text-text-secondary dark:text-muted mt-1">Real-time monitoring and threat detection.</p>
                </div>
            </div>

            <div className="space-y-4">
                {alerts.map(alert => (
                    <div key={alert.id} className="card flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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
                                    <span className="text-xs text-text-muted flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {alert.timestamp}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-text-primary dark:text-text-dark">{alert.title}</h3>
                                <p className="text-sm text-text-secondary dark:text-muted">Status: {alert.status === 'open' ? 'Immediate Action Required' : 'Resolution Confirmed'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                            {alert.status === 'open' ? (
                                <button
                                    className="btn-secondary h-9 px-4 text-sm"
                                    onClick={() => setAlerts(alerts.map(a => a.id === alert.id ? { ...a, status: 'resolved' } : a))}
                                >
                                    Mark as Resolved
                                </button>
                            ) : (
                                <div className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    Resolved
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

