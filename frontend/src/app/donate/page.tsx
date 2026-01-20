'use client';

import { Heart, Coffee, Fuel, Zap, ArrowRight, MessageSquare, Terminal, Globe } from 'lucide-react';
import Link from 'next/link';

export default function DonatePage() {
    return (
        <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-24">
                <div className="inline-flex items-center gap-3 rounded-full border border-border-light bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-10 shadow-sm">
                    Sponsorship Protocol
                </div>
                <h1 className="text-6xl font-black tracking-tighter text-text-primary mb-10 leading-[0.9]">
                    Sponsor the <br /> <span className="text-blue-600">Dev Hub.</span>
                </h1>
                <p className="text-xl font-bold leading-relaxed text-text-secondary">
                    WorkToolsHub is an independent initiative to provide high-performance network and security primitives for free. Your support keeps our global resolver fleet online and ensure we stay independent of corporate data-mining.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Level 1 */}
                <div className="card border-2 border-border-light bg-white hover:border-blue-500/50 flex flex-col items-start text-left p-10">
                    <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-light border border-border-light text-text-primary">
                        <Coffee className="h-6 w-6" />
                    </div>
                    <div className="mb-2 text-[11px] font-black uppercase tracking-widest text-text-muted">Byte Contribution</div>
                    <div className="text-3xl font-black text-text-primary mb-6">$5.00</div>
                    <p className="text-sm font-bold text-text-secondary mb-10 leading-relaxed">
                        Covers roughly 5GB of encrypted knowledge base storage for the community.
                    </p>
                    <button className="btn-secondary w-full mt-auto">Sponsor Hub</button>
                </div>

                {/* Level 2 */}
                <div className="card shadow-2xl shadow-blue-500/10 border-blue-600/20 bg-white flex flex-col items-start text-left p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-blue-600/5 rounded-bl-[100px]"></div>
                    <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                        <Terminal className="h-6 w-6" />
                    </div>
                    <div className="mb-2 text-[11px] font-black uppercase tracking-widest text-blue-600">Core Contributor</div>
                    <div className="text-3xl font-black text-text-primary mb-6">$25.00</div>
                    <p className="text-sm font-bold text-text-secondary mb-10 leading-relaxed">
                        Directly fuels our global resolver capacity and TLS chain audit nodes.
                    </p>
                    <button className="btn-primary w-full mt-auto">Sponsor Hub</button>
                </div>

                {/* Level 3 */}
                <div className="card border-2 border-border-light bg-white hover:border-blue-500/50 flex flex-col items-start text-left p-10">
                    <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-light border border-border-light text-text-primary">
                        <Globe className="h-6 w-6" />
                    </div>
                    <div className="mb-2 text-[11px] font-black uppercase tracking-widest text-text-muted">Guardian Level</div>
                    <div className="text-3xl font-black text-text-primary mb-6">$100.00</div>
                    <p className="text-sm font-bold text-text-secondary mb-10 leading-relaxed">
                        For organizations and power users who depend on our zero-log architecture.
                    </p>
                    <button className="btn-secondary w-full mt-auto">Sponsor Hub</button>
                </div>
            </div>

            <div className="mt-24 p-12 text-center rounded-[32px] bg-text-primary text-white overflow-hidden relative group">
                {/* Abstract Visual Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-12 gap-0">
                    {[...Array(144)].map((_, i) => (
                        <div key={i} className="border-[0.5px] border-white/20 aspect-square"></div>
                    ))}
                </div>

                <h2 className="text-4xl font-black mb-6 relative z-10 tracking-tighter">Zero Strings. All Tech.</h2>
                <p className="max-w-xl mx-auto text-lg font-bold opacity-60 mb-12 relative z-10">
                    Sponsoring WorkToolsHub is a pure gift to the community. No features are gated, and no user is left behind. We build for everyone.
                </p>
                <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-blue-400 hover:text-blue-300 transition-colors relative z-10 group">
                    View Network Primitives <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                </Link>
            </div>
        </div>
    );
}
