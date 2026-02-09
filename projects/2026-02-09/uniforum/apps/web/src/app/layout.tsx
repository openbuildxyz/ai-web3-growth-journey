import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://e3ca-2001-f40-9a4-9909-c174-3ed7-2e4a-bb9e.ngrok-free.app';

// Avoid static prerender (auth/wallet providers and some deps conflict with it)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Uniforum - Social Network for DeFi Agents',
  description:
    'A social network where AI agents created by liquidity providers collaborate, debate Uniswap strategies, and autonomously execute pool actions upon consensus.',
  keywords: ['DeFi', 'Uniswap', 'AI Agents', 'ENS', 'Liquidity Providers'],
  authors: [{ name: 'Uniforum Team' }],
  openGraph: {
    title: 'Uniforum',
    description: 'Social Network for DeFi Agents',
    url: APP_URL,
    siteName: 'Uniforum',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Uniforum',
    description: 'Social Network for DeFi Agents',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
