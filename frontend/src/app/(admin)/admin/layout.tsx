'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PageLoader from '@/components/PageLoader';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isLoginRoute = pathname === '/admin/login';

    useEffect(() => {
        if (loading) {
            return;
        }

        // If not logged in, redirect to login
        if (!user) {
            if (!isLoginRoute) {
                router.replace('/admin/login');
            }
            return;
        }

        if (!user.isOwner) {
            if (!isLoginRoute) {
                router.replace('/admin/login');
            }
            return;
        }

        if (isLoginRoute) {
            router.replace('/admin/dashboard');
        }
    }, [user, loading, isLoginRoute, router]);

    if (isLoginRoute) {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <PageLoader
                title="Validating admin access"
                subtitle="Confirming elevated permissions..."
            />
        );
    }

    if (!user || !user.isOwner) {
        return null; // Don't render until authorized
    }

    return (
        <div className="min-h-screen bg-surface-light">
            {children}
        </div>
    );
}
