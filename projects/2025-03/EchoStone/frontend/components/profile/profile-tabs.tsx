"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface ProfileTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
  createdCount: number
  executingCount: number
  completedCount: number
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  createdCount,
  executingCount,
  completedCount,
}: ProfileTabsProps) {
  return (
    <div className="border-b pb-2">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="created" className="flex items-center gap-2">
            Created
            <Badge variant="secondary" className="ml-1">
              {createdCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="executing" className="flex items-center gap-2">
            Executing
            <Badge variant="secondary" className="ml-1">
              {executingCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            Completed
            <Badge variant="secondary" className="ml-1">
              {completedCount}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

