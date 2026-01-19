import { use } from 'react';

const legalContent = {
    terms: `
    # Terms of Service
    Welcome to WorkToolsHub. By using our platform, you agree to...
    WorkToolsHub provides advanced web tools and a multi-tenant AI RAG workspace...
    Jurisdiction: Philippines / USA / Canada.
  `,
    privacy: `
    # Privacy Policy
    We take your privacy seriously.
    1. Data Handling: We do NOT use user data to train AI models.
    2. Retention: Temporary uploads are deleted after 30 minutes. 
    3. Workspace Deletion: Workspaces are hard deleted after 7 days from the request date.
  `,
};

export default function LegalPage(props: { searchParams: Promise<{ type?: string }> }) {
    const searchParams = use(props.searchParams);
    const type = (searchParams.type as 'terms' | 'privacy') || 'terms';

    return (
        <div className="container section-padding">
            <div className="glass card" style={{ padding: '48px' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--foreground)' }}>
                    {legalContent[type as keyof typeof legalContent]}
                </pre>
            </div>
        </div>
    );
}
