'use client';

import { useDraggable } from '@dnd-kit/core';
import { Type, AlignLeft, CheckSquare, Info, CircleDot, Mail, Phone, Hash, List, Calendar, Paperclip } from 'lucide-react';
import { AppFieldType } from '@/types/app';

interface SidebarItemProps {
    type: AppFieldType;
    label: string;
    disabled?: boolean;
    disabledBadgeText?: string;
}

export function SidebarItem({ type, label, disabled = false, disabledBadgeText }: SidebarItemProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-${type}`,
        data: {
            type: 'sidebar-item',
            fieldType: type
        },
        disabled,
    });

    const Icon = {
        text: Type,
        textarea: AlignLeft,
        checkbox: CheckSquare,
        radio: CircleDot,

        message: Info,
        email: Mail,
        phone: Phone,
        number: Hash,
        list: List,
        date: Calendar,
        file: Paperclip,
        submit: null // Submit is not draggable from sidebar, it's always there or added via special action? 
                     // Requirement says "Exactly one Submit button... Submit button must always be last".
                     // So maybe we don't drag it, it's just fixed at bottom or we append it automatically.
                     // The plan says "Drag fields... From palette". 
                     // If exactly one is required and it must be last, likely we implicitly add it.
    }[type as string] || Type;

    if (type === 'submit') return null;

    return (
        <div 
            ref={setNodeRef} 
            {...listeners} 
            {...attributes}
            className={`
                p-3 border border-border-light rounded bg-white flex items-center gap-3
                transition-all
                ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-grab hover:border-blue-500 hover:shadow-sm'}
                ${isDragging ? 'opacity-50' : ''}
            `}
        >
            <Icon size={16} className="text-text-muted" />
            <span className="text-sm font-medium text-text-primary flex-1">{label}</span>
            {disabled && disabledBadgeText && (
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700 tracking-wide">
                    {disabledBadgeText}
                </span>
            )}
        </div>
    );
}
