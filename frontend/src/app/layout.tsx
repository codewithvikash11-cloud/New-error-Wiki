import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import { AuthProvider } from "@/components/auth-context";
import AuthModal from "@/components/auth-modal";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ErrorWiki - Find Fixes Fast",
  description: "AI-generated, unique, and professional solutions for programming errors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-140px)]">
              {children}
            </main>
            <footer className="border-t bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 py-8 relative z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 md:mb-0">
                  © {new Date().getFullYear()} ErrorWiki. All rights reserved.
                </p>
                <div className="flex gap-6">
                  <Link href="/about" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">About ErrorWiki</Link>
                  <Link href="/privacy" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Privacy Policy</Link>
                  <Link href="/terms" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Terms of Service</Link>
                </div>
              </div>
            </footer>
            <AuthModal />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
