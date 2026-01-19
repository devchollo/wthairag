import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WorkToolsHub — Advanced Public Tools & AI Workspace",
  description: "A unified suite of high-performance public tools and a private AI RAG workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <nav className="sticky-nav">
            <div className="container nav-content">
              <Link href="/" className="logo">WorkToolsHub</Link>
              <div className="nav-links">
                <Link href="/tools">tools</Link>
                <Link href="/workspace">workspace</Link>
                <Link href="/donate">donate</Link>
              </div>
              <div className="nav-actions">
                <Link href="/login" className="btn-login">sign in</Link>
              </div>
            </div>
          </nav>
          <main>{children}</main>
          <footer className="section-padding">
            <div className="container">
              <p style={{ textAlign: 'center', fontSize: '13px', opacity: 0.5, letterSpacing: '-0.02em' }}>
                © 2026 worktoolshub. designed for privacy.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}


