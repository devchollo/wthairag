'use client';

import { useState, useRef } from 'react';
import { IApp, IAppBackground } from '@/types/app';
import { useRouter } from 'next/navigation';
import {
    ImageIcon,
    Upload,
    Trash2,
    Sparkles,
    Globe,
    Monitor,
    FileText,
    Zap,
    Palette,
    Settings,
    ChevronDown,
    ChevronRight,
    AlertTriangle
} from 'lucide-react';

interface AppSettingsPanelProps {
    app: IApp;
    workspaceId: string;
    onUpdate: (updates: Partial<IApp>) => void;
    onSave: () => void;
    saving: boolean;
}

export function AppSettingsPanel({ app, workspaceId, onUpdate, onSave, saving }: AppSettingsPanelProps) {
    const router = useRouter();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        general: true,
        appearance: true,
        behavior: false,
        danger: false,
    });
    const [logoUploading, setLogoUploading] = useState(false);
    const [bgUploading, setBgUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const toggleSection = (key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // --- Logo Upload ---
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLogoUploading(true);
        try {
            const urlRes = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/apps/${app._id}/logo/upload-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentType: file.type }),
                credentials: 'include'
            });
            if (!urlRes.ok) throw new Error('Failed to get upload URL');
            const { data: urlData } = await urlRes.json();

            await fetch(urlData.uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file
            });

            const confirmRes = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/apps/${app._id}/logo/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logoUrl: urlData.publicUrl, logoKey: urlData.key }),
                credentials: 'include'
            });
            if (!confirmRes.ok) throw new Error('Failed to confirm logo');

            const { data: updatedApp } = await confirmRes.json();
            onUpdate({ layout: updatedApp.layout });
        } catch (err) {
            console.error('Logo upload error:', err);
            alert('Failed to upload logo');
        } finally {
            setLogoUploading(false);
            if (logoInputRef.current) logoInputRef.current.value = '';
        }
    };

    const handleDeleteLogo = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/apps/${app._id}/logo`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to delete logo');
            const { data: updatedApp } = await res.json();
            onUpdate({ layout: updatedApp.layout });
        } catch (err) {
            alert('Failed to remove logo');
        }
    };

    // --- Background Image Upload (presigned URL flow) ---
    const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBgUploading(true);
        try {
            // 1. Get presigned URL
            const urlRes = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/apps/${app._id}/background/upload-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentType: file.type }),
                credentials: 'include'
            });
            if (!urlRes.ok) throw new Error('Failed to get upload URL');
            const { data: urlData } = await urlRes.json();

            // 2. Upload to S3/B2
            await fetch(urlData.uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file
            });

            // 3. Confirm background
            const confirmRes = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/apps/${app._id}/background/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'image',
                    value: urlData.publicUrl,
                    imageKey: urlData.key
                }),
                credentials: 'include'
            });
            if (!confirmRes.ok) throw new Error('Failed to confirm background');

            const { data: updatedApp } = await confirmRes.json();
            onUpdate({ layout: updatedApp.layout });
        } catch (err) {
            console.error('Background upload error:', err);
            alert('Failed to upload background image');
        } finally {
            setBgUploading(false);
            if (bgInputRef.current) bgInputRef.current.value = '';
        }
    };

    const handleBgChange = async (type: IAppBackground['type'], value: string) => {
        try {
            const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/apps/${app._id}/background`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, value }),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to update background');

            const { data: updatedApp } = await res.json();
            onUpdate({ layout: updatedApp.layout });
        } catch (err) {
            alert('Failed to update background');
        }
    };

    // --- Delete App ---
    const handleDeleteApp = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/apps/${app._id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to delete app');
            router.push(`/workspace/${workspaceId}/apps`);
        } catch (err) {
            alert('Failed to delete app');
            setDeleting(false);
        }
    };

    const bg = app.layout?.background || { type: 'solid' as const, value: '#ffffff' };

    const SectionHeader = ({ id, title, icon: Icon, danger }: { id: string; title: string; icon: React.ElementType; danger?: boolean }) => (
        <button
            onClick={() => toggleSection(id)}
            className={`w-full flex items-center justify-between py-3 px-1 text-sm font-bold transition-colors ${
                danger ? 'text-red-600 hover:text-red-700' : 'text-text-primary hover:text-blue-600'
            }`}
        >
            <span className="flex items-center gap-2">
                <Icon size={14} className={danger ? 'text-red-400' : 'text-text-muted'} />
                {title}
            </span>
            {expandedSections[id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
    );

    return (
        <div className="space-y-1">
            {/* GENERAL */}
            <SectionHeader id="general" title="General" icon={Settings} />
            {expandedSections.general && (
                <div className="space-y-4 pb-4 border-b border-border-light">
                    <div>
                        <label className="text-xs font-bold block mb-1 text-text-primary">App Name</label>
                        <input
                            type="text"
                            className="w-full border border-border-light rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            value={app.name}
                            onChange={(e) => onUpdate({ name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1 text-text-primary">Description</label>
                        <textarea
                            className="w-full border border-border-light rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all h-20 resize-none"
                            value={app.description || ''}
                            onChange={(e) => onUpdate({ description: e.target.value })}
                            placeholder="Brief description of this app..."
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1.5 text-text-primary">App Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['generator', 'form'] as const).map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => onUpdate({ tag })}
                                    className={`p-3 rounded-lg border-2 text-xs font-bold text-center transition-all ${
                                        app.tag === tag
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-border-light text-text-muted hover:border-gray-300'
                                    }`}
                                >
                                    {tag === 'generator' ? <><Zap size={14} className="mx-auto mb-1" />Generator</> : <><FileText size={14} className="mx-auto mb-1" />Form</>}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold block mb-1.5 text-text-primary">Status</label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onUpdate({ status: app.status === 'published' ? 'draft' : 'published' })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    app.status === 'published' ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                                    app.status === 'published' ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                            <span className={`text-xs font-bold uppercase ${app.status === 'published' ? 'text-green-600' : 'text-text-muted'}`}>
                                {app.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* APPEARANCE */}
            <SectionHeader id="appearance" title="Appearance" icon={Palette} />
            {expandedSections.appearance && (
                <div className="space-y-4 pb-4 border-b border-border-light">
                    {/* Logo */}
                    <div>
                        <label className="text-xs font-bold block mb-2 text-text-primary">Logo</label>
                        {app.layout?.header?.logoUrl ? (
                            <div className="flex items-center gap-3">
                                <div className="h-14 w-14 rounded-lg border border-border-light overflow-hidden bg-surface-light">
                                    <img src={app.layout.header.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <button
                                    onClick={handleDeleteLogo}
                                    className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
                                >
                                    <Trash2 size={12} /> Remove
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => logoInputRef.current?.click()}
                                disabled={logoUploading}
                                className="w-full p-4 border-2 border-dashed border-border-light rounded-lg text-center text-text-muted hover:border-blue-300 hover:text-blue-600 transition-all text-xs font-bold"
                            >
                                {logoUploading ? 'Uploading...' : <><Upload size={16} className="mx-auto mb-1" />Upload Logo</>}
                            </button>
                        )}
                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </div>

                    {/* Subtitle */}
                    <div>
                        <label className="text-xs font-bold block mb-1 text-text-primary">Subtitle</label>
                        <input
                            type="text"
                            className="w-full border border-border-light rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                            value={app.layout?.header?.subtitle || ''}
                            onChange={(e) => onUpdate({
                                layout: {
                                    ...app.layout,
                                    header: { ...app.layout?.header, subtitle: e.target.value }
                                }
                            })}
                            placeholder="Optional app subtitle"
                        />
                    </div>

                    {/* Background (only for new_tab) */}
                    {app.launchMode === 'new_tab' && (
                        <div>
                            <label className="text-xs font-bold block mb-2 text-text-primary">Background</label>
                            <div className="grid grid-cols-3 gap-1.5 mb-3">
                                {(['solid', 'gradient', 'image'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => {
                                            if (t === 'solid') handleBgChange('solid', bg.value || '#ffffff');
                                            else if (t === 'gradient') handleBgChange('gradient', bg.value || 'linear-gradient(135deg, #667eea, #764ba2)');
                                        }}
                                        className={`p-2 rounded text-[10px] font-bold uppercase text-center transition-all ${
                                            bg.type === t
                                                ? 'bg-blue-50 text-blue-700 border border-blue-300'
                                                : 'bg-surface-light text-text-muted border border-transparent hover:border-border-light'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {bg.type === 'solid' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={bg.value || '#ffffff'}
                                        onChange={(e) => handleBgChange('solid', e.target.value)}
                                        className="w-10 h-10 rounded border border-border-light cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={bg.value || '#ffffff'}
                                        onChange={(e) => handleBgChange('solid', e.target.value)}
                                        className="flex-1 border border-border-light rounded-lg p-2 text-xs font-mono"
                                        placeholder="#ffffff"
                                    />
                                </div>
                            )}

                            {bg.type === 'gradient' && (
                                <input
                                    type="text"
                                    value={bg.value || ''}
                                    onChange={(e) => handleBgChange('gradient', e.target.value)}
                                    className="w-full border border-border-light rounded-lg p-2 text-xs font-mono"
                                    placeholder="linear-gradient(135deg, #667eea, #764ba2)"
                                />
                            )}

                            {bg.type === 'image' && (
                                <div>
                                    {bg.value && bg.value.startsWith('http') ? (
                                        <div className="relative">
                                            <img src={bg.value} alt="Background" className="w-full h-24 object-cover rounded-lg border border-border-light" />
                                            <button
                                                onClick={() => bgInputRef.current?.click()}
                                                className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center text-white text-xs font-bold opacity-0 hover:opacity-100 transition-opacity"
                                            >
                                                Replace
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => bgInputRef.current?.click()}
                                            disabled={bgUploading}
                                            className="w-full p-4 border-2 border-dashed border-border-light rounded-lg text-center text-text-muted hover:border-blue-300 transition-all text-xs font-bold"
                                        >
                                            {bgUploading ? 'Uploading...' : <><ImageIcon size={16} className="mx-auto mb-1" />Upload Image</>}
                                        </button>
                                    )}
                                    <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBgImageUpload} />
                                </div>
                            )}

                            {/* Preview */}
                            <div
                                className="mt-3 h-16 rounded-lg border border-border-light overflow-hidden"
                                style={{
                                    background: bg.type === 'image' && bg.value?.startsWith('http')
                                        ? `url(${bg.value}) center/cover`
                                        : bg.type === 'gradient'
                                            ? bg.value
                                            : bg.value || '#ffffff'
                                }}
                            >
                                <div className="h-full flex items-center justify-center text-[10px] font-bold text-text-muted/40">
                                    Preview
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* BEHAVIOR */}
            <SectionHeader id="behavior" title="Behavior" icon={Zap} />
            {expandedSections.behavior && (
                <div className="space-y-4 pb-4 border-b border-border-light">
                    <div>
                        <label className="text-xs font-bold block mb-1.5 text-text-primary">Launch Mode</label>
                        <div className="grid grid-cols-2 gap-2">
                            {([
                                { value: 'modal' as const, label: 'In Workspace', icon: Monitor },
                                { value: 'new_tab' as const, label: 'New Tab', icon: Globe },
                            ]).map(mode => (
                                <button
                                    key={mode.value}
                                    onClick={() => onUpdate({ launchMode: mode.value })}
                                    className={`p-3 rounded-lg border-2 text-xs font-bold text-center transition-all ${
                                        app.launchMode === mode.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-border-light text-text-muted hover:border-gray-300'
                                    }`}
                                >
                                    <mode.icon size={14} className="mx-auto mb-1" />
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {app.tag === 'generator' && (
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none mb-1">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                    checked={app.allowAiImprove || false}
                                    onChange={(e) => onUpdate({ allowAiImprove: e.target.checked })}
                                />
                                <span className="font-bold text-purple-800 flex items-center gap-1">
                                    <Sparkles size={12} /> AI Auto-Improve
                                </span>
                            </label>
                            <p className="text-[10px] text-purple-700 leading-tight">
                                When enabled, AI will automatically refine and improve the generated output for better quality.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* DANGER ZONE */}
            <SectionHeader id="danger" title="Danger Zone" icon={AlertTriangle} danger />
            {expandedSections.danger && (
                <div className="space-y-3 pb-4">
                    <p className="text-xs text-text-muted">Permanently delete this app and all its data. This action cannot be undone.</p>
                    {!confirmDelete ? (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="w-full p-3 rounded-lg border-2 border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 size={14} /> Delete App
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-red-600">Are you sure? This is irreversible.</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDeleteApp}
                                    disabled={deleting}
                                    className="flex-1 p-2.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all"
                                >
                                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="flex-1 p-2.5 rounded-lg border border-border-light text-text-muted text-xs font-bold hover:bg-surface-light transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
