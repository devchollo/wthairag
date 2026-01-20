import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Github, Twitter, Linkedin, Terminal } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WorkToolsHub — Modern AI & Public Utilities",
  description: "A professional workspace for modern engineers. AI RAG, DNS, and Security primitives.",
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
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                  © 2026 WORKTOOLSHUB. ENGINEERED FOR HIGH-FIDELITY WORKFLOWS.
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
