'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors, 
    DragOverlay,
    DragStartEvent,
    DragEndEvent
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Save, ArrowLeft, Eye, Layers, Settings, Check } from 'lucide-react';
import Link from 'next/link';

import { IApp, IAppField, AppFieldType } from '@/types/app';
import { SidebarItem } from '@/components/apps/SidebarItem';
import { SortableField } from '@/components/apps/SortableField';
import { FieldInspector } from '@/components/apps/FieldInspector';
import { AppSettingsPanel } from '@/components/apps/AppSettingsPanel';

const withFormDefaults = (appData: IApp): IApp => ({
    ...appData,
    formSettings: {
        recipients: appData.formSettings?.recipients || [],
        cc: appData.formSettings?.cc || [],
        bcc: appData.formSettings?.bcc || [],
        subject: appData.formSettings?.subject || 'New Form Submission',
        anonymousSubmissions: appData.formSettings?.anonymousSubmissions || false,
        improveWithAi: appData.formSettings?.improveWithAi || false,
    }
});

export default function AppBuilderPage({ params }: { params: Promise<{ workspaceId: string; appId: string }> }) {
    const { workspaceId, appId } = use(params);
    const { user, memberships } = useAuth();
    const router = useRouter();
    const [app, setApp] = useState<IApp | null>(null);
    const [loading, setLoading] = useState(true);
    const [fields, setFields] = useState<IAppField[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [sidebarTab, setSidebarTab] = useState<'build' | 'settings'>('build');
    const [activeDragItem, setActiveDragItem] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [hasUnsaved, setHasUnsaved] = useState(false);
    const [bannerMessage, setBannerMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null);
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 2 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchApp = useCallback(async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/apps/${appId}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch app');
            const data = await res.json();
            setApp(withFormDefaults(data.data));
            
            let fetchedFields: IAppField[] = data.data.fields || [];
            const hasSubmit = fetchedFields.some((f: IAppField) => f.type === 'submit');
            if (!hasSubmit) {
                fetchedFields = [...fetchedFields, {
                    id: 'submit-btn',
                    type: 'submit',
                    submitText: 'Generate'
                }];
            }
            setFields(fetchedFields);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [workspaceId, appId]);

    useEffect(() => {
        fetchApp();
    }, [fetchApp]);

    // Save handler
    const handleSave = async () => {
        if (!app) return;
        setSaving(true);
        setSaveSuccess(false);
        try {
            const submitField = fields.find(f => f.type === 'submit');
            const otherFields = fields.filter(f => f.type !== 'submit');
            const finalFields = submitField 
                ? [...otherFields, submitField] 
                : [...otherFields, { id: 'submit-btn', type: 'submit' as AppFieldType, submitText: 'Submit' }];

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/apps/${appId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: app.name,
                    description: app.description,
                    status: app.status,
                    tag: app.tag,
                    launchMode: app.launchMode,
                    allowAiImprove: app.allowAiImprove,
                    formSettings: app.formSettings,
                    layout: app.layout,
                    fields: finalFields,
                }),
                credentials: 'include'
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to save');
            }

            setSaveSuccess(true);
            setHasUnsaved(false);
            setTimeout(() => setSaveSuccess(false), 2000);
            await fetchApp();
        } catch (err: any) {
            setBannerMessage({ type: 'error', text: `Error saving: ${err.message}` });
        } finally {
            setSaving(false);
        }
    };

    // App settings update (local state only)
    const handleAppUpdate = (updates: Partial<IApp>) => {
        if (!app) return;
        setApp({ ...app, ...updates });
        setHasUnsaved(true);
    };

    // Field management
    const addField = (type: AppFieldType) => {
        if (type === 'file' && app?.tag === 'generator') {
            setBannerMessage({ type: 'info', text: 'File upload fields are available only for Form apps.' });
            return;
        }

        const newField: IAppField = {
            id: `field-${Date.now()}`,
            type,
            label: type === 'message' ? '' : `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            required: false,
            isSecret: false,
            ...(type === 'message' ? { messageHtml: '<p>Enter instructions here...</p>' } : {}),
            ...((type === 'radio' || type === 'list') ? { options: [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }] } : {}),
            ...(type === 'file' ? { acceptedFileTypes: '.pdf,.png,.jpg,.jpeg,.doc,.docx' } : {}),
        };
        
        const submitIndex = fields.findIndex(f => f.type === 'submit');
        if (submitIndex === -1) {
            setFields([...fields, newField]);
        } else {
            const newFields = [...fields];
            newFields.splice(submitIndex, 0, newField);
            setFields(newFields);
        }
        setSelectedFieldId(newField.id);
        setHasUnsaved(true);
    };

    const updateField = (id: string, updates: Partial<IAppField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
        setHasUnsaved(true);
    };

    const deleteField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
        setHasUnsaved(true);
    };

    // Drag handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragItem(event.active.data.current);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        if (active.data.current?.type === 'sidebar-item') {
            addField(active.data.current.fieldType);
            return;
        }

        if (active.id !== over.id) {
            setFields((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                if (items[newIndex]?.type === 'submit' || items[oldIndex]?.type === 'submit') return items;
                return arrayMove(items, oldIndex, newIndex);
            });
            setHasUnsaved(true);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-surface-base">
            <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-sm text-text-muted font-bold">Loading builder...</p>
            </div>
        </div>
    );

    if (!app) return (
        <div className="h-screen flex items-center justify-center bg-surface-base">
            <div className="text-center text-red-500 font-bold">App not found</div>
        </div>
    );

    const selectedField = fields.find(f => f.id === selectedFieldId) || null;

    return (
        <div className="h-screen flex flex-col bg-surface-base">
            {/* Header */}
            <div className="h-14 border-b border-border-light bg-white flex items-center justify-between px-4 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Link href={`/workspace/${workspaceId}/apps`} className="text-text-muted hover:text-text-primary p-1.5 hover:bg-surface-light rounded-lg transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="border-l border-border-light pl-3">
                        <h1 className="font-black text-sm text-text-primary leading-tight">{app.name}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Beta v0.2</span>
                            <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full ${
                                app.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>{app.status}</span>
                            <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full ${
                                app.tag === 'generator' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>{app.tag}</span>
                            {hasUnsaved && <span className="text-[9px] text-amber-600 font-bold">● Unsaved</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            saveSuccess
                                ? 'bg-green-500 text-white'
                                : 'btn-primary'
                        }`}
                    >
                        {saveSuccess ? <><Check size={14} /> Saved!</> : saving ? 'Saving...' : <><Save size={14} /> Save</>}
                    </button>
                    <Link 
                        href={`/workspace/${workspaceId}/apps/${appId}`}
                        target="_blank"
                        className="btn-secondary flex items-center gap-1.5 px-3 py-2 text-xs font-bold"
                    >
                        <Eye size={14} /> Preview
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            {bannerMessage && (
                <div className={`mx-4 mt-3 inline-flex items-center self-start rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    bannerMessage.type === 'error'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                    {bannerMessage.text}
                </div>
            )}
            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar */}
                    <div className="w-64 bg-white border-r border-border-light flex flex-col">
                        {/* Tab Switcher */}
                        <div className="flex border-b border-border-light">
                            <button
                                onClick={() => setSidebarTab('build')}
                                className={`flex-1 py-3 text-xs font-black uppercase text-center transition-colors flex items-center justify-center gap-1.5 ${
                                    sidebarTab === 'build'
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                        : 'text-text-muted hover:text-text-primary'
                                }`}
                            >
                                <Layers size={13} /> Build
                            </button>
                            <button
                                onClick={() => setSidebarTab('settings')}
                                className={`flex-1 py-3 text-xs font-black uppercase text-center transition-colors flex items-center justify-center gap-1.5 ${
                                    sidebarTab === 'settings'
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                        : 'text-text-muted hover:text-text-primary'
                                }`}
                            >
                                <Settings size={13} /> Settings
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {sidebarTab === 'build' ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase text-text-muted tracking-wider mb-2">Form Elements</h3>
                                        <div className="flex flex-col gap-1.5">
                                            <SidebarItem type="text" label="Text Input" />
                                            <SidebarItem type="textarea" label="Text Area" />
                                            <SidebarItem type="email" label="Email" />
                                            <SidebarItem type="phone" label="Phone" />
                                            <SidebarItem type="number" label="Number" />
                                            <SidebarItem type="list" label="Dropdown List" />
                                            <SidebarItem type="date" label="Date Picker" />
                                            <SidebarItem
                                                type="file"
                                                label="File Upload"
                                                disabled={app.tag === 'generator'}
                                                disabledBadgeText={app.tag === 'generator' ? 'Form only' : undefined}
                                            />
                                            <SidebarItem type="checkbox" label="Checkbox" />
                                            <SidebarItem type="radio" label="Radio Group" />
                                            <SidebarItem type="message" label="Info Message" />
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-border-light">
                                        <p className="text-[10px] text-text-muted leading-relaxed">
                                            Drag elements to the canvas or click to add. Reorder by dragging within the canvas.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <AppSettingsPanel
                                    app={app}
                                    workspaceId={workspaceId}
                                    onUpdate={handleAppUpdate}
                                    onSave={handleSave}
                                    saving={saving}
                                />
                            )}
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 bg-surface-base p-6 overflow-y-auto" onClick={() => setSelectedFieldId(null)}>
                        <div className="max-w-2xl mx-auto">
                            {/* Canvas Header Preview */}
                            <div className="bg-white rounded-t-xl border border-b-0 border-border-light p-6 text-center">
                                {app.layout?.header?.logoUrl && (
                                    <img src={app.layout.header.logoUrl} alt="Logo" className="h-12 w-12 mx-auto mb-3 object-contain rounded-lg" />
                                )}
                                <h2 className="text-xl font-black text-text-primary">{app.name}</h2>
                                {app.layout?.header?.subtitle && (
                                    <p className="text-sm text-text-muted mt-1">{app.layout.header.subtitle}</p>
                                )}
                            </div>

                            {/* Canvas Body */}
                            <div className="bg-white min-h-[400px] border border-border-light p-6">
                                <SortableContext 
                                    items={fields.map(f => f.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {fields.map(f => (
                                        <SortableField 
                                            key={f.id} 
                                            field={f} 
                                            isSelected={selectedFieldId === f.id}
                                            onSelect={(id) => { setSelectedFieldId(id); }}
                                            onDelete={deleteField}
                                        />
                                    ))}
                                </SortableContext>
                                
                                {fields.length <= 1 && (
                                    <div className="text-center py-16 border-2 border-dashed border-border-light rounded-xl mb-4">
                                        <Layers className="mx-auto h-10 w-10 text-text-muted/30 mb-3" />
                                        <p className="text-text-muted text-sm font-bold">No fields yet</p>
                                        <p className="text-text-muted text-xs mt-1">Drag from the sidebar or click an element to add it</p>
                                    </div>
                                )}
                            </div>

                            {/* Canvas Footer */}
                            <div className="bg-surface-light rounded-b-xl border border-t-0 border-border-light p-3 text-center">
                                <span className="text-[10px] text-text-muted font-bold">{fields.length - 1} field(s) • {app.tag}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Field Inspector */}
                    <div className="w-72 bg-white border-l border-border-light p-5 overflow-y-auto">
                        <h3 className="text-[10px] font-black uppercase text-text-muted tracking-wider mb-3">Field Properties</h3>
                        <FieldInspector 
                            field={selectedField} 
                            onUpdate={updateField}
                            onDelete={deleteField}
                        />
                    </div>
                </div>
                
                <DragOverlay dropAnimation={null}>
                    {activeDragItem ? (
                        <div className="p-3 bg-white border-2 border-blue-500 shadow-2xl rounded-lg opacity-90 cursor-grabbing text-sm font-bold text-blue-600">
                            + Adding field
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
