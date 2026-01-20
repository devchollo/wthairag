import { use } from 'react';

const legalContent = {
    terms: `
    # terms of service
    Welcome to WorkToolsHub. By using our platform, you agree to an absolute standard of data privacy and stateless operation.
    
    1. utilities
    WorkToolsHub provides advanced web tools and a multi-tenant AI RAG workspace built for speed and security.
    
    2. jurisdiction
    Governed by the laws of the Philippines, USA, and Canada.
  `,
    privacy: `
    # privacy policy
    We take your privacy seriously. It is a fundamental right.
    
    1. data handling
    We do NOT use user data to train AI models. Ever.
    
    2. retention
    Temporary uploads are purged after 30 minutes of inactivity.
    
    3. workspace deletion
    Workspaces are hard-deleted within 7 days of the request date.
  `,
};

export default function LegalPage(props: { searchParams: Promise<{ type?: string }> }) {
    const searchParams = use(props.searchParams);
    const type = (searchParams.type as 'terms' | 'privacy') || 'terms';

    return (
        <div className="container section-padding">
            <div className="glass card" style={{ padding: '80px 60px' }}>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--apple-black)', lineHeight: '1.6' }}>
                    {legalContent[type as keyof typeof legalContent]}
                </div>
            </div>
        </div>
    );
}

