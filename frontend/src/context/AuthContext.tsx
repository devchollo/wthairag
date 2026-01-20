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
    loading: boolean;
    currentWorkspace: Workspace | null;
    setCurrentWorkspace: (workspace: Workspace | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${apiUrl}/api/auth/me`, {
                    credentials: 'include'
                });

                if (res.status === 401 || res.status === 403) {
                    // Silent fail for non-authenticated public users
                    setUser(null);
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.data.user);
                    const fetchedWorkspaces = data.data.memberships.map((m: any) => m.workspaceId);
                    setWorkspaces(fetchedWorkspaces);
                    if (fetchedWorkspaces.length > 0) {
                        setCurrentWorkspace(fetchedWorkspaces[0]);
                    }
                } else {
                    setUser(null);
                }
            } catch (e) {
                // Silent fail
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    const login = (data: { user: User; memberships: { workspaceId: Workspace }[] }) => {
        setUser(data.user);
        setWorkspaces(data.memberships.map((m) => m.workspaceId));
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
    };

    return (
        <AuthContext.Provider value={{ user, workspaces, login, logout, loading, currentWorkspace, setCurrentWorkspace }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
