import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WorkToolsHub — Modern AI & Public Utilities",
  description: "A calm, professional workspace for modern web professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-background-light transition-colors duration-200 dark:bg-background-dark">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="border-t border-border-light py-24 bg-white">
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-between gap-12 sm:flex-row">
                <div className="text-3xl font-black tracking-tighter text-text-primary">
                  WorkToolsHub.
                </div>
                <div className="flex gap-10 text-[13px] font-black uppercase tracking-widest text-text-secondary">
                  <a href="/legal?type=privacy" className="hover:text-blue-600 transition-colors">Protocol</a>
                  <a href="/legal?type=terms" className="hover:text-blue-600 transition-colors">Terms</a>
                  <a href="/donate" className="hover:text-blue-600 transition-colors">Sponsorship</a>
                </div>
              </div>
              <div className="mt-16 text-center text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-50">
                © 2026 WORKTOOLSHUB. ENGINEERED FOR PROFESSIONALS.
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}




