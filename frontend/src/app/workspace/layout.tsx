'use client';

import { useAuth } from '@/context/AuthContext';
import styles from './workspace.module.css';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    const { currentWorkspace, workspaces, setCurrentWorkspace } = useAuth();

    return (
        <div className={styles.workspaceLayout}>
            <aside className={`${styles.sidebar} glass`}>
                <div className={styles.sidebarHeader}>
                    <select
                        value={currentWorkspace?.slug}
                        onChange={(e) => setCurrentWorkspace(workspaces.find(w => w.slug === e.target.value) || null)}
                        className={styles.tenantSelector}
                    >
                        {workspaces.map(w => (
                            <option key={w.slug} value={w.slug}>{w.name}</option>
                        ))}
                    </select>
                </div>
                <nav className={styles.sideNav}>
                    <a href="/workspace/dashboard">Dashboard</a>
                    <a href="/workspace/knowledge">Knowledge Base</a>
                    <a href="/workspace/chat">AI RAG Chat</a>
                    <a href="/workspace/alerts">Alerts</a>
                    <a href="/workspace/settings">Settings</a>
                </nav>
            </aside>
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}
