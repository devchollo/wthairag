'use client';

import { useState } from 'react';
import styles from './workspace.module.css';

export default function KnowledgeBase() {
    const [documents, setDocuments] = useState([
        { id: '1', title: 'Company Handbook.pdf', type: 'PDF', date: '2026-01-15' },
        { id: '2', title: 'Q3 Financials.csv', type: 'CSV', date: '2026-01-10' },
    ]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1>Knowledge Base</h1>
                <button className="btn-primary">Upload Document</button>
            </div>

            <div className="glass card">
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                            <th style={{ padding: '16px' }}>Name</th>
                            <th style={{ padding: '16px' }}>Type</th>
                            <th style={{ padding: '16px' }}>Uploaded</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map(doc => (
                            <tr key={doc.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                <td style={{ padding: '16px' }}>{doc.title}</td>
                                <td style={{ padding: '16px' }}><span className="badge">{doc.type}</span></td>
                                <td style={{ padding: '16px' }}>{doc.date}</td>
                                <td style={{ padding: '16px' }}>
                                    <button style={{ color: 'red' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
