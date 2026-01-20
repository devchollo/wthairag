import { use } from 'react';

const legalContent = {
    terms: {
        title: "Terms of Service",
        content: `Welcome to WorkToolsHub. By using our platform, you agree to an absolute standard of data privacy and stateless operation.

1. Utilities
WorkToolsHub provides advanced web tools and a multi-tenant AI RAG workspace built for speed and security.

2. Jurisdiction
Governed by the laws of the Philippines, USA, and Canada.`
    },
    privacy: {
        title: "Privacy Policy",
        content: `We take your privacy seriously. It is a fundamental right.

1. Data Handling
We do NOT use user data to train AI models. Ever.

2. Retention
Temporary uploads are purged after 30 minutes of inactivity.

3. Workspace Deletion
Workspaces are hard-deleted within 7 days of the request date.`
    },
};

export default function LegalPage(props: { searchParams: Promise<{ type?: string }> }) {
    const searchParams = use(props.searchParams);
    const type = (searchParams.type as 'terms' | 'privacy') || 'terms';
    const data = legalContent[type] || legalContent.terms;

    return (
        <div className="mx-auto max-w-[800px] px-4 py-24 sm:px-6 lg:px-8">
            <div className="card border-none bg-surface-light dark:bg-surface-dark p-12 sm:p-20">
                <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-text-primary dark:text-text-dark sm:text-4xl">
                    {data.title}
                </h1>
                <div className="whitespace-pre-wrap text-lg leading-relaxed text-text-secondary dark:text-muted">
                    {data.content}
                </div>
            </div>
        </div>
    );
}


