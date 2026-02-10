'use client';

import { useState, useEffect } from 'react';
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
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Save, ArrowLeft, Eye, Settings, Layout, FormInput, Type, CheckSquare, AlignLeft, Info } from 'lucide-react';
import Link from 'next/link';

import { IAppField, AppFieldType } from '@/types/app';
import { SidebarItem } from '@/components/apps/SidebarItem';
import { SortableField } from '@/components/apps/SortableField';
import { FieldInspector } from '@/components/apps/FieldInspector';

export default function AppBuilderPage({ params }: { params: { workspaceId: string; appId: string } }) {
    const { user, memberships } = useAuth();
    const router = useRouter();
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fields, setFields] = useState<IAppField[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'build' | 'settings'>('build');
    const [activeDragItem, setActiveDragItem] = useState<any>(null);
    
    // Sensors for DnD
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchApp();
    }, [params.appId]);

    const fetchApp = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspaces/${params.workspaceId}/apps/${params.appId}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch app');
            const data = await res.json();
            setApp(data.data);
            
            // Ensure fields exist
            let fetchedFields = data.data.fields || [];
            
            // Ensure submit button exists and is at the end if not present
            // (Though backend enforces it on save, frontend should present it)
            const hasSubmit = fetchedFields.some((f: IAppField) => f.type === 'submit');
            if (!hasSubmit) {
                fetchedFields.push({
                    id: 'submit-btn',
                    type: 'submit',
                    submitText: 'Generate'
                });
            }

            setFields(fetchedFields);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
             // Ensure submit is last
             const submitField = fields.find(f => f.type === 'submit');
             const otherFields = fields.filter(f => f.type !== 'submit');
             
             // If submit button was deleted (shouldn't happen), add it back
             const finalFields = submitField 
                ? [...otherFields, submitField] 
                : [...otherFields, { id: 'submit-btn', type: 'submit' as AppFieldType, submitText: 'Submit' }];

             const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/workspaces/${params.workspaceId}/apps/${params.appId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fields: finalFields,
                    // other settings...
                }),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to save');
            alert('Saved successfully!');
            fetchApp(); // Refresh
        } catch (err) {
            alert('Error saving');
        }
    };

    // Data handling
    const addField = (type: AppFieldType) => {
        const newField: IAppField = {
            id: `field-${Date.now()}`,
            type,
            label: `New ${type}`,
            required: false,
            isSecret: false
        };
        
        // Add before submit button
        const submitIndex = fields.findIndex(f => f.type === 'submit');
        if (submitIndex === -1) {
            setFields([...fields, newField]);
        } else {
            const newFields = [...fields];
            newFields.splice(submitIndex, 0, newField);
            setFields(newFields);
        }
        setSelectedFieldId(newField.id);
    };

    const updateField = (id: string, updates: Partial<IAppField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const deleteField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
    };

    // Drag Handlers
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveDragItem(active.data.current);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        // If dropping a sidebar item
        if (active.data.current?.type === 'sidebar-item') {
            const type = active.data.current.fieldType;
            addField(type);
            return;
        }

        // Reordering
        if (active.id !== over.id) {
            setFields((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                
                // Don't allow moving past submit button
                if (items[newIndex].type === 'submit') return items;
                if (items[oldIndex].type === 'submit') return items;

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    if (loading) return <div>Loading...</div>;

    const selectedField = fields.find(f => f.id === selectedFieldId) || null;

    return (
        <div className="h-screen flex flex-col bg-surface-base">
            {/* Header */}
            <div className="h-16 border-b border-border-light bg-white flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Link href={`/workspace/${params.workspaceId}/apps`} className="text-text-muted hover:text-text-primary">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg">{app?.name}</h1>
                        <span className="text-xs text-text-muted">v1.0 • {app?.status}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                        <Save size={16} />
                        Save Changes
                    </button>
                    <Link 
                        href={`/workspace/${params.workspaceId}/apps/${params.appId}`}
                        target="_blank"
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Eye size={16} />
                        Preview
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar (Palette) */}
                    <div className="w-64 bg-white border-r border-border-light p-4 flex flex-col gap-4">
                        <h3 className="text-xs font-bold uppercase text-text-muted">Form Elements</h3>
                        <div className="flex flex-col gap-2">
                            <SidebarItem type="text" label="Text Input" />
                            <SidebarItem type="textarea" label="Text Area" />
                            <SidebarItem type="checkbox" label="Checkbox" />
                            <SidebarItem type="radio" label="Radio Group" />
                            <SidebarItem type="message" label="Message / HTML" />
                        </div>
                        
                        <div className="mt-8">
                             <h3 className="text-xs font-bold uppercase text-text-muted mb-2">App Settings</h3>
                             {/* Basic settings link or mini-form could go here */}
                             <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded">
                                 Additional settings (Tag, Launch Mode) can be added here.
                             </div>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 bg-surface-base p-8 overflow-y-auto">
                        <div className="max-w-2xl mx-auto bg-white min-h-[500px] shadow-sm rounded-lg p-8">
                            <SortableContext 
                                items={fields.map(f => f.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {fields.map(f => (
                                    <SortableField 
                                        key={f.id} 
                                        field={f} 
                                        isSelected={selectedFieldId === f.id}
                                        onSelect={setSelectedFieldId}
                                        onDelete={deleteField}
                                    />
                                ))}
                            </SortableContext>
                            
                            {fields.length === 1 && fields[0].type === 'submit' && (
                                <div className="text-center py-12 border-2 border-dashed border-border-light rounded-lg mb-4">
                                    <p className="text-text-muted">Drag fields here from the sidebar</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Inspector (Right Panel) */}
                    <div className="w-80 bg-white border-l border-border-light p-6 overflow-y-auto">
                        <FieldInspector 
                            field={selectedField} 
                            onUpdate={updateField}
                            onDelete={deleteField}
                        />
                    </div>
                </div>
                
                <DragOverlay>
                    {activeDragItem ? (
                        <div className="p-3 bg-white border border-blue-500 shadow-xl rounded opacity-80 cursor-grabbing">
                            Scanning...
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

