'use client';

import { Heart, Coffee, Shield, Zap, ArrowRight, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function DonatePage() {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary mb-6">
                    <Heart className="h-4 w-4 fill-current" /> Support the Vision
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl dark:text-text-dark">
                    Help us keep the web <span className="text-primary">stateless.</span>
                </h1>
                <p className="mt-6 text-lg font-medium leading-relaxed text-text-secondary dark:text-muted">
                    WorkToolsHub is a self-funded project dedicated to providing privacy-first utilities for professionals. Your support helps us maintain server infrastructure and remain ad-free forever.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Tier 1 */}
                <div className="card flex flex-col items-center text-center">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-light border-2 border-border-light text-text-secondary dark:bg-surface-dark dark:border-border-dark dark:text-muted">
                        <Coffee className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary dark:text-text-dark mb-2">Backer</h3>
                    <div className="text-3xl font-extrabold text-text-primary dark:text-text-dark mb-4">$5 / mo</div>
                    <p className="text-sm font-bold text-text-secondary dark:text-muted mb-8">
                        Buy us a coffee and keep the servers humming.
                    </p>
                    <button className="btn-secondary w-full mt-auto">Support Now</button>
                </div>

                {/* Tier 2 */}
                <div className="card flex flex-col items-center text-center border-primary/20 bg-primary/[0.02] relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary px-4 py-1 text-[11px] font-black text-white uppercase tracking-widest rounded-bl-xl">
                        Popular
                    </div>
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Zap className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary dark:text-text-dark mb-2">Power User</h3>
                    <div className="text-3xl font-extrabold text-text-primary dark:text-text-dark mb-4">$15 / mo</div>
                    <p className="text-sm font-bold text-text-secondary dark:text-muted mb-8">
                        Increased token limits for AI RAG and priority feature requests.
                    </p>
                    <button className="btn-primary w-full mt-auto">Support Now</button>
                </div>

                {/* Tier 3 */}
                <div className="card flex flex-col items-center text-center">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-light border-2 border-border-light text-text-secondary dark:bg-surface-dark dark:border-border-dark dark:text-muted">
                        <Shield className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary dark:text-text-dark mb-2">Guardian</h3>
                    <div className="text-3xl font-extrabold text-text-primary dark:text-text-dark mb-4">$50 / mo</div>
                    <p className="text-sm font-bold text-text-secondary dark:text-muted mb-8">
                        For organizations who value our commitment to zero-log privacy.
                    </p>
                    <button className="btn-secondary w-full mt-auto">Support Now</button>
                </div>
            </div>

            <div className="mt-24 rounded-3xl bg-surface-dark p-12 text-center text-white">
                <MessageSquare className="mx-auto h-12 w-12 text-primary mb-6" />
                <h2 className="text-3xl font-bold mb-4">Other ways to help?</h2>
                <p className="max-w-xl mx-auto text-text-muted font-medium mb-8">
                    If you can't support us financially, sharing WorkToolsHub with your network or providing feedback is just as valuable.
                </p>
                <div className="flex justify-center gap-6">
                    <Link href="/tools" className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
                        Browse Tools <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
