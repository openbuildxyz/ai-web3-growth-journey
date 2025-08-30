import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { WalletProvider } from '@/hooks/useWallet';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ModelForge',
  description: 'AI Model Registry and Deployment Platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
