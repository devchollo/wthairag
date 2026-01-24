'use client';

import { Terminal } from 'lucide-react';

type PageLoaderProps = {
    title?: string;
    subtitle?: string;
};

export default function PageLoader({
    title = 'Loading your workspace',
    subtitle = 'Preparing secure session and navigation...',
}: PageLoaderProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-blue-50 to-white px-6">
            <div className="w-full max-w-sm rounded-2xl border border-blue-100 bg-white/80 p-8 text-center shadow-xl shadow-blue-100/70 backdrop-blur">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                    <Terminal className="h-6 w-6 animate-pulse" />
                </div>
                <h1 className="mt-4 text-lg font-black text-text-primary">{title}</h1>
                <p className="mt-2 text-xs font-semibold text-text-muted">{subtitle}</p>
                <div className="mt-6">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
                        <div className="loading-bar h-full w-1/2 rounded-full bg-blue-600" />
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300" />
                    </div>
                </div>
            </div>
        </div>
    );
}