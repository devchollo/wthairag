'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Workspace {
    _id: string;
    name: string;
    slug: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    isAdmin?: boolean;
}

interface AuthContextType {
    user: User | null;
    workspaces: Workspace[];
    login: (data: { user: User; memberships: { workspaceId: Workspace }[] }) => void;
    logout: () => void;
    currentWorkspace: Workspace | null;
    setCurrentWorkspace: (workspace: Workspace | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

    useEffect(() => {
        const verifySession = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${apiUrl}/api/auth/me`, {
                    credentials: 'include'
                });

                if (res.status === 401 || res.status === 403) {
                    // Silent fail for non-authenticated public users
                    localStorage.removeItem('user');
                    setUser(null);
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.data.user);
                    setWorkspaces(data.data.memberships.map((m: any) => m.workspaceId));
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                } else {
                    localStorage.removeItem('user');
                    setUser(null);
                }
            } catch (e) {
                // Silent fail to avoid polluting console for public users
            }
        };

        verifySession();
    }, []);

    const login = (data: { user: User; memberships: { workspaceId: Workspace }[] }) => {
        setUser(data.user);
        setWorkspaces(data.memberships.map((m) => m.workspaceId));
        localStorage.setItem('user', JSON.stringify(data.user));
        // Cookie is handled by browser automatically
    };

    const logout = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await fetch(`${apiUrl}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {
            console.error("Logout error", e);
        }

        setUser(null);
        setWorkspaces([]);
        setCurrentWorkspace(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, workspaces, login, logout, currentWorkspace, setCurrentWorkspace }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
