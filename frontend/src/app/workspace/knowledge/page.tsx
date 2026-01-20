'use client';

import { useState } from 'react';
import { FileText, Trash2, Upload, Terminal, BookOpen, Clock } from 'lucide-react';

interface Document {
    id: string;
    title: string;
    type: string;
    date: string;
    size: string;
}

export default function KnowledgeBase() {
    const [documents] = useState<Document[]>([
        { id: '1', title: 'Product_Handover_v2.pdf', type: 'PDF', date: '2026-01-19', size: '2.4 MB' },
        { id: '2', title: 'Backend_Architecture.md', type: 'Markdown', date: '2026-01-18', size: '12 KB' },
        { id: '3', title: 'User_Personas.json', type: 'JSON', date: '2026-01-17', size: '45 KB' },
    ]);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                        <Terminal className="h-3.5 w-3.5" /> Workspace / Data Storage
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-text-primary">Knowledge Vault.</h1>
                </div>
                <button className="btn-primary gap-2 h-10 px-4">
                    <Upload className="h-4 w-4" /> Upload Context
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {documents.map((doc) => (
                    <div key={doc.id} className="card flex items-center justify-between hover:border-primary/30 transition-all p-5">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-text-primary mb-0.5">{doc.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {doc.date}</span>
                                    <span className="h-1 w-1 rounded-full bg-border-light"></span>
                                    <span>{doc.size}</span>
                                    <span className="h-1 w-1 rounded-full bg-border-light"></span>
                                    <span className="text-blue-600">{doc.type}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="h-9 w-9 flex items-center justify-center rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-6 bg-surface-light rounded-xl border border-dashed border-border-light text-center">
                <p className="text-xs font-bold text-text-secondary">Drag and drop technical specifications to index them into your private AI context.</p>
            </div>
        </div>
    );
}
