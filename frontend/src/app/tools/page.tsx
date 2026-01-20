import Link from 'next/link';
import { Shield, Server, Search, Settings, Lock, ArrowRight, Zap, Globe } from 'lucide-react';

const tools = [
    {
        id: 'ssl',
        name: 'SSL Analyzer',
        desc: 'Check certificate validity and security with enterprise-grade depth.',
        icon: Shield,
        category: 'Security'
    },
    {
        id: 'dns',
        name: 'DNS Checker',
        desc: 'Verify all types of DNS records with sub-second latency.',
        icon: Server,
        category: 'Networking'
    },
    {
        id: 'password',
        name: 'Password Generator',
        desc: 'Secure, random passwords for modern professionals.',
        icon: Lock,
        category: 'Utilities'
    },
    {
        id: 'qr',
        name: 'QR Code Generator',
        desc: 'Create high-resolution PNG/SVG codes for any use case.',
        icon: Zap,
        category: 'Utilities'
    }
];

export default function ToolsPage() {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mb-16 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl dark:text-text-dark">
                    Universal Utilities
                </h1>
                <p className="mt-4 text-xl font-bold text-text-secondary dark:text-muted">
                    A high-performance suite of stateless tools for modern web professionals.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                    <Link
                        key={tool.id}
                        href={`/tools/${tool.id}`}
                        className="card group hover:border-primary/50 hover:shadow-lg"
                    >
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                            <tool.icon className="h-6 w-6" />
                        </div>
                        <div className="mb-2 text-[13px] font-black uppercase tracking-widest text-primary">
                            {tool.category}
                        </div>
                        <h3 className="mb-3 text-2xl font-black text-text-primary dark:text-text-dark">
                            {tool.name}
                        </h3>
                        <p className="font-bold text-text-secondary dark:text-muted leading-relaxed">
                            {tool.desc}
                        </p>
                        <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-primary">
                            Launch tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

