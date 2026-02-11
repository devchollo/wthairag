export type AppFieldType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'message' | 'submit' | 'email' | 'phone' | 'number' | 'list' | 'date' | 'file';

export interface IAppField {
    id: string;
    type: AppFieldType;
    label?: string;
    required?: boolean;
    isSecret?: boolean;
    acceptedFileTypes?: string;
    options?: { label: string; value: string }[];
    messageHtml?: string;
    submitText?: string;
}

export interface IAppFormSettings {
    recipients: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    anonymousSubmissions: boolean;
    improveWithAi: boolean;
}

export interface IAppBackground {
    type: 'solid' | 'gradient' | 'image';
    value: string;
    imageKey?: string;
}

export interface IAppLayout {
    header: {
        logoUrl?: string;
        logoKey?: string;
        title?: string;
        subtitle?: string;
    };
    background?: IAppBackground;
}

export interface IApp {
    _id: string;
    workspaceId: string;
    name: string;
    description?: string;
    status: 'draft' | 'published';
    tag: 'generator' | 'form';
    launchMode: 'modal' | 'new_tab';
    enabled: boolean;
    allowAiImprove: boolean;
    formSettings?: IAppFormSettings;
    layout: IAppLayout;
    fields: IAppField[];
    createdAt: string;
    updatedAt: string;
}
