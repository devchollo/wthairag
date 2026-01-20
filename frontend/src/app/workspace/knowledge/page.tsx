'use client';

import { useState, useEffect } from 'react';
import { FileText, Trash2, Upload, Terminal, BookOpen, Clock, Activity, Search, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { KnowledgeSkeleton } from '@/components/Skeleton';

interface Document {
    _id: string;
    title: string;
    mimeType: string;
    createdAt: string;
    size?: string;
}

export default function KnowledgeBase() {
    const { currentWorkspace, userRole } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const isAdmin = userRole === 'owner' || userRole === 'admin';

    const fetchDocuments = async () => {
        if (!currentWorkspace?._id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspace-data/knowledge`, {
                headers: {
                    'x-workspace-id': currentWorkspace._id,
                    'x-workspace-slug': currentWorkspace.slug || ''
                },
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setDocuments(data.data);
        } catch (e) {
            console.error("Failed to fetch documents", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [currentWorkspace?._id]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentWorkspace?._id || !isAdmin) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspace-data/knowledge`, {
                method: 'POST',
                headers: {
                    'x-workspace-id': currentWorkspace._id,
                    'x-workspace-slug': currentWorkspace.slug || ''
                },
                body: formData,
                credentials: 'include'
            });
            if (res.ok) fetchDocuments();
        } catch (e) {
            console.error("Upload failed", e);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!currentWorkspace?._id || !isAdmin) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspace-data/knowledge/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-workspace-id': currentWorkspace._id,
                    'x-workspace-slug': currentWorkspace.slug || ''
                },
                credentials: 'include'
            });
            if (res.ok) fetchDocuments();
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || doc.mimeType.includes(filter);
        return matchesSearch && matchesFilter;
    });

    if (loading && documents.length === 0) {
        return <KnowledgeSkeleton />;
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                        <Terminal className="h-3.5 w-3.5" /> Workspace / Data Storage
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-text-primary">Knowledge Vault.</h1>
                </div>
                {isAdmin && (
                    <label className="btn-primary gap-2 h-10 px-4 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload Context'}
                        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 bg-surface-light border-2 border-border-light rounded-xl pl-10 pr-4 text-xs font-bold outline-none focus:border-blue-600 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 bg-surface-light border-2 border-border-light rounded-xl px-3 h-10">
                    <Filter className="h-3.5 w-3.5 text-text-muted" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest text-text-primary outline-none cursor-pointer"
                    >
                        <option value="all">All Types</option>
                        <option value="pdf">PDF Docs</option>
                        <option value="text">Text Files</option>
                        <option value="image">Images</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredDocs.map((doc) => (
                    <div key={doc._id} className="card flex items-center justify-between hover:border-primary/30 transition-all p-5">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-text-primary mb-0.5">{doc.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(doc.createdAt).toLocaleDateString()}</span>
                                    <span className="h-1 w-1 rounded-full bg-border-light"></span>
                                    <span className="text-blue-600">{doc.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <button
                                    onClick={() => handleDelete(doc._id)}
                                    className="h-9 w-9 flex items-center justify-center rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    < Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredDocs.length === 0 && !loading && (
                <div className="mt-4 p-12 bg-surface-light rounded-xl border border-dashed border-border-light text-center">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                        {search || filter !== 'all' ? 'No records match your filters.' : 'Vault is empty. Index your documentation to begin.'}
                    </p>
                </div>
            )}
        </div>
    );
}
