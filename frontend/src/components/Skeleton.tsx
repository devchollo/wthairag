import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div className={`animate-pulse rounded-md bg-zinc-200 ${className}`} />
    );
};

export const DashboardSkeleton = () => (
    <div className="space-y-8">
        <div className="h-8 w-48 bg-zinc-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="card p-5 h-32" />
            ))}
        </div>
        <div className="card p-6 h-64" />
    </div>
);

export const KnowledgeSkeleton = () => (
    <div className="flex flex-col gap-8">
        <div className="h-8 w-64 bg-zinc-200 animate-pulse rounded-lg" />
        <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="card h-20 p-5" />
            ))}
        </div>
    </div>
);

export const AlertsSkeleton = () => (
    <div className="space-y-6">
        <div className="h-8 w-48 bg-zinc-200 animate-pulse rounded-lg" />
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="card h-16 p-4" />
            ))}
        </div>
    </div>
);
