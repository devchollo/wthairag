'use client';

import { useState } from 'react';
import styles from '../dns/tool-detail.module.css';

export default function PasswordGenerator() {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);

    const handleGenerate = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let pass = '';
        for (let i = 0; i < length; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(pass);
    };

    return (
        <div className="container section-padding">
            <div className="glass tool-container">
                <h1>Password Generator</h1>
                <div className={styles.inputGroup}>
                    <input
                        type="number"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className={styles.input}
                        min="8"
                        max="64"
                    />
                    <button onClick={handleGenerate} className="btn-primary">
                        Generate
                    </button>
                </div>

                {password && (
                    <div className={styles.results}>
                        <div className={styles.records}>
                            <h2 style={{ letterSpacing: '0.1em' }}>{password}</h2>
                        </div>
                        <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(password)}>
                            Copy to Clipboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
