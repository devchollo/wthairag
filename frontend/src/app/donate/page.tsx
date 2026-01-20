'use client';

import { Heart, Coffee, Globe, Shield, Zap, ArrowRight, MessageSquare, Fuel } from 'lucide-react';
import Link from 'next/link';

export default function DonatePage() {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-24">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-black text-primary mb-8">
                    <Heart className="h-4 w-4 fill-current" /> Fuel Indepedent Development
                </div>
                <h1 className="text-5xl font-black tracking-tighter text-text-primary mb-8">
                    Help us keep the web <br /> <span className="text-primary italic">open and stateless.</span>
                </h1>
                <p className="text-xl font-bold leading-relaxed text-text-secondary">
                    WorkToolsHub is 100% self-funded. We don't sell data, we don't show ads, and we don't have venture capital. Your contributions directly pay for the server nodes and API tokens that keep these tools free for everyone.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Option 1 */}
                <div className="card flex flex-col items-center text-center hover:border-primary/50">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-light border-2 border-border-light text-text-primary">
                        <Coffee className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-black text-text-primary mb-3">Buy a Coffee</h3>
                    <div className="text-4xl font-black text-primary mb-6">$5</div>
                    <p className="text-sm font-bold text-text-secondary mb-10 leading-relaxed">
                        A small token of appreciation that covers the cost of roughly 1,000 DNS lookups.
                    </p>
                    <button className="btn-primary w-full mt-auto">Support Project</button>
                </div>

                {/* Option 2 */}
                <div className="card flex flex-col items-center text-center border-primary bg-primary/5 shadow-xl">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
                        <Fuel className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-black text-text-primary mb-3">Fuel the Nodes</h3>
                    <div className="text-4xl font-black text-primary mb-6">$25</div>
                    <p className="text-sm font-bold text-text-secondary mb-10 leading-relaxed">
                        Contribute to our monthly infrastructure bill and help us expand to new global regions.
                    </p>
                    <button className="btn-primary w-full mt-auto">Support Project</button>
                </div>

                {/* Option 3 */}
                <div className="card flex flex-col items-center text-center hover:border-primary/50">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-light border-2 border-border-light text-text-primary">
                        <Zap className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-black text-text-primary mb-3">Deep Support</h3>
                    <div className="text-4xl font-black text-primary mb-6">$100</div>
                    <p className="text-sm font-bold text-text-secondary mb-10 leading-relaxed">
                        For those who use WorkToolsHub daily and want to ensure its long-term survival.
                    </p>
                    <button className="btn-primary w-full mt-auto">Support Project</button>
                </div>
            </div>

            <div className="mt-24 card bg-text-primary text-white p-12 text-center border-none">
                <MessageSquare className="mx-auto h-12 w-12 text-primary mb-6" />
                <h2 className="text-3xl font-black mb-6">Transparency Matters</h2>
                <p className="max-w-2xl mx-auto text-lg font-bold opacity-80 mb-10">
                    Donating does not unlock extra features. We believe professional utilities should be accessible to everyone regardless of their ability to pay. Your support is a pure gift to the community.
                </p>
                <div className="flex justify-center gap-8">
                    <Link href="/tools" className="text-sm font-black text-white hover:text-primary transition-colors flex items-center gap-2">
                        Back to Tools <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
