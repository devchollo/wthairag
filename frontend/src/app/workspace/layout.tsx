'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, MessageSquare, Bell, Settings, Lock, LogOut, Terminal, Activity } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navItems = [
    { name: 'Console', href: '/workspace/dashboard', icon: LayoutDashboard },
    { name: 'Knowledge', href: '/workspace/knowledge', icon: BookOpen },
    { name: 'RAG Context', href: '/workspace/chat', icon: MessageSquare },
    { name: 'Event Log', href: '/workspace/alerts', icon: Bell },
    { name: 'Core Settings', href: '/workspace/settings', icon: Settings },
];

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    const { user, currentWorkspace, workspaces, setCurrentWorkspace, logout } = useAuth();
    const pathname = usePathname();

    if (!user) {
        return <div className="min-h-[calc(100vh-64px)]">{children}</div>;
    }

    return (
        <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row bg-background-light">
            <aside className="w-full border-b border-border-light bg-white p-6 lg:w-[300px] lg:border-b-0 lg:border-r">
                <div className="mb-10 px-2">
                    <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">
                        Active Realm
                    </label>
                    <div className="relative group">
                        <select
                            value={currentWorkspace?.slug}
                            onChange={(e) => setCurrentWorkspace(workspaces.find(w => w.slug === e.target.value) || null)}
                            className="w-full appearance-none rounded-xl border-2 border-border-light bg-surface-light px-4 py-3 text-sm font-black text-text-primary outline-none focus:border-primary transition-all cursor-pointer"
                        >
                            {workspaces.map(w => (
                                <option key={w.slug} value={w.slug}>{w.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-primary transition-colors">
                            <Activity className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center gap-4 rounded-xl px-4 py-3 text-[14px] font-bold transition-all ${isActive
                                        ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                                        : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-primary'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-border-light pt-8 lg:block hidden">
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-[13px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        TERMINATE SESSION
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-6 lg:p-12">
                <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <div className="mb-12 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-muted">
                        <Terminal className="h-4 w-4" />
                        WorkToolsHub / Workspace / {navItems.find(i => i.href === pathname)?.name || 'Home'}
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
}
