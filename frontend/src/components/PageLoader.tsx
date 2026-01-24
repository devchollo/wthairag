import { Terminal } from 'lucide-react';

interface PageLoaderProps {
    label?: string;
    hint?: string;
}

export default function PageLoader({
    label = 'Loading your workspace',
    hint = 'Checking your session and preparing the dashboard.',
}: PageLoaderProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-white to-blue-50 px-6">
            <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-blue-100 bg-white/90 px-6 py-8 text-center shadow-xl shadow-blue-200/30 backdrop-blur">
                <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                        <Terminal className="h-6 w-6" />
                    </div>
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-black tracking-tight text-text-primary">{label}</p>
                    <p className="text-xs font-semibold text-text-muted">{hint}</p>
                </div>
                <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-600/80 animate-bounce [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-blue-600/70 animate-bounce [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 rounded-full bg-blue-600/60 animate-bounce" />
                </div>
            </div>
        </div>
    );
}