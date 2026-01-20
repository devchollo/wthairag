'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ChevronDown, Shield, Server, Search, Settings, Lock, Menu, X, Database, Terminal, Globe, Key, QrCode, ArrowRight, MessageSquare, Network, Send, LogOut } from 'lucide-react';

const toolSections = [
    {
        category: "Infrastructure",
        items: [
            { name: "DNS Debugger", desc: "Global resolution logs", icon: Globe, href: "/tools/dns" },
            { name: "WHOIS Lookup", desc: "Domain registration data", icon: Search, href: "/tools/whois" },
            { name: "Hosting Provider", desc: "Origin IP & ASN", icon: Server, href: "/tools/hosting" },
            { name: "TLS Chain Audit", desc: "SSL integrity checks", icon: Shield, href: "/tools/ssl" },
            { name: "IP Analyzer", desc: "Network intelligence", icon: Network, href: "/tools/ip" }
        ]
    },
    {
        category: "AI & SEO",
        items: [
            { name: "SEO Analysis", desc: "Technical site audit", icon: Search, href: "/tools/seo" },
            { name: "AEO Checker", desc: "Answer engine optimization", icon: MessageSquare, href: "/tools/aeo" },
            { name: "GEO Checker", desc: "AI visibility signals", icon: Globe, href: "/tools/geo" },
            { name: "AIO Checker", desc: "LLM readiness scores", icon: Database, href: "/tools/aio" }
        ]
    },
    {
        category: "Utilities & Files",
        items: [
            { name: "Entropy Generator", desc: "Secure key generation", icon: Key, href: "/tools/password" },
            { name: "Payload Encoder", desc: "High-density QR encoding", icon: QrCode, href: "/tools/qr" },
            { name: "JSON Validator", desc: "Data schema audits", icon: Terminal, href: "/tools/json-schema" },
            { name: "Webhook Debugger", desc: "API payload testing", icon: Send, href: "/tools/webhook" }
        ]
    }
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsToolsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsToolsOpen(false);
        }, 150);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border-light bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between px-6">
                <div className="flex items-center gap-12">
                    <Link href="/" className="text-xl font-bold tracking-tighter text-text-primary hover:text-blue-600 transition-colors">
                        WorkToolsHub.
                    </Link>

                    <div className="hidden items-center gap-6 lg:flex">
                        <div
                            className="relative py-4"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                className="flex items-center gap-1.5 text-[13px] font-semibold text-text-primary transition-colors hover:text-blue-600 outline-none"
                            >
                                Tools
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Mega Dropdown */}
                            {isToolsOpen && (
                                <div className="absolute left-[-50px] top-[100%] w-[900px] animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="mt-1 rounded-xl border border-border-light bg-white p-6 shadow-2xl shadow-black/10">
                                        <div className="grid grid-cols-3 gap-8">
                                            {toolSections.map((section) => (
                                                <div key={section.category}>
                                                    <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                                        {section.category}
                                                    </h4>
                                                    <div className="space-y-1">
                                                        {section.items.map((item) => (
                                                            <Link
                                                                key={item.name}
                                                                href={item.href}
                                                                onClick={() => setIsToolsOpen(false)}
                                                                className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-surface-light border border-transparent hover:border-border-light"
                                                            >
                                                                <item.icon className="mt-0.5 h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                                                                <div>
                                                                    <div className="text-[13px] font-semibold text-text-primary">
                                                                        {item.name}
                                                                    </div>
                                                                    <div className="text-[11px] font-bold text-text-muted leading-tight">
                                                                        {item.desc}
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-5 border-t border-border-light">
                                            <Link
                                                href="/tools"
                                                onClick={() => setIsToolsOpen(false)}
                                                className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                                            >
                                                View all system primitives <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link href="/workspace" className="text-[13px] font-semibold text-text-primary transition-colors hover:text-blue-600">
                            Dashboard
                        </Link>
                        <Link href="/donate" className="text-[13px] font-semibold text-text-primary transition-colors hover:text-blue-600">
                            Sponsorship
                        </Link>
                    </div>
                </div>

                <div className="hidden items-center gap-3 lg:flex">
                    {!user ? (
                        <>
                            <Link href="/login" className="btn-secondary h-9 px-4 text-[12px]">
                                Sign In
                            </Link>
                            <Link href="/signup" className="btn-primary h-9 px-4 text-[12px]">
                                Get Started
                            </Link>
                        </>
                    ) : (
                        <button
                            onClick={() => logout()}
                            className="btn-secondary h-9 px-4 text-[12px] flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                        </button>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden text-text-primary"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="border-t border-border-light bg-white p-6 lg:hidden max-h-[80vh] overflow-y-auto">
                    <div className="space-y-8">
                        {toolSections.map(section => (
                            <div key={section.category}>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-4">{section.category}</div>
                                <div className="grid grid-cols-1 gap-4 pl-2">
                                    {section.items.map(item => (
                                        <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                                            <item.icon className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-semibold text-text-primary">{item.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="pt-2 border-t border-border-light">
                            <Link href="/tools" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600">
                                View all primitives <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-border-light">
                            <Link href="/workspace" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-black text-text-primary">Dashboard</Link>
                            <Link href="/donate" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-black text-text-primary">Sponsorship</Link>
                        </div>
                        <div className="flex flex-col gap-2 pt-4">
                            {!user ? (
                                <>
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-secondary w-full">Sign In</Link>
                                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary w-full">Get Started</Link>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="btn-secondary w-full flex items-center justify-center gap-2 text-red-600 border-red-100"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
