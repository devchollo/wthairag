'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function WorkspacePage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect authenticated users to dashboard
        if (user) {
            router.push('/workspace/dashboard');
        } else {
            // Redirect unauthenticated users to login page
            router.push('/login');
        }
    }, [user, router]);

    // Show nothing while redirecting
    return null;
}
