export type AppFieldType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'message' | 'submit';

export interface IAppField {
    id: string;
    type: AppFieldType;
    label?: string;
    required?: boolean;
    isSecret?: boolean;
    options?: { label: string; value: string }[];
    messageHtml?: string;
    submitText?: string;
}

export interface IAppLayout {
    header: {
        logoUrl?: string;
        title?: string; // string or null/undefined
        subtitle?: string;
    };
}

export interface IApp {
    _id: string;
    workspaceId: string;
    name: string;
    status: 'draft' | 'published';
    tag: 'generator' | 'form';
    launchMode: 'modal' | 'new_tab';
    enabled: boolean;
    layout: IAppLayout;
    fields: IAppField[];
    createdAt: string;
    updatedAt: string;
}
