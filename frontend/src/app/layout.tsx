import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Github, Twitter, Linkedin, Terminal } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WorkToolsHub — Modern AI & Public Utilities",
  description: "A professional workspace for modern engineers. Features AI RAG, DNS Debugging, SSL Audits, and high-performance developer utilities.",
  keywords: ["developer tools", "dns lookup", "ssl checker", "seo analysis", "ai rag", "engineering workspace"],
  authors: [{ name: "WorkToolsHub Engineering" }],
  creator: "WorkToolsHub",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://worktoolshub.com",
    title: "WorkToolsHub — The Modern Engineering Workspace",
    description: "Stateless, privacy-focused utilities for developers. DNS, SSL, AI, and more.",
    siteName: "WorkToolsHub",
    images: [
      {
        url: "https://worktoolshub.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "WorkToolsHub Dashboard Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkToolsHub — Developer Utilities & AI",
    description: "Engineering-grade tools for the modern web. Perform DNS lookups, SSL checks, and AI analysis in seconds.",
    images: ["https://worktoolshub.com/og-image.png"],
    creator: "@worktoolshub",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen bg-white">
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-400px)]">{children}</main>

          <footer className="border-t border-border-light bg-surface-light/30 pt-20 pb-12">
            <div className="mx-auto max-w-[1200px] px-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                {/* Brand Column */}
                <div className="col-span-2 lg:col-span-1">
                  <div className="text-xl font-black tracking-tighter text-text-primary mb-6">
                    WorkToolsHub.
                  </div>
                  <p className="text-xs font-bold text-text-muted leading-relaxed max-w-[200px]">
                    Engineering-grade utilities for modern dev teams. Stateless, private, and high-performance.
                  </p>
                  <div className="flex gap-4 mt-6">
                    <Github className="h-4 w-4 text-text-muted hover:text-blue-600 cursor-pointer transition-colors" />
                    <Twitter className="h-4 w-4 text-text-muted hover:text-blue-600 cursor-pointer transition-colors" />
                    <Linkedin className="h-4 w-4 text-text-muted hover:text-blue-600 cursor-pointer transition-colors" />
                  </div>
                </div>

                {/* Primitives Column */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text-primary mb-6">System Primitives</h4>
                  <ul className="space-y-4 text-[13px] font-bold text-text-muted">
                    <li><a href="/tools/dns" className="hover:text-blue-600 transition-colors">DNS Debugger</a></li>
                    <li><a href="/tools/ssl" className="hover:text-blue-600 transition-colors">TLS Audit</a></li>
                    <li><a href="/tools/password" className="hover:text-blue-600 transition-colors">Pass Generator</a></li>
                    <li><a href="/tools" className="hover:text-blue-600 transition-colors">All Utilities</a></li>
                  </ul>
                </div>

                {/* Platform Column */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text-primary mb-6">Intelligence Hub</h4>
                  <ul className="space-y-4 text-[13px] font-bold text-text-muted">
                    <li><a href="/workspace/chat" className="hover:text-blue-600 transition-colors">AI RAG Console</a></li>
                    <li><a href="/workspace/knowledge" className="hover:text-blue-600 transition-colors">Knowledge Vault</a></li>
                    <li><a href="/workspace/dashboard" className="hover:text-blue-600 transition-colors">Organization Overview</a></li>
                    <li><a href="/donate" className="hover:text-blue-600 transition-colors">Sponsorship Hub</a></li>
                  </ul>
                </div>

                {/* Legal Column */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text-primary mb-6">Governance</h4>
                  <ul className="space-y-4 text-[13px] font-bold text-text-muted">
                    <li><a href="/legal?type=privacy" className="hover:text-blue-600 transition-colors">Privacy Protocol</a></li>
                    <li><a href="/legal?type=terms" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                    <li><a href="/legal?type=security" className="hover:text-blue-600 transition-colors">Security Standards</a></li>
                    <li><a href="/legal?type=sla" className="hover:text-blue-600 transition-colors">SLA & Reliability</a></li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-border-light flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col gap-1.5 md:items-start items-center">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted text-center md:text-left">
                    © 2026 WORKTOOLSHUB. ENGINEERED FOR HIGH-FIDELITY WORKFLOWS.
                  </div>
                  <div className="text-[10px] font-bold text-text-muted">
                    Crafted by <a href="https://ksevillejo.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Kent Sevillejo</a>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  All Systems Operational
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
