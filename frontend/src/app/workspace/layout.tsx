'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, MessageSquare, Bell, Settings, LogOut, Box } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import PageLoader from '@/components/PageLoader';

const navItems = [
    { name: 'Dashboard', href: '/workspace/dashboard', icon: LayoutDashboard, adminOnly: false },
    { name: 'Apps', href: '/workspace/apps', icon: Box, adminOnly: false, needsId: true },
    { name: 'Knowledge Base', href: '/workspace/knowledge', icon: BookOpen, adminOnly: false },
    { name: 'AI RAG Console', href: '/workspace/chat', icon: MessageSquare, adminOnly: false },
    { name: 'Alerts', href: '/workspace/alerts', icon: Bell, adminOnly: false },
    { name: 'Settings', href: '/workspace/settings', icon: Settings, adminOnly: false },
];

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    const { user, currentWorkspace, workspaces, setCurrentWorkspace, logout, loading, userRole } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isAdmin = userRole === 'owner' || userRole === 'admin';
    const filteredNav = navItems.filter(item => !item.adminOnly || isAdmin);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }

        // Redirect if on restricted page
        const currentItem = navItems.find(item => item.href === pathname);
        if (!loading && currentItem?.adminOnly && !isAdmin) {
            router.push('/workspace/chat');
        }
    }, [user, loading, router, pathname, isAdmin]);

    if (loading) {
        return (
            <PageLoader
                label="Loading workspace"
                hint="Syncing your latest resources..."
            />
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row bg-white animate-in fade-in duration-500">
            <aside className="w-full border-b border-border-light bg-surface-light p-4 lg:w-[260px] lg:border-b-0 lg:border-r">
                <div className="mb-8 px-2">
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                        Organization
                    </label>
                    <select
                        value={currentWorkspace?.slug}
                        onChange={(e) => setCurrentWorkspace(workspaces.find(w => w.slug === e.target.value) || null)}
                        className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-xs font-black text-text-primary outline-none focus:border-primary transition-all cursor-pointer"
                    >
                        {workspaces.map(w => (
                            <option key={w.slug} value={w.slug}>{w.name}</option>
                        ))}
                    </select>
                </div>

                <nav className="space-y-1">
                    {filteredNav.map((item) => {
                        let href = item.href;
                        if ((item as any).needsId && currentWorkspace) {
                            href = `/workspace/${currentWorkspace._id}/apps`;
                        }

                        const isActive = pathname === href || (href !== '/workspace/dashboard' && pathname.startsWith(href));
                        
                        return (
                            <Link
                                key={item.name}
                                href={href}
                                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-black transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-text-secondary hover:bg-white hover:text-text-primary border border-transparent hover:border-border-light'
                                    }`}
                            >
                                <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-blue-600'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-border-light pt-6 lg:block hidden">
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-6 lg:p-10 bg-white">
                <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-2 duration-400">
                    {children}
                </div>
            </main>
        </div>
    );
}
