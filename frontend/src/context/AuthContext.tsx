'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Workspace {
    name: string;
    slug: string;
}

interface User {
    name: string;
    email: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    workspaces: Workspace[];
    login: (data: { user: User; token: string; memberships: { workspaceId: Workspace }[] }) => void;
    logout: () => void;
    currentWorkspace: Workspace | null;
    setCurrentWorkspace: (workspace: Workspace | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        }
        return null;
    });
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

    useEffect(() => {
        // Initial workspaces load could go here if persistent
    }, []);

    const login = (data: { user: User; token: string; memberships: { workspaceId: Workspace }[] }) => {
        setUser(data.user);
        setWorkspaces(data.memberships.map((m) => m.workspaceId));
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
    };

    const logout = () => {
        setUser(null);
        setWorkspaces([]);
        setCurrentWorkspace(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
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
