import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { QueryProvider } from './components/providers/query-provider';

const inter = Inter({
  subsets: ['latin'],
});

// 配置网站元数据
export const metadata: Metadata = {
  title: {
    default: 'AI Web3 Growth Journey',
    template: '%s | AI Web3 Growth Journey',
  },
  description: 'AI Web3 Growth Journey',
  keywords: ['AI Web3 Growth Journey', 'AI Web3', 'Web3', 'development', 'startup'],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  referrer: 'no-referrer',
  other: {
    'referrer': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <meta name="referrer" content="no-referrer" />
        <meta name="referrerpolicy" content="no-referrer" />
        <meta httpEquiv="referrer" content="no-referrer" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </RootProvider>
      </body>
    </html>
  );
}
