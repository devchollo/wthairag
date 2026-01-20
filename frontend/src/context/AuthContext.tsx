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

interface Membership {
    workspaceId: Workspace;
    role: 'owner' | 'admin' | 'member' | 'viewer';
}

interface AuthContextType {
    user: User | null;
    workspaces: Workspace[];
    memberships: Membership[];
    login: (data: { user: User; memberships: Membership[] }) => void;
    logout: () => void;
    loading: boolean;
    currentWorkspace: Workspace | null;
    setCurrentWorkspace: (workspace: Workspace | null) => void;
    userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
    const [loading, setLoading] = useState(true);

    const userRole = currentWorkspace ? memberships.find(m => m.workspaceId._id === currentWorkspace._id)?.role || null : null;
    const workspaces = memberships.map(m => m.workspaceId);

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
                    setMemberships(data.data.memberships);
                    if (data.data.memberships.length > 0) {
                        setCurrentWorkspace(data.data.memberships[0].workspaceId);
                    }
                } else {
                    setUser(null);
                    setMemberships([]);
                }
            } catch (e) {
                // Silent fail
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    const login = (data: { user: User; memberships: Membership[] }) => {
        setUser(data.user);
        setMemberships(data.memberships);
        if (data.memberships.length > 0) {
            setCurrentWorkspace(data.memberships[0].workspaceId);
        }
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
        setMemberships([]);
        setCurrentWorkspace(null);
    };

    return (
        <AuthContext.Provider value={{ user, workspaces, memberships, login, logout, loading, currentWorkspace, setCurrentWorkspace, userRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
