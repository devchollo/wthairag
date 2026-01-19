'use client';

import styles from '../workspace.module.css';

export default function Dashboard() {
    return (
        <div>
            <h1>Workspace Overview</h1>
            <p className={styles.subtitle}>Insights and analytics for your organization.</p>

            <div className={styles.statsGrid} style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div className="glass card" style={{ padding: '24px' }}>
                    <h4>AI Token Usage</h4>
                    <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--foreground)', marginTop: '8px' }}>12.4k</p>
                </div>
                <div className="glass card" style={{ padding: '24px' }}>
                    <h4>Documents Ingested</h4>
                    <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--foreground)', marginTop: '8px' }}>42</p>
                </div>
                <div className="glass card" style={{ padding: '24px' }}>
                    <h4>Active Members</h4>
                    <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--foreground)', marginTop: '8px' }}>8</p>
                </div>
            </div>

            <div className="glass card" style={{ marginTop: '32px', padding: '32px' }}>
                <h3>Most Queried Topics</h3>
                <ul style={{ marginTop: '16px', listStyle: 'none' }}>
                    <li style={{ padding: '12px 0', borderBottom: '1px solid var(--card-border)' }}>1. Vacation Policy</li>
                    <li style={{ padding: '12px 0', borderBottom: '1px solid var(--card-border)' }}>2. Security Protocols</li>
                    <li style={{ padding: '12px 0', borderBottom: '1px solid var(--card-border)' }}>3. Onboarding Steps</li>
                </ul>
            </div>
        </div>
    );
}
