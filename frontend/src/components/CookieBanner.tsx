'use client';

import { useState, useEffect } from 'react';
import { X, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 z-50 md:left-auto md:right-6 md:w-[400px] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl font-bold"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10">
                            <ShieldCheck className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white tracking-tight">Cookie Protocol.</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Privacy Enhancement</p>
                        </div>
                    </div>

                    <p className="text-xs font-bold text-zinc-400 leading-relaxed mb-6">
                        We use technical cookies to maintain secure sessions and optimize your RAG console performance. No intrusive trackers, just pure utility.
                    </p>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleAccept}
                            className="flex-1 h-10 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            Accept Policy <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
