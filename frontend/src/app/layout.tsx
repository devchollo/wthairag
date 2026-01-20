import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WorkToolsHub — Universal Utilities & AI Workspace",
  description: "A world-class suite of high-performance public tools and a private AI RAG workspace.",
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
          <nav className="sticky-nav glass">
            <div className="nav-content">
              <Link href="/" className="logo">WorkToolsHub</Link>
              <div className="nav-links">
                <Link href="/tools">tools</Link>
                <Link href="/workspace">workspace</Link>
                <Link href="/donate">donate</Link>
              </div>
              <div>
                <Link href="/login" className="btn-primary" style={{ height: '40px', padding: '0 20px', fontSize: '14px' }}>
                  Sign In
                </Link>
              </div>
            </div>
          </nav>
          <main style={{ minHeight: '100vh' }}>{children}</main>
          <footer className="section-padding">
            <div className="container">
              <p style={{ textAlign: 'center', fontSize: '14px', opacity: 0.4, fontWeight: 500 }}>
                © 2026 worktoolshub. engineered for privacy.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}



