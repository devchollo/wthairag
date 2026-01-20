'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, Shield, Server, Search, Settings, Lock, Menu, X } from 'lucide-react';

const tools = [
    {
        category: "Security & SSL",
        items: [
            { name: "SSL Fortress", desc: "Enterprise-grade certificate analysis", icon: Shield, href: "/tools/ssl" },
            { name: "SSH Auditor", desc: "Key verification & security checks", icon: Lock, href: "/tools/ssh" }
        ]
    },
    {
        category: "DNS & Networking",
        items: [
            { name: "DNS Inspector", desc: "Global propagation tracking", icon: Server, href: "/tools/dns" },
            { name: "IP Locator", desc: "Global geodetic tracking", icon: Search, href: "/tools/ip" }
        ]
    }
];

export default function Navbar() {
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
        <nav className="sticky top-0 z-50 w-full border-b border-border-light bg-background-light/80 backdrop-blur-md dark:border-border-dark dark:bg-background-dark/80">
            <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-16">
                    <Link href="/" className="text-2xl font-black tracking-tighter text-text-primary hover:text-blue-600 transition-colors">
                        WorkToolsHub
                    </Link>

                    <div className="hidden items-center gap-8 lg:flex">
                        <div
                            className="relative py-4"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                className="flex items-center gap-2 text-[15px] font-black text-text-primary transition-colors hover:text-blue-600 outline-none"
                                aria-expanded={isToolsOpen}
                            >
                                Tools
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Mega Dropdown */}
                            {isToolsOpen && (
                                <div className="absolute left-[-100px] top-[100%] w-[600px] animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="mt-2 rounded-xl border border-border-light bg-white p-6 shadow-2xl shadow-black/10 dark:border-border-dark dark:bg-surface-dark">
                                        <div className="grid grid-cols-2 gap-8">
                                            {tools.map((section) => (
                                                <div key={section.category}>
                                                    <h4 className="mb-4 text-[13px] font-bold uppercase tracking-widest text-text-muted">
                                                        {section.category}
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {section.items.map((item) => (
                                                            <Link
                                                                key={item.name}
                                                                href={item.href}
                                                                className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-surface-light dark:hover:bg-border-dark"
                                                            >
                                                                <item.icon className="mt-1 h-5 w-5 text-primary" />
                                                                <div>
                                                                    <div className="text-[15px] font-bold text-text-primary dark:text-text-dark">
                                                                        {item.name}
                                                                    </div>
                                                                    <div className="text-sm text-text-secondary dark:text-muted">
                                                                        {item.desc}
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 border-t border-border-light pt-4 dark:border-border-dark">
                                            <Link href="/tools" className="text-sm font-bold text-primary hover:underline">
                                                View all tools →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link href="/workspace" className="text-[15px] font-black text-text-primary transition-colors hover:text-blue-600">
                            Dashboard
                        </Link>
                        <Link href="/donate" className="text-[15px] font-black text-text-primary transition-colors hover:text-blue-600">
                            Sponsorship
                        </Link>
                    </div>
                </div>

                <div className="hidden items-center gap-4 lg:flex">
                    <Link href="/login" className="btn-secondary h-10 px-6 text-sm">
                        Sign In
                    </Link>
                    <Link href="/signup" className="btn-primary h-10 px-6 text-sm">
                        Get Started
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="border-t border-border-light bg-background-light p-4 dark:border-border-dark dark:bg-background-dark lg:hidden">
                    <div className="space-y-4">
                        <div className="font-semibold text-text-muted">Tools</div>
                        <div className="grid grid-cols-1 gap-4 pl-4">
                            {tools.flatMap(s => s.items).map(item => (
                                <Link key={item.name} href={item.href} className="flex items-center gap-3">
                                    <item.icon className="h-5 w-5 text-primary" />
                                    <span className="font-medium text-text-primary dark:text-text-dark">{item.name}</span>
                                </Link>
                            ))}
                        </div>
                        <Link href="/workspace" className="block font-medium text-text-primary dark:text-text-dark">Workspace</Link>
                        <Link href="/donate" className="block font-medium text-text-primary dark:text-text-dark">Donate</Link>
                        <div className="flex flex-col gap-3 pt-4">
                            <Link href="/login" className="btn-secondary w-full">Sign In</Link>
                            <Link href="/signup" className="btn-primary w-full">Get Started</Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
