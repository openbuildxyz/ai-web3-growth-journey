"use client"

import "@/app/globals.css"
import { ContractsProvider } from "@/components/contracts-provider"
import { Header } from "@/components/header"
import { TaskModalProvider } from "@/components/task-modal-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { WalletProvider } from "@/components/wallet-provider"
import { Inter } from "next/font/google"
import type React from "react"
import { useEffect, useState } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {mounted && (
            <WalletProvider>
              <ContractsProvider>
                <TaskModalProvider>
                  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
                    <Header />
                    {children}
                  </div>
                </TaskModalProvider>
              </ContractsProvider>
            </WalletProvider>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
