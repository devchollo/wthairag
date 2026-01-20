import Link from 'next/link';
import { Shield, Server, Search, Settings, Lock, ArrowRight, Zap, Globe, Terminal } from 'lucide-react';

const tools = [
    {
        id: 'ssl',
        name: 'TLS Chain Audit',
        desc: 'Deep verification of SSL/TLS certificates and chain-of-trust integrity.',
        icon: Shield,
        category: 'Security'
    },
    {
        id: 'dns',
        name: 'DNS Debugger',
        desc: 'Sub-second propagation logs and global record resolution primitives.',
        icon: Server,
        category: 'Networking'
    },
    {
        id: 'password',
        name: 'Entropy Generator',
        desc: 'Browser-native cryptographic passphrases with high entropy entropy.',
        icon: Lock,
        category: 'Crypto'
    },
    {
        id: 'qr',
        name: 'QR Payload Encoder',
        desc: 'High-density payload encoding for physical-to-digital data transfer.',
        icon: Zap,
        category: 'Encoding'
    }
];

export default function ToolsPage() {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mb-16 text-left">
                <div className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-muted">
                    <Terminal className="h-4 w-4" /> WorkToolsHub / Network Primitives
                </div>
                <h1 className="text-5xl font-black tracking-tighter text-text-primary sm:text-6xl">
                    Development Primitives.
                </h1>
                <p className="mt-6 text-xl font-bold text-text-secondary max-w-2xl leading-relaxed">
                    A high-performance suite of stateless utilities optimized for low-latency network debugging and cryptographic operations.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                    <Link
                        key={tool.id}
                        href={`/tools/${tool.id}`}
                        className="card group hover:border-primary border-2 border-border-light bg-white p-10 flex flex-col justify-between"
                    >
                        <div>
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-light border border-border-light text-primary transition-all group-hover:bg-primary group-hover:text-white">
                                <tool.icon className="h-7 w-7" />
                            </div>
                            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-text-muted transition-colors group-hover:text-blue-600">
                                {tool.category}
                            </div>
                            <h3 className="mb-4 text-3xl font-black text-text-primary tracking-tight">
                                {tool.name}
                            </h3>
                            <p className="font-bold text-text-secondary leading-relaxed text-sm">
                                {tool.desc}
                            </p>
                        </div>
                        <div className="mt-10 flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                Access Console <ArrowRight className="h-3 w-3" />
                            </span>
                            <div className="h-2 w-2 rounded-full bg-border-light group-hover:bg-primary transition-colors"></div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

