import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/business/Header'
import QueryProvider from '@/lib/providers/QueryProvider'

import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'

const fira = localFont({
  src: './fonts/FiraSans-Regular.ttf',
  variable: '--font-fira',
})

export const metadata: Metadata = {
  title: 'Agent Market',
  description: 'Agent Market',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="no-scrollbar">
      <body
        className={`${fira.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <main className="p-6 hex-pattern">
            <Header />
            <QueryProvider>{children}</QueryProvider>
          </main>
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  )
}
