"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback } from "react"
import type { Task } from "@/lib/types"

type TaskModalContextType = {
  isCreateModalOpen: boolean
  isDetailModalOpen: boolean
  selectedTask: Task | null
  openCreateModal: () => void
  closeCreateModal: () => void
  openDetailModal: (task: Task) => void
  closeDetailModal: () => void
}

const TaskModalContext = createContext<TaskModalContextType>({
  isCreateModalOpen: false,
  isDetailModalOpen: false,
  selectedTask: null,
  openCreateModal: () => {},
  closeCreateModal: () => {},
  openDetailModal: () => {},
  closeDetailModal: () => {},
})

export const useTaskModal = () => useContext(TaskModalContext)

export function TaskModalProvider({ children }: { children: React.ReactNode }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const openCreateModal = useCallback(() => {
    console.log("Opening create modal")
    setIsCreateModalOpen(true)
  }, [])

  const closeCreateModal = useCallback(() => {
    console.log("Closing create modal")
    setIsCreateModalOpen(false)
  }, [])

  const openDetailModal = useCallback((task: Task) => {
    console.log("Opening detail modal for task:", task.index)
    setSelectedTask(task)
    setIsDetailModalOpen(true)
  }, [])

  const closeDetailModal = useCallback(() => {
    console.log("Closing detail modal")
    setIsDetailModalOpen(false)
    setSelectedTask(null)
  }, [])

  return (
    <TaskModalContext.Provider
      value={{
        isCreateModalOpen,
        isDetailModalOpen,
        selectedTask,
        openCreateModal,
        closeCreateModal,
        openDetailModal,
        closeDetailModal,
      }}
    >
      {children}
    </TaskModalContext.Provider>
  )
}

