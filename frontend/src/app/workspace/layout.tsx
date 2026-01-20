'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, MessageSquare, Bell, Settings, Lock, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navItems = [
    { name: 'Dashboard', href: '/workspace/dashboard', icon: LayoutDashboard },
    { name: 'Knowledge Base', href: '/workspace/knowledge', icon: BookOpen },
    { name: 'AI RAG Chat', href: '/workspace/chat', icon: MessageSquare },
    { name: 'Alerts', href: '/workspace/alerts', icon: Bell },
    { name: 'Settings', href: '/workspace/settings', icon: Settings },
];

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    const { user, currentWorkspace, workspaces, setCurrentWorkspace, logout } = useAuth();
    const pathname = usePathname();

    // If no user, only show children (which might be the guest view) without the sidebar/tabs
    if (!user) {
        return <div className="min-h-[calc(100vh-64px)]">{children}</div>;
    }

    return (
        <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row">
            <aside className="w-full border-b border-border-light bg-surface-light p-6 lg:w-[280px] lg:border-b-0 lg:border-r dark:border-border-dark dark:bg-surface-dark">
                <div className="mb-10">
                    <label className="mb-2 block text-[13px] font-bold uppercase tracking-widest text-text-muted">
                        Organization
                    </label>
                    <select
                        value={currentWorkspace?.slug}
                        onChange={(e) => setCurrentWorkspace(workspaces.find(w => w.slug === e.target.value) || null)}
                        className="w-full rounded-lg border-2 border-border-light bg-white px-3 py-2 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 dark:border-border-dark dark:bg-background-dark dark:text-text-dark"
                    >
                        {workspaces.map(w => (
                            <option key={w.slug} value={w.slug}>{w.name}</option>
                        ))}
                    </select>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-bold transition-all ${isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-text-secondary hover:bg-white dark:hover:bg-background-dark hover:text-text-primary'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-primary'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-border-light pt-6 dark:border-border-dark lg:block hidden">
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-bold text-red-500 hover:bg-red-500/5 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Seal Vault (Logout)
                    </button>
                </div>
            </aside>

            <main className="flex-1 bg-background-light p-6 lg:p-12 dark:bg-background-dark">
                <div className="mx-auto max-w-5xl animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
