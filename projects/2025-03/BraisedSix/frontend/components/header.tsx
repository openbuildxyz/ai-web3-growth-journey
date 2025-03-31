"use client"

import Link from "next/link"
import { ConnectWalletButton } from "./connect-wallet-button"
import { ModeToggle } from "./mode-toggle"
import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import { PlusCircle, User } from "lucide-react"
import { useTaskModal } from "@/components/task-modal-provider"
import { usePathname } from "next/navigation"

export function Header() {
  const { isConnected } = useWallet()
  const { openCreateModal } = useTaskModal()
  const pathname = usePathname()

  const handleCreateTask = () => {
    console.log("Create task button clicked")
    openCreateModal()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground">TM</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">TaskMarket</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-primary" : "text-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/profile" || pathname.startsWith("/profile/") ? "text-primary" : "text-foreground"
              }`}
            >
              My Profile
            </Link>
            <Link
              href="/explore"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/explore" ? "text-primary" : "text-foreground"
              }`}
            >
              Explore
            </Link>
            <Link
              href="/agent"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/agent" ? "text-primary" : "text-foreground"
              }`}
            >
              TaskAgent
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isConnected && (
            <>
              <Button onClick={handleCreateTask} variant="outline" size="sm" className="hidden md:flex">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Task
              </Button>
              <Link href="/profile" className="md:hidden">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}
          <ModeToggle />
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  )
}

