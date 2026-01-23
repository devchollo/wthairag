'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminIndexPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) {
            return;
        }

        if (user?.isAdmin) {
            router.replace('/admin/dashboard');
        } else {
            router.replace('/admin/login');
        }
    }, [loading, user, router]);

    return null;
}
