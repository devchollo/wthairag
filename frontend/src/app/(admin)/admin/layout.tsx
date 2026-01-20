'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If not logged in, redirect to login
        if (!user) {
            router.push('/admin/login');
        } else if (!user.isAdmin) {
            // If not admin, redirect to dashboard (or somewhere else)
            router.push('/workspace/dashboard');
        }
    }, [user, router]);

    if (!user || !user.isAdmin) {
        return null; // Don't render until authorized
    }

    return (
        <div className="min-h-screen bg-surface-light">
            {children}
        </div>
    );
}
