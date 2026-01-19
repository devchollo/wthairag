'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './auth.module.css';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [orgName, setOrgName] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // In production, call backend /api/auth/login or /api/auth/register
        const mockData = {
            user: { name: name || 'User', email },
            token: 'mock-token',
            memberships: [{ workspaceId: { name: orgName || 'My Workspace', slug: 'my-workspace' } }]
        };
        login(mockData);
        window.location.href = '/workspace/my-workspace';
    };

    return (
        <div className="container section-padding">
            <div className={`${styles.authCard} glass`}>
                <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                <p>{isLogin ? 'Login to access your workspace.' : 'Start your private AI workspace today.'}</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isLogin && (
                        <>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Organization Name"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                required
                            />
                        </>
                    )}
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-primary">
                        {isLogin ? 'Login' : 'Create Workspace'}
                    </button>
                </form>

                <button className={styles.toggle} onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                </button>
            </div>
        </div>
    );
}
