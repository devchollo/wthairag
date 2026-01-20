'use client';

import { Heart, CreditCard, Shield, Zap, ArrowRight, ExternalLink, Terminal, Coffee } from 'lucide-react';
import Link from 'next/link';

export default function DonatePage() {
    const PAYPAL_LINK = "https://www.paypal.com/ncp/payment/HJJ5YPE9FKGQN";

    return (
        <div className="mx-auto max-w-[900px] px-6 py-12 sm:py-20 bg-white">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-border-light bg-blue-50/50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-8">
                    <Zap className="h-3 w-3" /> Sponsorship Protocol v1.0
                </div>
                <h1 className="text-6xl font-black tracking-tighter text-text-primary mb-6">
                    Fuel the Hub.
                </h1>
                <p className="text-xl font-bold leading-snug text-text-secondary">
                    Your sponsorship keeps our high-performance API nodes running, our data private, and our tools accessible to everyone.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <div className="card p-10 flex flex-col items-start bg-surface-light border-none shadow-none">
                    <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20">
                        <CreditCard size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-text-primary mb-3 tracking-tight">Direct Support</h3>
                    <p className="text-base font-bold text-text-secondary mb-8 leading-relaxed">
                        We use PayPal for secure, encrypted sponsorship. You can contribute any amount to help maintain our compute infrastructure.
                    </p>
                    <a
                        href={PAYPAL_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full py-4 gap-2 text-base"
                    >
                        Sponsor via PayPal
                        <ExternalLink size={16} />
                    </a>
                </div>

                <div className="card p-10 flex flex-col items-start border-border-light shadow-sm">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-border-light text-text-primary flex items-center justify-center mb-8">
                        <Shield size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-text-primary mb-3 tracking-tight">Zero-Log Ethics</h3>
                    <p className="text-base font-bold text-text-secondary leading-relaxed">
                        WorkToolsHub is built on a private-first architecture. We don't sell data, we don't track users, and we don't run ads. Sponsorship is what keeps us independent.
                    </p>
                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center">
                                    <div className="h-full w-full rounded-full bg-blue-500/10" />
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Join the core guardians</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: <Coffee size={18} />, title: "₱250+", desc: "Node maintenance" },
                    { icon: <Zap size={18} />, title: "₱1,250+", desc: "Compute resources" },
                    { icon: <Heart size={18} />, title: "₱5,000+", desc: "Full hub sponsorship" }
                ].map((tier, idx) => (
                    <div key={idx} className="p-6 rounded-2xl border border-border-light flex items-center gap-4 transition-all hover:border-blue-600/30">
                        <div className="text-blue-600">{tier.icon}</div>
                        <div>
                            <div className="text-xs font-black text-text-primary">{tier.title}</div>
                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{tier.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-20 pt-10 border-t border-border-light text-center">
                <p className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">
                    Transparency Protocol
                </p>
                <div className="max-w-md mx-auto flex items-center justify-center gap-8">
                    <div className="flex flex-col items-center">
                        <div className="text-xl font-black text-text-primary tracking-tighter">100%</div>
                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest">To Compute</div>
                    </div>
                    <div className="h-10 w-px bg-border-light" />
                    <div className="flex flex-col items-center">
                        <div className="text-xl font-black text-text-primary tracking-tighter">0%</div>
                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest">Tracking</div>
                    </div>
                    <div className="h-10 w-px bg-border-light" />
                    <div className="flex flex-col items-center">
                        <div className="text-xl font-black text-text-primary tracking-tighter">Public</div>
                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest">API Status</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
