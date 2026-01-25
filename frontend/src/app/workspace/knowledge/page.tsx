'use client';

import { useState, useEffect, useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FileText, Trash2, Upload, Terminal, BookOpen, Clock, Activity, Search, Filter, Download, X, Lightbulb, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { KnowledgeSkeleton } from '@/components/Skeleton';

interface Document {
    _id: string;
    title: string;
    mimeType: string;
    createdAt: string;
    updatedAt?: string;
    size?: string;
    content?: string;
    fileKey?: string;
    createdBy?: { name?: string; email?: string };
    updatedBy?: { name?: string; email?: string };
}

const font = Quill.import('formats/font') as { whitelist: string[] };
font.whitelist = ['inter', 'serif', 'monospace'];
Quill.register(font, true);

const size = Quill.import('formats/size') as { whitelist: Array<string | false> };
size.whitelist = ['small', false, 'large', 'huge'];
Quill.register(size, true);

export default function KnowledgeBase() {
    const { currentWorkspace, userRole } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [showManualForm, setShowManualForm] = useState(false);
    const [manualTitle, setManualTitle] = useState('');
    const [manualContent, setManualContent] = useState('');
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showTip, setShowTip] = useState(true);
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    const quillModules = useMemo(
        () => ({
            toolbar: [
                [{ font: [] }, { size: [] }],
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ script: 'sub' }, { script: 'super' }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ indent: '-1' }, { indent: '+1' }],
                [{ align: [] }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                ['clean']
            ]
        }),
        []
    );

    const quillFormats = [
        'font',
        'size',
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'color',
        'background',
        'script',
        'list',
        'bullet',
        'indent',
        'align',
        'blockquote',
        'code-block',
        'link',
        'image'
    ];

    const stripHtml = (value: string) =>
        value.replace(/<(.|\n)*?>/g, '').replace(/&nbsp;/g, ' ').trim();

    const isManualContentEmpty = stripHtml(manualContent).length === 0;
    const isEditContentEmpty = stripHtml(editContent).length === 0;

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

        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit');
            return;
        }

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
            else {
                const data = await res.json();
                alert(data.message || 'Upload failed');
            }
        } catch (e) {
            console.error("Upload failed", e);
        } finally {
            setUploading(false);
        }
    };

    const handleManualSubmit = async () => {
        if (!manualTitle || isManualContentEmpty || !currentWorkspace?._id || !isAdmin) return;

        setUploading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspace-data/knowledge/manual`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-workspace-id': currentWorkspace._id,
                    'x-workspace-slug': currentWorkspace.slug || ''
                },
                body: JSON.stringify({ title: manualTitle, content: manualContent }),
                credentials: 'include'
            });
            if (res.ok) {
                fetchDocuments();
                setManualTitle('');
                setManualContent('');
                setShowManualForm(false);
            }
        } catch (e) {
            console.error("Manual creation failed", e);
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (id: string, title: string) => {
        if (!currentWorkspace?._id) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspace-data/knowledge/${id}/download`, {
                headers: {
                    'x-workspace-id': currentWorkspace._id,
                    'x-workspace-slug': currentWorkspace.slug || ''
                },
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok && data.data.url) {
                const link = document.createElement('a');
                link.href = data.data.url;
                link.setAttribute('download', title);
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                document.body.appendChild(link);
                link.click();
                link.remove();
                await recordKnowledgeView(id);
            } else {
                alert(data.message || 'Download failed');
            }
        } catch (e) {
            console.error("Download failed", e);
        }
    };

    const recordKnowledgeView = async (id: string) => {
        if (!currentWorkspace?._id) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await fetch(`${apiUrl}/api/workspace-data/knowledge/${id}/view`, {
                method: 'POST',
                headers: {
                    'x-workspace-id': currentWorkspace._id,
                    'x-workspace-slug': currentWorkspace.slug || ''
                },
                credentials: 'include'
            });
        } catch (e) {
            console.error('Failed to record knowledge view', e);
        }
    };

    const handleView = (doc: Document) => {
        setSelectedDoc(doc);
        setIsModalOpen(true);
        recordKnowledgeView(doc._id);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDoc(null);
    };

    const handleEditOpen = (doc: Document) => {
        setEditingDoc(doc);
        setEditTitle(doc.title);
        setEditContent(doc.content || '');
    };

    const handleEditClose = () => {
        setEditingDoc(null);
        setEditTitle('');
        setEditContent('');
    };

    const handleEditSubmit = async () => {
        if (!editingDoc || !currentWorkspace?._id || !isAdmin) return;
        if (!editTitle || isEditContentEmpty) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspace-data/knowledge/${editingDoc._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-workspace-id': currentWorkspace._id,
                    'x-workspace-slug': currentWorkspace.slug || ''
                },
                body: JSON.stringify({ title: editTitle, content: editContent }),
                credentials: 'include'
            });
            if (res.ok) {
                await fetchDocuments();
                handleEditClose();
            }
        } catch (e) {
            console.error("Update failed", e);
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

    const formatUser = (user?: { name?: string; email?: string }) => user?.name || user?.email || 'Unknown';

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
                    <h1 className="text-3xl font-black tracking-tighter text-text-primary">Knowledge Base.</h1>
                </div>
                {isAdmin && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowManualForm(!showManualForm)}
                            className="bg-surface-light text-text-primary border-2 border-border-light rounded-xl h-10 px-4 font-mono text-[10px] font-black uppercase tracking-widest hover:border-blue-600/30 transition-all"
                        >
                            {showManualForm ? 'Cancel Entry' : 'Manual Entry'}
                        </button>
                        <button
                            onClick={() => setShowTip((prev) => !prev)}
                            className="bg-surface-light text-text-primary border-2 border-border-light rounded-xl h-10 px-4 font-mono text-[10px] font-black uppercase tracking-widest hover:border-blue-600/30 transition-all flex items-center gap-2"
                        >
                            <Lightbulb className="h-3.5 w-3.5" />
                            {showTip ? 'Hide Tips' : 'Tip'}
                        </button>
                        <label className="btn-primary gap-2 h-10 px-4 cursor-pointer">
                            <Upload className="h-4 w-4" />
                            {uploading ? 'Processing...' : 'Upload Data'}
                            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                        </label>
                    </div>
                )}
            </div>

            {isAdmin && (
                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-center justify-between">
                    <span>Accepted Formats: PDF, TXT, DOCX, CSV</span>
                    <span>Max Size: 10MB</span>
                </div>
            )}

            {isAdmin && (showManualForm || showTip) && (
                <div
                    className={`grid gap-6 ${showManualForm && showTip ? 'lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]' : 'grid-cols-1'}`}
                >
                    {showManualForm && (
                        <div className="card p-6 bg-white border-2 border-blue-600/20">
                            <h3 className="text-sm font-black text-text-primary mb-4 flex items-center gap-2 uppercase tracking-tight">
                                <Activity className="h-4 w-4 text-blue-600" /> New Knowledge Record
                            </h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Record Title (e.g. Infrastructure Handbook)"
                                    value={manualTitle}
                                    onChange={(e) => setManualTitle(e.target.value)}
                                    className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl px-4 text-xs font-bold outline-none focus:border-blue-600 transition-all"
                                />
                                <div className="rounded-xl border-2 border-border-light bg-surface-light overflow-hidden focus-within:border-blue-600 transition-all">
                                    <ReactQuill
                                        theme="snow"
                                        value={manualContent}
                                        onChange={setManualContent}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder="Enter the full text content here for AI indexing..."
                                        className="text-xs font-bold text-text-primary"
                                    />
                                </div>
                                <button
                                    onClick={handleManualSubmit}
                                    disabled={!manualTitle || isManualContentEmpty || uploading}
                                    className="btn-primary w-full h-11"
                                >
                                    {uploading ? 'Vaulting...' : 'Vault Record'}
                                </button>
                            </div>
                        </div>
                    )}
                    {showTip && (
                        <div className="card p-6 bg-white border-2 border-blue-600/10">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3">
                                <Lightbulb className="h-3.5 w-3.5" />
                                Writing Tips
                            </div>
                            <h3 className="text-base font-black text-text-primary mb-3">
                                Write Records So AI Can Reason, Not Guess
                            </h3>
                            <p className="text-xs font-bold text-text-secondary mb-3">
                                When adding records, aim for complete context:
                            </p>
                            <ul className="text-xs font-bold text-text-secondary space-y-2 mb-4">
                                <li>What is this about? Be specific.</li>
                                <li>Why does it exist or matter?</li>
                                <li>Who is involved or affected?</li>
                                <li>When does it apply? (date, version, timeframe)</li>
                                <li>How does it work or get used?</li>
                                <li>Edge cases / exceptions, if any</li>
                            </ul>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">
                                Clear structure → better answers.
                            </p>
                            <div className="rounded-lg bg-blue-50/70 border border-blue-100 px-3 py-2 text-[11px] font-bold text-blue-700 leading-relaxed">
                                Tip: Records with clear what, why, who, when, and how produce more accurate AI answers. Vague notes = vague results.
                            </div>
                        </div>
                    )}
                </div>
            )}

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
                                    <span className="h-1 w-1 rounded-full bg-border-light"></span>
                                    <span>Added by {formatUser(doc.createdBy)}</span>
                                    <span className="h-1 w-1 rounded-full bg-border-light"></span>
                                    <span>Edited by {formatUser(doc.updatedBy)}</span>
                                    {doc.updatedAt && (
                                        <>
                                            <span className="h-1 w-1 rounded-full bg-border-light"></span>
                                            <span>Modified {new Date(doc.updatedAt).toLocaleDateString()}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isAdmin && !doc.fileKey && (
                                <button
                                    onClick={() => handleEditOpen(doc)}
                                    className="h-9 w-9 flex items-center justify-center rounded-lg text-text-muted hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    title="Edit Record"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                            )}
                            {doc.fileKey ? (
                                <button
                                    onClick={() => handleDownload(doc._id, doc.title)}
                                    className="h-9 w-9 flex items-center justify-center rounded-lg text-text-muted hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    title="Download File"
                                >
                                    <Download className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleView(doc)}
                                    className="h-9 w-9 flex items-center justify-center rounded-lg text-text-muted hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    title="View Record"
                                >
                                    <BookOpen className="h-4 w-4" />
                                </button>
                            )}
                            {isAdmin && (
                                <button
                                    onClick={() => handleDelete(doc._id)}
                                    className="h-9 w-9 flex items-center justify-center rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Delete Record"
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
            {isModalOpen && selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-3xl rounded-2xl border border-border-light shadow-xl">
                        <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Manual Record</p>
                                <h2 className="text-lg font-black text-text-primary">{selectedDoc.title}</h2>
                            </div>
                            <button
                                onClick={closeModal}
                                className="h-9 w-9 flex items-center justify-center rounded-lg text-text-muted hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="px-6 py-5">
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {new Date(selectedDoc.createdAt).toLocaleString()}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">
                                Added by {formatUser(selectedDoc.createdBy)} · Edited by {formatUser(selectedDoc.updatedBy)}
                                {selectedDoc.updatedAt && ` · Modified ${new Date(selectedDoc.updatedAt).toLocaleString()}`}
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto pr-2">
                                {selectedDoc.content ? (
                                    <div
                                        className="ql-editor text-sm text-text-secondary leading-relaxed p-0"
                                        dangerouslySetInnerHTML={{ __html: selectedDoc.content }}
                                    />
                                ) : (
                                    <div className="text-sm text-text-secondary leading-relaxed">
                                        No content available for this record.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {editingDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-3xl rounded-2xl border border-border-light shadow-xl">
                        <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Edit Manual Record</p>
                                <h2 className="text-lg font-black text-text-primary">{editingDoc.title}</h2>
                            </div>
                            <button
                                onClick={handleEditClose}
                                className="h-9 w-9 flex items-center justify-center rounded-lg text-text-muted hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                aria-label="Close edit modal"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl px-4 text-xs font-bold outline-none focus:border-blue-600 transition-all"
                            />
                            <div className="rounded-xl border-2 border-border-light bg-surface-light overflow-hidden focus-within:border-blue-600 transition-all">
                                <ReactQuill
                                    theme="snow"
                                    value={editContent}
                                    onChange={setEditContent}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    className="text-xs font-bold text-text-primary"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 px-6 pb-6">
                            <button
                                onClick={handleEditClose}
                                className="btn-secondary h-9 px-4 text-[10px] font-black uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                className="btn-primary h-9 px-4 text-[10px] font-black uppercase tracking-widest"
                                disabled={!editTitle || isEditContentEmpty}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
