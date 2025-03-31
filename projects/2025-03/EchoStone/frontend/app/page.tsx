"use client"

import { useEffect, useState } from "react"
import { TaskDashboard } from "@/components/task-dashboard"
import { CreateTaskModal } from "@/components/create-task-modal"
import { TaskDetailModal } from "@/components/task-detail-modal"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration errors by only rendering client components after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <TaskDashboard />
      </main>
      {/* 这些模态框组件会在每个页面都需要 */}
      <CreateTaskModal />
      <TaskDetailModal />
    </div>
  )
}

