"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, Filter, User, Users } from "lucide-react"

type FilterOption = {
  id: string
  label: string
  icon: React.ReactNode
}

export function TaskFilters({
  currentFilter,
  onFilterChange,
}: {
  currentFilter: string
  onFilterChange: (filter: string) => void
}) {
  const filters: FilterOption[] = [
    { id: "all", label: "All Tasks", icon: <Filter className="h-4 w-4 mr-2" /> },
    { id: "open", label: "Open Tasks", icon: <Users className="h-4 w-4 mr-2" /> },
    { id: "pending", label: "In Progress", icon: <Clock className="h-4 w-4 mr-2" /> },
    { id: "finished", label: "Completed", icon: <CheckCircle2 className="h-4 w-4 mr-2" /> },
    { id: "my-created", label: "My Created", icon: <User className="h-4 w-4 mr-2" /> },
    { id: "my-tasks", label: "My Tasks", icon: <User className="h-4 w-4 mr-2" /> },
  ]

  return (
    <Card className="w-full md:w-64">
      <CardHeader className="pb-3">
        <CardTitle>Filters</CardTitle>
        <CardDescription>Filter tasks by status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={currentFilter === filter.id ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.icon}
            {filter.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

