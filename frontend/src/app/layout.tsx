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
          <footer className="border-t border-border-light py-16 dark:border-border-dark">
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
                <div className="text-xl font-bold tracking-tight text-text-primary dark:text-text-dark">
                  WorkToolsHub
                </div>
                <div className="flex gap-8 text-sm text-text-secondary dark:text-muted">
                  <a href="/legal?type=privacy" className="hover:text-text-primary dark:hover:text-text-dark">Privacy</a>
                  <a href="/legal?type=terms" className="hover:text-text-primary dark:hover:text-text-dark">Terms</a>
                  <a href="/donate" className="hover:text-text-primary dark:hover:text-text-dark">Donate</a>
                </div>
              </div>
              <div className="mt-8 text-center text-[13px] text-text-muted">
                © 2026 worktoolshub. tailored for professionals.
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}




