'use client';

import { Heart, Coffee, Fuel, Zap, ArrowRight, MessageSquare, Terminal, Globe } from 'lucide-react';
import Link from 'next/link';

export default function DonatePage() {
    return (
        <div className="mx-auto max-w-[900px] px-4 py-12 sm:py-16 bg-white">
            <div className="text-center max-w-xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-border-light bg-surface-light px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-6">
                    Sponsorship Protocol
                </div>
                <h1 className="text-5xl font-black tracking-tighter text-text-primary mb-6">
                    Sponsor the Hub.
                </h1>
                <p className="text-lg font-bold leading-snug text-text-secondary">
                    Fuel the independent development of our AI RAG pipeline and public network primitives. Every contribution directly pays for the compute nodes.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Level 1 */}
                <div className="card flex flex-col items-start text-left p-8">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-light border border-border-light text-text-primary font-black">
                        ₱
                    </div>
                    <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-text-muted">Byte Level</div>
                    <div className="text-3xl font-black text-text-primary mb-4">₱250</div>
                    <p className="text-sm font-bold text-text-secondary mb-8 leading-relaxed">
                        Covers roughly 5,000 DNS lookups across our global resolver nodes.
                    </p>
                    <button className="btn-secondary w-full mt-auto">Sponsor</button>
                </div>

                {/* Level 2 */}
                <div className="card shadow-xl shadow-blue-500/5 border-blue-600/20 bg-white flex flex-col items-start text-left p-8">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-black">
                        ₱
                    </div>
                    <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-blue-600">Core Level</div>
                    <div className="text-3xl font-black text-text-primary mb-4">₱1,250</div>
                    <p className="text-sm font-bold text-text-secondary mb-8 leading-relaxed">
                        Directly fuels our monthly RAG embedding compute and TLS diagnostic nodes.
                    </p>
                    <button className="btn-primary w-full mt-auto">Sponsor</button>
                </div>

                {/* Level 3 */}
                <div className="card flex flex-col items-start text-left p-8">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-light border border-border-light text-text-primary font-black">
                        ₱
                    </div>
                    <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-text-muted">Guardian Level</div>
                    <div className="text-3xl font-black text-text-primary mb-4">₱5,000</div>
                    <p className="text-sm font-bold text-text-secondary mb-8 leading-relaxed">
                        For organizations who rely on our zero-log architecture for their daily workflow.
                    </p>
                    <button className="btn-secondary w-full mt-auto">Sponsor</button>
                </div>
            </div>

            <div className="mt-16 card bg-text-primary text-white p-10 text-center border-none">
                <h2 className="text-3xl font-black mb-4 tracking-tighter">Transparency First.</h2>
                <p className="max-w-md mx-auto text-base font-bold opacity-70 mb-8 leading-relaxed">
                    Sponsorship is a gift. We believe AI and network tools should be accessible to everyone regardless of financial status.
                </p>
                <Link href="/tools" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300">
                    Back to Terminal <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
