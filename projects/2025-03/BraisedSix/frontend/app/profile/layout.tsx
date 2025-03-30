"use client"

import type React from "react"
import { TransactionHistory } from "@/components/profile/transaction-history"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
        <div className="mt-8">
          <TransactionHistory />
        </div>
      </main>
    </div>
  )
}

