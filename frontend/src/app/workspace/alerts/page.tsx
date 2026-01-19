'use client';

import { useState } from 'react';
import styles from '../workspace.module.css';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([
        { id: '1', title: 'Unauthorized Login Attempt', severity: 'high', status: 'open' },
        { id: '2', title: 'Server Memory Spike', severity: 'medium', status: 'resolved' },
    ]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>Security Alerts</h1>
            </div>

            <div className={styles.alertList}>
                {alerts.map(alert => (
                    <div key={alert.id} className="glass card" style={{ padding: '24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span className={`badge ${alert.severity === 'high' ? 'red' : 'yellow'}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                                {alert.severity.toUpperCase()}
                            </span>
                            <h3>{alert.title}</h3>
                            <p style={{ fontSize: '13px' }}>Status: {alert.status}</p>
                        </div>
                        {alert.status === 'open' && (
                            <button
                                className="btn-secondary"
                                onClick={() => setAlerts(alerts.map(a => a.id === alert.id ? { ...a, status: 'resolved' } : a))}
                            >
                                Resolve
                            </button>
                        )}
                        {alert.status === 'resolved' && (
                            <span style={{ color: 'green', fontWeight: '600' }}>✓ Resolved</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
