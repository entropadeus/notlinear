"use client"

import { Issue } from "@/lib/actions/issues"
import { useState, useCallback, useMemo, useEffect } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  UniqueIdentifier,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanColumn } from "./column"
import { KanbanCard } from "./card"
import { motion, AnimatePresence } from "framer-motion"
import { updateIssue, updateIssuePosition } from "@/lib/actions/issues"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useIssueUpdates } from "@/lib/realtime/use-realtime"
import type { RealtimeEvent } from "@/lib/realtime/events"
import { Users, Wifi, WifiOff } from "lucide-react"

interface KanbanBoardProps {
  issues: Issue[]
  projectId: string
  workspaceSlug: string
  workspaceId: string
}

const statuses = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "done", title: "Done" },
]

const STATUS_IDS = statuses.map((s) => s.id)

// Custom collision detection that prioritizes columns, then cards
function customCollisionDetection(args: Parameters<typeof closestCenter>[0]) {
  // First, check if we're over a column (droppable)
  const pointerCollisions = pointerWithin(args)
  const intersections = rectIntersection(args)

  // Combine collisions
  const collisions = [...pointerCollisions, ...intersections]

  // If we have collisions, find the first valid one
  const firstCollision = getFirstCollision(collisions, "id")

  if (firstCollision) {
    const overId = firstCollision as string
    // If it's a status column, return it
    if (STATUS_IDS.includes(overId)) {
      return [{ id: overId }]
    }
    // Otherwise, return the collision (it's a card)
    return [{ id: overId }]
  }

  // Fallback to closest center
  return closestCenter(args)
}

export function KanbanBoard({ issues: initialIssues, projectId, workspaceSlug, workspaceId }: KanbanBoardProps) {
  const { toast } = useToast()
  const router = useRouter()

  // Local state for optimistic updates
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Real-time updates subscription
  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    // Only handle events for this project
    if (event.projectId !== projectId) return

    switch (event.type) {
      case "issue_created": {
        const newIssue = event.payload.issue as Issue
        setIssues((prev) => {
          // Don't add if already exists
          if (prev.some((i) => i.id === newIssue.id)) return prev
          return [...prev, newIssue]
        })
        toast({ title: "New issue created", description: newIssue.title })
        break
      }
      case "issue_updated":
      case "issue_moved": {
        const updatedIssue = event.payload.issue as Partial<Issue> & { id: string }
        setIssues((prev) =>
          prev.map((issue) =>
            issue.id === updatedIssue.id ? { ...issue, ...updatedIssue } : issue
          )
        )
        break
      }
      case "issue_deleted": {
        const deletedId = event.payload.issueId as string
        setIssues((prev) => prev.filter((i) => i.id !== deletedId))
        break
      }
    }
  }, [projectId, toast])

  const { isConnected, onlineUsers } = useIssueUpdates(workspaceId, projectId, handleRealtimeEvent)

  // Sync with server data when it changes
  useEffect(() => {
    setIssues(initialIssues)
  }, [initialIssues])

  // Configure sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch devices
        tolerance: 5,
      },
    })
  )

  // Organize issues by status with position sorting
  const issuesByStatus = useMemo(() => {
    return statuses.reduce((acc, status) => {
      acc[status.id] = issues
        .filter((issue) => issue.status === status.id)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      return acc
    }, {} as Record<string, Issue[]>)
  }, [issues])

  // Find which column an issue belongs to
  const findContainer = useCallback((id: UniqueIdentifier): string | undefined => {
    if (STATUS_IDS.includes(id as string)) {
      return id as string
    }

    for (const [statusId, statusIssues] of Object.entries(issuesByStatus)) {
      if (statusIssues.some((issue) => issue.id === id)) {
        return statusId
      }
    }

    return undefined
  }, [issuesByStatus])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id)
    setOverId(null)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event

    if (!over) {
      setOverId(null)
      return
    }

    setOverId(over.id)

    const activeContainer = findContainer(active.id)
    const overContainer = findContainer(over.id)

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }

    // Moving to a different column - update local state optimistically
    setIssues((prev) => {
      const activeIssue = prev.find((i) => i.id === active.id)
      if (!activeIssue) return prev

      // Calculate new position (at the end of the target column)
      const targetColumnIssues = prev.filter((i) => i.status === overContainer)
      const maxPosition = targetColumnIssues.length > 0
        ? Math.max(...targetColumnIssues.map((i) => i.position ?? 0)) + 1
        : 0

      return prev.map((issue) =>
        issue.id === active.id
          ? { ...issue, status: overContainer, position: maxPosition }
          : issue
      )
    })
  }, [findContainer])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    setOverId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeContainer = findContainer(activeId)
    let overContainer = findContainer(overId)

    // If dropped on a status column directly
    if (STATUS_IDS.includes(overId)) {
      overContainer = overId
    }

    if (!activeContainer || !overContainer) return

    const activeIssue = issues.find((i) => i.id === activeId)
    if (!activeIssue) return

    // Check if anything changed
    const originalIssue = initialIssues.find((i) => i.id === activeId)
    if (!originalIssue) return

    // Calculate new position
    let newPosition: number
    const targetIssues = issuesByStatus[overContainer].filter((i) => i.id !== activeId)

    if (overId === overContainer || targetIssues.length === 0) {
      // Dropped on column or empty column - put at end
      newPosition = targetIssues.length > 0
        ? Math.max(...targetIssues.map((i) => i.position ?? 0)) + 1
        : 0
    } else {
      // Dropped on a card - insert at that position
      const overIndex = targetIssues.findIndex((i) => i.id === overId)
      if (overIndex >= 0) {
        const overIssue = targetIssues[overIndex]
        newPosition = overIssue.position ?? overIndex
      } else {
        newPosition = targetIssues.length
      }
    }

    // If nothing changed, don't make API call
    if (originalIssue.status === overContainer && originalIssue.position === newPosition) {
      return
    }

    // Update local state optimistically
    setIssues((prev) => {
      return prev.map((issue) =>
        issue.id === activeId
          ? { ...issue, status: overContainer, position: newPosition }
          : issue
      )
    })

    setIsUpdating(true)
    try {
      await updateIssuePosition(activeId, overContainer, newPosition)
      router.refresh()
    } catch (error) {
      // Revert on error
      setIssues(initialIssues)
      toast({
        title: "Error",
        description: "Failed to update issue",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }, [findContainer, issues, initialIssues, issuesByStatus, router, toast])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setOverId(null)
    // Revert to original state
    setIssues(initialIssues)
  }, [initialIssues])

  const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      {/* Real-time status indicator */}
      <div className="flex items-center justify-end gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-1 border border-border/50">
          {isConnected ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-500">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Connecting...</span>
            </>
          )}
        </div>
        {onlineUsers.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-1 border border-border/50">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{onlineUsers.length} online</span>
          </div>
        )}
      </div>

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
              isOver={overId === status.id}
            />
          </motion.div>
        ))}
      </div>

      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        <AnimatePresence>
          {activeIssue ? (
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              animate={{ scale: 1.05, rotate: 3 }}
              exit={{ scale: 1, rotate: 0 }}
              className="opacity-95 shadow-xl"
            >
              <KanbanCard issue={activeIssue} workspaceSlug={workspaceSlug} isDragOverlay />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DragOverlay>
    </DndContext>
  )
}

