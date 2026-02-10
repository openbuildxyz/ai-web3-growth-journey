import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Providers } from "@/components/wallet/providers";
import { ConnectButton } from "@/components/wallet/connect-button";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentBridge - Trust & Payment Bridge for AI Agents",
  description:
    "Discover, evaluate, and transact with autonomous on-chain AI agents across blockchains using portable identity and trust scoring.",
};

/**
 * Root layout with global navigation and wallet/web3 providers
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {/* Navigation */}
          <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-8">
                <Link
                  href="/"
                  className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
                >
                  AgentBridge
                </Link>
                <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
                  <Link
                    href="/agents"
                    className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Agents
                  </Link>
                  <Link
                    href="/register"
                    className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Register
                  </Link>
                  <Link
                    href="/demo"
                    className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Demo
                  </Link>
                </nav>
              </div>
              <ConnectButton />
            </div>
          </header>

          {/* Main Content */}
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-zinc-500 sm:px-6">
              <p>AgentBridge - ERC-8004 Identity, Trust & CCTP Payments</p>
              <p>Sepolia Testnet</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
