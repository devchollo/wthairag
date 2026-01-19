'use client';

import { useState } from 'react';
import styles from './tool-detail.module.css';

interface DNSResults {
    A?: string[];
    MX?: { exchange: string; priority: number }[];
    aiReport: string;
}

export default function DNSChecker() {
    const [domain, setDomain] = useState('');
    const [results, setResults] = useState<DNSResults | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLookup = async () => {
        setLoading(true);
        // Call backend API
        setTimeout(() => {
            setResults({
                A: ['192.168.1.1'],
                MX: [{ exchange: 'mail.example.com', priority: 10 }],
                aiReport: 'Domain correctly configured. No issues found.'
            });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="container section-padding">
            <div className="glass tool-container">
                <h1>DNS Checker</h1>
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        placeholder="example.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className={styles.input}
                    />
                    <button onClick={handleLookup} className="btn-primary" disabled={loading}>
                        {loading ? 'Analyzing...' : 'Run Analysis'}
                    </button>
                </div>

                {results && (
                    <div className={styles.results}>
                        <div className={styles.records}>
                            <h3>Records</h3>
                            <pre>{JSON.stringify(results, null, 2)}</pre>
                        </div>

                        <div className={styles.aiReport}>
                            <h3>✨ AI Analysis</h3>
                            <p>{results.aiReport}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
