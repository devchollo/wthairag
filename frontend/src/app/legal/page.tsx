'use client';

import { Suspense, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Shield,
    Scale,
    Terminal,
    Lock,
    Activity,
    BookOpen,
    Database,
    Cookie,
    Globe
} from 'lucide-react';

interface LegalSection {
    h: string;
    p?: ReactNode;
    list?: ReactNode[];
}

interface LegalEntry {
    title: string;
    desc: string;
    meta?: {
        updated: string;
        jurisdiction?: string;
    };
    sections: LegalSection[];
}

const legalContent: Record<string, LegalEntry> = {
    overview: {
        title: 'Legal Overview',
        desc: 'Regional privacy notices, terms, and operational policies tailored to the WorkToolsHub stack.',
        meta: { updated: 'March 2025', jurisdiction: 'Global summary' },
        sections: [
            {
                h: 'Choose your region',
                p: 'Select the policy that matches your residence or primary place of business.',
                list: [
                    <span key="ph">
                        <a className="text-blue-600" href="?type=privacy-ph">Philippines Privacy Policy</a> and <a className="text-blue-600" href="?type=terms-ph">Terms (PH)</a>
                    </span>,
                    <span key="us">
                        <a className="text-blue-600" href="?type=privacy-us">United States Privacy Policy</a> and <a className="text-blue-600" href="?type=terms-us">Terms (US)</a>
                    </span>,
                    <span key="ca">
                        <a className="text-blue-600" href="?type=privacy-ca">Canada Privacy Policy</a> and <a className="text-blue-600" href="?type=terms-ca">Terms (CA)</a>
                    </span>
                ]
            },
            {
                h: 'How the platform processes data',
                p: 'WorkToolsHub combines stateless public utilities with optional workspace features that persist data for team collaboration.',
                list: [
                    'Public tools (DNS, SSL, WHOIS, IP lookups) process requests in-memory and return results immediately.',
                    'File converters store temporary artifacts in short-lived storage (typically under 30 minutes) before deletion.',
                    'Workspace features store user profiles, documents, and usage logs in a MongoDB database with files stored in object storage.',
                    'AI features send requested prompts and workspace context to the configured AI provider to generate responses or embeddings.'
                ]
            },
            {
                h: 'Core operational policies',
                p: 'These additional policies apply across all regions and are available in the navigation.',
                list: [
                    <span key="security"><a className="text-blue-600" href="?type=security">Security Standards</a></span>,
                    <span key="sla"><a className="text-blue-600" href="?type=sla">SLA & Reliability</a></span>,
                    <span key="cookies"><a className="text-blue-600" href="?type=cookies">Cookies & Analytics</a></span>,
                    <span key="subprocessors"><a className="text-blue-600" href="?type=third-party">Third-Party APIs & Subprocessors</a></span>,
                    <span key="processing"><a className="text-blue-600" href="?type=data-processing">Data Processing & Retention</a></span>
                ]
            }
        ]
    },
    'privacy-ph': {
        title: 'Privacy Policy — Philippines',
        desc: 'Privacy notice aligned with the Data Privacy Act of 2012 for users in the Philippines.',
        meta: { updated: 'March 2025', jurisdiction: 'Philippines (DPA 2012)' },
        sections: [
            {
                h: 'Scope and lawful bases',
                p: 'We collect and process personal data to provide WorkToolsHub services, relying on consent, contractual necessity, legitimate interests (security, service improvement), and legal obligations when applicable.',
                list: [
                    'Account data (name, email, workspace identifiers).',
                    'Usage telemetry (tool usage, error logs, rate-limit signals).',
                    'Workspace content (documents, chat prompts, metadata) when you opt into collaboration features.',
                    'Authentication identifiers (session cookies and security tokens).'
                ]
            },
            {
                h: 'Feature-specific processing',
                list: [
                    'Public utilities: DNS, SSL, WHOIS, IP, and webhook diagnostics are processed in-memory and not persisted unless required for security auditing.',
                    'File tools: uploads are stored in a temporary directory for conversion and automatically deleted on schedule (typically within 30 minutes).',
                    'Knowledge Vault & RAG: uploaded documents are stored in MongoDB and object storage; embeddings are generated via the AI provider.',
                    'Email verification and invitations are delivered through the configured email service provider.'
                ]
            },
            {
                h: 'Cross-border transfers and third parties',
                p: 'We may transfer data to subprocessors outside the Philippines to deliver the service. See the Third-Party APIs page for provider references and links to their privacy policies.',
                list: [
                    <span key="subprocessors"><a className="text-blue-600" href="?type=third-party">Third-Party APIs & Subprocessors</a></span>
                ]
            },
            {
                h: 'Your rights under the DPA',
                list: [
                    'Right to be informed about processing activities and recipients.',
                    'Right to access, correct, or update personal data.',
                    'Right to object to processing or withdraw consent where applicable.',
                    'Right to data portability and erasure subject to legal obligations.'
                ]
            },
            {
                h: 'Contact for PH data rights',
                p: 'Submit requests through the support channel listed in your account communications. We will verify your identity before processing requests.'
            }
        ]
    },
    'privacy-us': {
        title: 'Privacy Policy — United States',
        desc: 'Privacy notice for U.S. residents, including California CCPA/CPRA disclosures.',
        meta: { updated: 'March 2025', jurisdiction: 'United States' },
        sections: [
            {
                h: 'Categories of personal data',
                list: [
                    'Identifiers: name, email address, workspace IDs, and authentication tokens.',
                    'Usage data: IP addresses, device metadata, performance logs, and tool usage metrics.',
                    'Content data: files, prompts, and workspace records when you opt into storage features.'
                ]
            },
            {
                h: 'How we use data',
                list: [
                    'Provide and secure the platform, including fraud prevention and rate limiting.',
                    'Generate AI responses or embeddings when you request AI-powered tools.',
                    'Deliver transactional emails such as verification, invites, and password resets.',
                    'Analyze anonymized analytics to improve reliability and user experience.'
                ]
            },
            {
                h: 'California privacy rights (CCPA/CPRA)',
                p: 'We do not sell personal information. You may request to know, delete, or correct personal information, and you may opt out of data sharing for targeted advertising (not currently used).',
                list: [
                    'Right to know and access the categories and specific pieces of data we hold.',
                    'Right to delete or correct data subject to legal retention requirements.',
                    'Right to limit use of sensitive personal information where applicable.'
                ]
            },
            {
                h: 'Children’s privacy',
                p: 'WorkToolsHub is not intended for children under 13. We do not knowingly collect data from children.'
            },
            {
                h: 'Service providers and transfers',
                p: 'We use vetted service providers for analytics, AI processing, email delivery, and object storage. Refer to the Third-Party APIs page for details.',
                list: [
                    <span key="third-party"><a className="text-blue-600" href="?type=third-party">Third-Party APIs & Subprocessors</a></span>
                ]
            }
        ]
    },
    'privacy-ca': {
        title: 'Privacy Policy — Canada',
        desc: 'Privacy notice aligned with PIPEDA for Canadian users.',
        meta: { updated: 'March 2025', jurisdiction: 'Canada (PIPEDA)' },
        sections: [
            {
                h: 'Consent and accountability',
                p: 'We collect personal information with consent and use it only for the purposes described in this notice. WorkToolsHub remains accountable for information handled by subprocessors.',
                list: [
                    'Account data, workspace identifiers, and authentication tokens.',
                    'Usage analytics to keep the platform reliable and secure.',
                    'Stored content (documents, prompts) for workspace features you enable.'
                ]
            },
            {
                h: 'Use, retention, and safeguarding',
                list: [
                    'Temporary file conversions are stored briefly and deleted on schedule (typically within 30 minutes).',
                    'Workspace data is retained until you delete it or close your account, subject to legal obligations.',
                    'Security controls include encryption in transit, access logging, and rate limiting.'
                ]
            },
            {
                h: 'Access, correction, and withdrawal',
                p: 'You may request access to your data, request corrections, or withdraw consent subject to legal or contractual restrictions.'
            },
            {
                h: 'Cross-border processing',
                p: 'Some service providers may process data outside Canada. We use contractual and technical safeguards to protect your information.'
            },
            {
                h: 'Contact for Canadian requests',
                p: 'Submit requests via the support channel listed in account communications so we can verify your identity.'
            }
        ]
    },
    'terms-ph': {
        title: 'Terms of Service — Philippines',
        desc: 'Terms governing WorkToolsHub access for users in the Philippines.',
        meta: { updated: 'March 2025', jurisdiction: 'Philippines' },
        sections: [
            {
                h: 'Service scope',
                p: 'WorkToolsHub provides developer tools, file utilities, and AI-assisted workflows. Some tools are public, while workspace features require an account.'
            },
            {
                h: 'Acceptable use',
                list: [
                    'Do not abuse rate limits, probe third-party systems without authorization, or attempt to disrupt the service.',
                    'You are responsible for the legality of the data you upload or process.',
                    'Automated scraping of system endpoints requires prior written authorization.'
                ]
            },
            {
                h: 'Content ownership',
                p: 'You retain ownership of your content. You grant WorkToolsHub a limited license to process it for providing the requested service.'
            },
            {
                h: 'Disclaimers and limitation',
                p: 'Services are provided “as is.” We do not guarantee uninterrupted access or accuracy of public network data.'
            },
            {
                h: 'Governing law',
                p: 'These terms are governed by the laws of the Philippines, without regard to conflict of law principles.'
            }
        ]
    },
    'terms-us': {
        title: 'Terms of Service — United States',
        desc: 'Terms governing WorkToolsHub access for U.S. users.',
        meta: { updated: 'March 2025', jurisdiction: 'United States' },
        sections: [
            {
                h: 'Service scope',
                p: 'WorkToolsHub provides developer tools, file utilities, and AI-assisted workflows. Workspace features require an account and may store data.'
            },
            {
                h: 'Acceptable use',
                list: [
                    'You may not misuse the platform, attempt unauthorized access, or violate applicable law.',
                    'You are responsible for third-party permissions associated with data you upload.',
                    'We may suspend access for security or compliance reasons.'
                ]
            },
            {
                h: 'Content ownership and AI processing',
                p: 'You retain ownership of your content. You authorize WorkToolsHub to transmit requested data to AI providers to generate outputs.'
            },
            {
                h: 'Disclaimers',
                p: 'WorkToolsHub services are provided “as is” without warranties of fitness, accuracy, or availability.'
            },
            {
                h: 'Governing law',
                p: 'These terms are governed by the laws of the United States and the state where WorkToolsHub is headquartered, without regard to conflict of law.'
            }
        ]
    },
    'terms-ca': {
        title: 'Terms of Service — Canada',
        desc: 'Terms governing WorkToolsHub access for Canadian users.',
        meta: { updated: 'March 2025', jurisdiction: 'Canada' },
        sections: [
            {
                h: 'Service scope',
                p: 'WorkToolsHub provides developer tools and optional workspace features. Some tools process data without storage, while workspace tools retain data for collaboration.'
            },
            {
                h: 'Acceptable use',
                list: [
                    'Do not attempt to interfere with service availability or security safeguards.',
                    'You are responsible for ensuring you have rights to upload and process content.',
                    'We may disable accounts that violate these terms or applicable law.'
                ]
            },
            {
                h: 'Content ownership',
                p: 'You retain ownership of your data. We process it solely to deliver the service you request.'
            },
            {
                h: 'Disclaimers',
                p: 'The service is provided “as is.” We are not liable for indirect or consequential damages.'
            },
            {
                h: 'Governing law',
                p: 'These terms are governed by the laws of Canada and the province where WorkToolsHub is headquartered, without regard to conflict of law.'
            }
        ]
    },
    'data-processing': {
        title: 'Data Processing & Retention',
        desc: 'How WorkToolsHub stores, retains, and deletes data across core systems.',
        meta: { updated: 'March 2025', jurisdiction: 'Global operational policy' },
        sections: [
            {
                h: 'Primary data stores',
                list: [
                    'MongoDB database for user profiles, workspace metadata, usage logs, and document metadata.',
                    'Object storage (S3-compatible, Backblaze B2 endpoint) for uploaded documents and generated files.',
                    'Short-lived file system storage for conversion outputs (typically cleaned within 30 minutes).'
                ]
            },
            {
                h: 'AI processing',
                p: 'When you use AI tools, prompts and relevant workspace context are sent to the configured AI provider to generate completions or embeddings. We store the resulting outputs in the workspace history when applicable.'
            },
            {
                h: 'Retention and deletion',
                list: [
                    'Workspace documents remain available until you delete them or delete the workspace.',
                    'Temporary conversion files are removed automatically (within 30 minutes) or shortly after download.',
                    'Security logs and rate-limit records are retained only as long as needed for abuse prevention.'
                ]
            },
            {
                h: 'Your controls',
                p: 'You can delete documents and workspace data from within the app. Contact support to request account deletion or data export.'
            }
        ]
    },
    'third-party': {
        title: 'Third-Party APIs & Subprocessors',
        desc: 'External services used to deliver WorkToolsHub features and their data handling references.',
        meta: { updated: 'March 2025', jurisdiction: 'Global operational policy' },
        sections: [
            {
                h: 'AI and analytics providers',
                list: [
                    <span key="openai">
                        OpenAI API — AI chat and embeddings. <a className="text-blue-600" href="https://openai.com/policies/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>
                    </span>,
                    <span key="vercel">
                        Vercel Analytics — site performance analytics. <a className="text-blue-600" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>
                    </span>
                ]
            },
            {
                h: 'Network intelligence APIs',
                list: [
                    <span key="ipinfo">
                        IPinfo — IP geolocation and ASN data. <a className="text-blue-600" href="https://ipinfo.io/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>
                    </span>,
                    <span key="ipapi">
                        IP-API — fallback IP geolocation data. <a className="text-blue-600" href="https://ip-api.com/docs/legal" target="_blank" rel="noreferrer">Legal</a>
                    </span>,
                    <span key="whois">
                        WHOIS servers (via whois-json) — public registry data. <a className="text-blue-600" href="https://www.npmjs.com/package/whois-json" target="_blank" rel="noreferrer">Library reference</a>
                    </span>
                ]
            },
            {
                h: 'Messaging and storage',
                list: [
                    <span key="brevo">
                        Brevo — transactional email delivery. <a className="text-blue-600" href="https://www.brevo.com/legal/privacypolicy/" target="_blank" rel="noreferrer">Privacy Policy</a>
                    </span>,
                    <span key="backblaze">
                        Backblaze B2 (S3-compatible storage) — document storage. <a className="text-blue-600" href="https://www.backblaze.com/company/privacy.html" target="_blank" rel="noreferrer">Privacy Policy</a>
                    </span>
                ]
            },
            {
                h: 'Notes on data sharing',
                p: 'Data shared with providers is limited to what is necessary to perform the requested service. We do not authorize providers to use your data for unrelated advertising.'
            }
        ]
    },
    cookies: {
        title: 'Cookies & Analytics',
        desc: 'How WorkToolsHub uses cookies, local storage, and analytics tags.',
        meta: { updated: 'March 2025', jurisdiction: 'Global operational policy' },
        sections: [
            {
                h: 'Essential cookies',
                p: 'We set secure, httpOnly session cookies to authenticate users and secure workspace sessions. These cookies are required for core functionality.'
            },
            {
                h: 'Analytics',
                p: 'We use Vercel Analytics to understand performance and usage trends. Analytics data is aggregated and does not include your workspace content.',
                list: [
                    <span key="vercel"><a className="text-blue-600" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Vercel Privacy Policy</a></span>
                ]
            },
            {
                h: 'Your choices',
                p: 'You can block non-essential cookies in your browser settings. Blocking essential cookies may prevent login or workspace access.'
            }
        ]
    },
    security: {
        title: 'Security Standards',
        desc: 'Controls and safeguards applied to protect WorkToolsHub data and sessions.',
        meta: { updated: 'March 2025', jurisdiction: 'Global operational policy' },
        sections: [
            {
                h: 'Encryption and transport',
                p: 'All traffic between your browser and the API is encrypted using TLS. Stored files in object storage inherit provider encryption controls.'
            },
            {
                h: 'Application hardening',
                list: [
                    'Rate limiting and abuse protection on high-risk endpoints.',
                    'Input validation, file signature checks, and payload size limits.',
                    'Secure authentication cookies and JWT-based session handling.'
                ]
            },
            {
                h: 'Operational monitoring',
                p: 'We log security events and system errors for incident response. Logs are retained only as long as needed for operational security.'
            }
        ]
    },
    sla: {
        title: 'SLA & Reliability',
        desc: 'Operational targets for uptime, response, and support.',
        meta: { updated: 'March 2025', jurisdiction: 'Global operational policy' },
        sections: [
            {
                h: 'Uptime commitment',
                p: 'We target 99.9% availability for core API services, excluding scheduled maintenance.'
            },
            {
                h: 'Performance targets',
                p: 'Public utilities are engineered for fast responses with typical latencies under 300ms from primary edge locations.'
            },
            {
                h: 'Support response',
                p: 'Critical support requests are prioritized according to plan level. Response times are typically within 12-24 hours for urgent issues.'
            }
        ]
    }
};

function LegalContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'overview';
    const content = legalContent[type as keyof typeof legalContent] || legalContent.overview;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Globe },
        { id: 'privacy-ph', label: 'Privacy (PH)', icon: Shield },
        { id: 'privacy-us', label: 'Privacy (US)', icon: Shield },
        { id: 'privacy-ca', label: 'Privacy (CA)', icon: Shield },
        { id: 'terms-ph', label: 'Terms (PH)', icon: Scale },
        { id: 'terms-us', label: 'Terms (US)', icon: Scale },
        { id: 'terms-ca', label: 'Terms (CA)', icon: Scale },
        { id: 'data-processing', label: 'Data Processing', icon: Database },
        { id: 'third-party', label: 'Third-Party APIs', icon: BookOpen },
        { id: 'cookies', label: 'Cookies', icon: Cookie },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'sla', label: 'Reliability', icon: Activity }
    ];

    return (
        <div className="mx-auto max-w-[1100px] px-6 py-12 lg:py-20 animate-in fade-in duration-500">
            <div className="mb-12">
                <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <Terminal className="h-4 w-4" /> WorkToolsHub / Governance Protocols
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-text-primary tracking-tighter mb-4">{content.title}.</h1>
                <p className="text-lg font-bold text-text-secondary leading-snug max-w-2xl">{content.desc}</p>
                {content.meta && (
                    <div className="mt-4 text-xs font-bold uppercase tracking-widest text-text-muted">
                        <span>Last updated: {content.meta.updated}</span>
                        {content.meta.jurisdiction && <span className="ml-3">• {content.meta.jurisdiction}</span>}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12">
                <aside className="lg:col-span-1 border-r border-border-light pr-8">
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const isActive = type === tab.id;
                            return (
                                <a
                                    key={tab.id}
                                    href={`?type=${tab.id}`}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-black text-xs transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-text-muted hover:text-text-primary hover:bg-surface-light'}`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </a>
                            );
                        })}
                    </nav>
                </aside>

                <div className="lg:col-span-1 space-y-12">
                    {content.sections.map((section, i) => (
                        <section key={i} className="group">
                            <h2 className="text-xl font-black text-text-primary mb-4 tracking-tight flex items-center gap-2">
                                <span className="text-blue-600 opacity-30 text-sm">{String(i + 1).padStart(2, '0')}.</span>
                                {section.h}
                            </h2>
                            {section.p && (
                                <p className="text-base font-bold text-text-secondary leading-relaxed opacity-80">
                                    {section.p}
                                </p>
                            )}
                            {section.list && (
                                <ul className="mt-4 space-y-3 text-sm font-bold text-text-secondary leading-relaxed opacity-80 list-disc pl-6">
                                    {section.list.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function LegalPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        }>
            <LegalContent />
        </Suspense>
    );
}
