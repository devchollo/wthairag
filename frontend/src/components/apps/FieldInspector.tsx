'use client';

import { IAppField } from '@/types/app';
import { Type, AlignLeft, CheckSquare, Info, Trash2 } from 'lucide-react';

interface FieldInspectorProps {
    field: IAppField | null;
    onUpdate: (id: string, updates: Partial<IAppField>) => void;
    onDelete: (id: string) => void;
}

export function FieldInspector({ field, onUpdate, onDelete }: FieldInspectorProps) {
    if (!field) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-text-muted p-4 text-center">
                <p className="text-sm">Select a field on the canvas to edit its properties.</p>
            </div>
        );
    }

    const isSecretAllowed = ['text', 'textarea', 'radio', 'checkbox'].includes(field.type);

    return (
        <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-light">
                <span className="text-xs font-bold uppercase text-text-muted flex items-center gap-2">
                    {field.type} Properties
                </span>
                <button 
                    onClick={() => onDelete(field.id)}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                    title="Delete Field"
                    disabled={field.type === 'submit'}
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="space-y-4">
                {/* Common: Label */}
                {field.type !== 'message' && (
                    <div>
                        <label className="text-xs font-bold block mb-1 text-text-primary">Label</label>
                        <input 
                            type="text" 
                            className="w-full border border-border-light rounded-lg p-2 text-sm focus:border-blue-500 outline-none" 
                            value={field.label || ''}
                            onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                        />
                    </div>
                )}

                {/* Common: Required */}
                {field.type !== 'message' && field.type !== 'submit' && (
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={field.required || false}
                            onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
                        />
                        <span className="text-text-primary">Required Field</span>
                    </label>
                )}

                {/* Secret (PII) */}
                {isSecretAllowed && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none mb-1">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                checked={field.isSecret || false}
                                onChange={(e) => onUpdate(field.id, { isSecret: e.target.checked })}
                            />
                            <span className="font-bold text-amber-800">Confidential (Secret)</span>
                        </label>
                        <p className="text-[10px] text-amber-700 leading-tight">
                            Values in this field will NEVER be sent to AI or logged.
                        </p>
                    </div>
                )}

                {/* Submit Text */}
                {field.type === 'submit' && (
                    <div>
                        <label className="text-xs font-bold block mb-1 text-text-primary">Button Text</label>
                        <input 
                            type="text" 
                            className="w-full border border-border-light rounded-lg p-2 text-sm focus:border-blue-500 outline-none" 
                            value={field.submitText || 'Submit'}
                            onChange={(e) => onUpdate(field.id, { submitText: e.target.value })}
                        />
                    </div>
                )}

                {/* Message Content */}
                {field.type === 'message' && (
                    <div>
                        <label className="text-xs font-bold block mb-1 text-text-primary">Message Content (HTML)</label>
                        <textarea 
                            className="w-full border border-border-light rounded-lg p-2 text-sm focus:border-blue-500 outline-none h-32 font-mono" 
                            value={field.messageHtml || ''}
                            onChange={(e) => onUpdate(field.id, { messageHtml: e.target.value })}
                            placeholder="<p>Enter your text here...</p>"
                        />
                    </div>
                )}

                {/* Options (Radio/Checkbox placeholder) */}
                {(field.type === 'radio') && (
                    <div>
                         <label className="text-xs font-bold block mb-1 text-text-primary">Options</label>
                         <p className="text-xs text-text-muted">Option editing coming soon...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
