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
          <footer className="border-t border-border-light py-20 dark:border-border-dark bg-surface-light dark:bg-surface-dark">
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-between gap-12 sm:flex-row">
                <div className="text-2xl font-black tracking-tighter text-text-primary dark:text-text-dark">
                  WorkToolsHub
                </div>
                <div className="flex gap-10 text-sm font-bold text-text-secondary dark:text-muted">
                  <a href="/legal?type=privacy" className="hover:text-primary transition-colors">Privacy</a>
                  <a href="/legal?type=terms" className="hover:text-primary transition-colors">Terms</a>
                  <a href="/donate" className="hover:text-primary transition-colors">Donate</a>
                </div>
              </div>
              <div className="mt-12 text-center text-[13px] font-bold uppercase tracking-widest text-text-muted">
                © 2026 worktoolshub. tailored for professionals.
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}




