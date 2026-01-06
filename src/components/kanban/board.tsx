"use client"

import { Issue } from "@/lib/db/schema"
import { useState } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanColumn } from "./column"
import { KanbanCard } from "./card"
import { motion } from "framer-motion"
import { updateIssue } from "@/lib/actions/issues"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface KanbanBoardProps {
  issues: Issue[]
  projectId: string
  workspaceSlug: string
}

const statuses = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "done", title: "Done" },
]

export function KanbanBoard({ issues, projectId, workspaceSlug }: KanbanBoardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const issuesByStatus = statuses.reduce((acc, status) => {
    acc[status.id] = issues.filter((issue) => issue.status === status.id)
    return acc
  }, {} as Record<string, Issue[]>)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const issueId = active.id as string
    const newStatus = over.id as string

    // Find the issue
    const issue = issues.find((i) => i.id === issueId)
    if (!issue || issue.status === newStatus) return

    setIsUpdating(true)
    try {
      await updateIssue(issueId, { status: newStatus })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map((status, index) => (
          <motion.div
            key={status.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <KanbanColumn
              status={status}
              issues={issuesByStatus[status.id] || []}
              workspaceSlug={workspaceSlug}
            />
          </motion.div>
        ))}
      </div>

      <DragOverlay>
        {activeIssue ? (
          <div className="rotate-3 opacity-90">
            <KanbanCard issue={activeIssue} workspaceSlug={workspaceSlug} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

