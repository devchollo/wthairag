'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IAppField } from '@/types/app';
import { Trash2, GripVertical } from 'lucide-react';

interface SortableFieldProps {
    field: IAppField;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

export function SortableField({ field, isSelected, onSelect, onDelete }: SortableFieldProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging
    } = useSortable({
        id: field.id,
        transition: {
            duration: 120,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? 'none' : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    if (field.type === 'submit') {
        // Submit button is special, maybe not draggable?
        // Requirement: "Submit button must always be last".
        // If it's sortable, users might move it up.
        // We should PROBABLY not make it sortable, or enforce its position.
        // For now, let's render it as a fixed footer in the canvas, or just a non-draggable item.
        return (
            <div 
                ref={setNodeRef} 
                style={style}
                onClick={() => onSelect(field.id)}
                className={`
                    p-4 rounded-lg border-2 mb-3 cursor-pointer transition-colors
                    ${isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-dashed border-border-light bg-surface-light'}
                `}
            >
                <div className="flex items-center justify-center">
                    <button disabled className="btn-primary w-full max-w-xs pointer-events-none">
                        {field.submitText || 'Submit'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(field.id);
            }}
            className={`
                group relative p-4 rounded-lg border-2 mb-3 cursor-pointer transition-colors bg-white
                ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent hover:border-border-light shadow-sm'}
            `}
        >
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-text-muted opacity-0 group-hover:opacity-100 cursor-grab hover:text-text-primary">
                <GripVertical size={16} />
            </div>

            <div className="pl-8 pr-8">
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">
                    {field.label || 'Untitled Field'}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                    {field.isSecret && <span className="text-amber-500 ml-2 text-[10px] bg-amber-50 px-1 rounded">SECRET</span>}
                </label>

                {/* Field Preview */}
                <div className="pointer-events-none">
                    {field.type === 'text' && <input type="text" className="input-base" disabled placeholder="Text Input" />}
                    {field.type === 'textarea' && <textarea className="input-base h-20" disabled placeholder="Long text..." />}
                    {field.type === 'checkbox' && <div className="flex items-center gap-2"><div className="w-4 h-4 border rounded"></div> <span>Checkbox Label</span></div>}
                    {field.type === 'radio' && <div className="space-y-1">
                         {(field.options || [{label:'Option 1', value:'1'}, {label:'Option 2', value:'2'}]).map((opt, i) => (
                             <div key={i} className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border"></div> <span>{opt.label}</span></div>
                         ))}
                    </div>}
                    {field.type === 'file' && <input type="file" className="input-base" disabled />}
                    {field.type === 'message' && <div className="p-4 bg-blue-50 text-blue-800 rounded text-sm">Message / Instructions Preview</div>}
                </div>
            </div>

            {/* Actions */}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(field.id);
                }}
                className="absolute right-2 top-2 p-2 text-text-muted hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}
