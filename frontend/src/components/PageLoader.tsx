import { Terminal } from 'lucide-react';

interface PageLoaderProps {
    title?: string;
    subtitle?: string;
}

export default function PageLoader({
    title = 'Loading',
    subtitle = 'Preparing your workspace...',
}: PageLoaderProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-blue-50">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-blue-100 bg-white px-8 py-10 text-center shadow-xl shadow-blue-100/60">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-blue-200 blur-xl opacity-40" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
                        <Terminal className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                </div>
                <div>
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                        {title}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-text-muted">
                        {subtitle}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-300" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:300ms]" />
                </div>
            </div>
        </div>
    );
}
