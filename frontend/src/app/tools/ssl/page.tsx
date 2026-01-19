'use client';

import { useState } from 'react';
import styles from '../dns/tool-detail.module.css';

interface SSLResults {
    status: string;
    expiry: string;
    issuer: string;
    aiReport: string;
}

export default function SSLAnalyzer() {
    const [domain, setDomain] = useState('');
    const [results, setResults] = useState<SSLResults | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLookup = async () => {
        setLoading(true);
        setTimeout(() => {
            setResults({
                status: 'Valid',
                expiry: '2026-12-31',
                issuer: "Let's Encrypt",
                aiReport: 'The certificate is healthy and uses modern encryption standards (TLS 1.3). No action required.'
            });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="container section-padding">
            <div className="glass tool-container">
                <h1>SSL Analyzer</h1>
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        placeholder="example.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className={styles.input}
                    />
                    <button onClick={handleLookup} className="btn-primary" disabled={loading}>
                        {loading ? 'Analyzing...' : 'Analyze SSL'}
                    </button>
                </div>

                {results && (
                    <div className={styles.results}>
                        <div className={styles.records}>
                            <p><strong>Status:</strong> {results.status}</p>
                            <p><strong>Expiry:</strong> {results.expiry}</p>
                            <p><strong>Issuer:</strong> {results.issuer}</p>
                        </div>

                        <div className={styles.aiReport}>
                            <h3>✨ AI Vulnerability Report</h3>
                            <p>{results.aiReport}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
