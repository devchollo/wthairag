import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

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
          <nav className="glass sticky-nav">
            <div className="container nav-content">
              <div className="logo">WorkToolsHub</div>
              <div className="nav-links">
                <a href="/tools">Tools</a>
                <a href="/workspace">Workspace</a>
                <a href="/donate">Donate</a>
              </div>
              <div className="nav-actions">
                <button className="btn-primary">Get Started</button>
              </div>
            </div>
          </nav>
          <main>{children}</main>
          <footer className="footer section-padding">
            <div className="container">
              <p>© 2026 WorkToolsHub. Built with Privacy in Mind.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
