import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WorkToolsHub — Public Advanced Tools & AI RAG Workspace",
  description: "Advanced Web Tools and a Privacy-First AI RAG Workspace. No login required for tools.",
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
                <Link href="/tools">Tools</Link>
                <Link href="/workspace">Workspace</Link>
                <Link href="/donate">Donate</Link>
              </div>
              <div className="nav-actions">
                <Link href="/login" className="btn-login">Sign In</Link>
              </div>
            </div>
          </nav>
          <main>{children}</main>
          <footer className="section-padding">
            <div className="container">
              <p style={{ textAlign: 'center', fontSize: '14px', opacity: 0.6 }}>
                © 2026 WorkToolsHub. Built with Privacy in Mind.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

