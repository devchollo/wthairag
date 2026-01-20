'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, MessageSquare, Bell, Settings, Lock } from 'lucide-react';

const navItems = [
    { name: 'Dashboard', href: '/workspace/dashboard', icon: LayoutDashboard },
    { name: 'Knowledge Base', href: '/workspace/knowledge', icon: BookOpen },
    { name: 'AI RAG Chat', href: '/workspace/chat', icon: MessageSquare },
    { name: 'Alerts', href: '/workspace/alerts', icon: Bell },
    { name: 'Settings', href: '/workspace/settings', icon: Settings },
];

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    const { currentWorkspace, workspaces, setCurrentWorkspace } = useAuth();

    return (
        <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row">
            <aside className="w-full border-b border-border-light bg-surface-light p-6 lg:w-[280px] lg:border-b-0 lg:border-r dark:border-border-dark dark:bg-surface-dark">
                <div className="mb-10">
                    <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-text-muted">
                        Current Workspace
                    </label>
                    <select
                        value={currentWorkspace?.slug}
                        onChange={(e) => setCurrentWorkspace(workspaces.find(w => w.slug === e.target.value) || null)}
                        className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark"
                    >
                        {workspaces.map(w => (
                            <option key={w.slug} value={w.slug}>{w.name}</option>
                        ))}
                    </select>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="group flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-white hover:text-text-primary dark:hover:bg-background-dark dark:hover:text-text-dark"
                        >
                            <item.icon className="h-5 w-5 text-text-muted group-hover:text-primary" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            <main className="flex-1 bg-white p-6 lg:p-12 dark:bg-background-dark">
                <div className="mx-auto max-w-5xl">
                    {children}
                </div>
            </main>
        </div>
    );
}

