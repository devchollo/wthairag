'use client';

import { useState } from 'react';
import { Settings, Shield, Bell, Palette, Globe, Save, Trash2, AlertTriangle, Terminal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
    const { currentWorkspace } = useAuth();
    const [name, setName] = useState(currentWorkspace?.name || '');
    const [theme, setTheme] = useState('system');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        // Sync with REAL endpoint later
        setTimeout(() => setLoading(false), 800);
    };

    return (
        <div className="mx-auto max-w-[800px] space-y-12 pb-20">
            <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                    <Terminal className="h-3.5 w-3.5" /> Workspace / Governance Control
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-text-primary">Workspace Protocol.</h1>
                <p className="mt-2 text-sm font-bold text-text-secondary">
                    Manage organization identity, security parameters, and interface themes.
                </p>
            </div>

            <div className="space-y-6">
                {/* General Settings */}
                <div className="card border-2 border-border-light p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Settings className="h-5 w-5 text-blue-600" />
                        <h3 className="font-black text-lg tracking-tight">General Identity</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Workspace Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-11 bg-surface-light border-2 border-border-light rounded-xl px-4 text-sm font-bold outline-none focus:border-blue-600 transition-all font-mono"
                                placeholder="Organization Name"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Interface Theme</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['light', 'dark', 'system'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        className={`h-11 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${theme === t ? 'bg-blue-600 border-blue-600 text-white' : 'bg-surface-light border-border-light text-text-muted hover:border-blue-600/30'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="card border-2 border-border-light p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Shield className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-black text-lg tracking-tight">Security & Governance</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-light border border-border-light">
                            <div>
                                <div className="text-sm font-black text-text-primary">Multi-Tenant Isolation</div>
                                <div className="text-[10px] font-bold text-text-muted uppercase">Active System Override</div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <p className="text-[11px] font-bold text-text-muted px-2">
                            All data in this workspace is strictly isolated from other tenants using logical row-level security.
                        </p>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="card border-2 border-red-100 bg-red-50/30 p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <h3 className="font-black text-lg tracking-tight text-red-600">Danger Zone</h3>
                    </div>

                    <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg border-2 border-red-600 transition-all">
                        <Trash2 className="h-4 w-4" /> Terminate Workspace
                    </button>
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn-primary h-12 px-8 gap-2 min-w-[160px]"
                >
                    {loading ? 'Processing...' : <><Save className="h-4 w-4" /> Save Protocol</>}
                </button>
            </div>
        </div>
    );
}
