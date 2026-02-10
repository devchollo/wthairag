'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Plus, Play, Edit, Trash2, Box } from 'lucide-react';
import PageLoader from '@/components/PageLoader';
import { useRouter } from 'next/navigation';

interface App {
    _id: string;
    name: string;
    status: 'draft' | 'published';
    tag: 'generator' | 'form';
    layout: {
        header: {
            logoUrl?: string;
        };
    };
}

export default function WorkspaceAppsPage({ params }: { params: { workspaceId: string } }) {
    const { user, memberships } = useAuth();
    const [apps, setApps] = useState<App[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [error, setError] = useState('');

    const membership = memberships.find(m => m.workspaceId.toString() === params.workspaceId);
    const isAdmin = membership && ['owner', 'admin'].includes(membership.role);

    useEffect(() => {
        fetchApps();
    }, [params.workspaceId]);

    const fetchApps = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspaces/${params.workspaceId}/apps`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Failed to fetch apps');

            const data = await res.json();
            setApps(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApp = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspaces/${params.workspaceId}/apps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: 'Untitled App' }),
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Failed to create app');

            const data = await res.json();
            router.push(`/workspace/${params.workspaceId}/apps/${data.data._id}/builder`);
        } catch (err: any) {
            alert('Failed to create app: ' + err.message);
        }
    };

    if (loading) return <PageLoader />;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-text-primary tracking-tight">Workspace Apps</h1>
                    <p className="text-text-muted font-medium mt-1">Manage and run your custom tools.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleCreateApp}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Create App
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
                    {error}
                </div>
            )}

            {apps.length === 0 ? (
                <div className="text-center py-20 bg-surface-light rounded-xl border-2 border-dashed border-border-light">
                    <Box className="mx-auto h-12 w-12 text-text-muted opacity-50 mb-4" />
                    <h3 className="text-lg font-bold text-text-primary">No apps yet</h3>
                    <p className="text-text-muted mt-2">
                        {isAdmin ? 'Get started by creating your first app.' : 'Ask an admin to publish some apps.'}
                    </p>
                    {isAdmin && (
                        <button
                            onClick={handleCreateApp}
                            className="mt-6 text-blue-600 font-bold hover:underline"
                        >
                            Create one now &rarr;
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map(app => (
                        <div key={app._id} className="card hover:shadow-lg transition-shadow duration-200 group relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100">
                                        {app.layout.header.logoUrl ? (
                                            <img src={app.layout.header.logoUrl} alt={app.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <Box className="text-blue-600 h-6 w-6" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-primary text-lg leading-tight">{app.name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                                app.tag === 'generator' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                                {app.tag}
                                            </span>
                                            {app.status === 'draft' && (
                                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                                    Draft
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-light">
                                <Link
                                    href={`/workspace/${params.workspaceId}/apps/${app._id}`}
                                    className="flex-1 btn-secondary text-center justify-center flex items-center gap-2 text-sm"
                                >
                                    <Play size={14} />
                                    Run
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href={`/workspace/${params.workspaceId}/apps/${app._id}/builder`}
                                        className="btn-secondary px-3 text-text-muted hover:text-blue-600"
                                        title="Edit Builder"
                                    >
                                        <Edit size={14} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
