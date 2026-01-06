"use client"

import { Issue } from "@/lib/actions/issues"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Archive, Circle, Loader2, Clock, CheckCircle2, XCircle, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent, useRef, useState } from "react"

interface KanbanCardProps {
  issue: Issue
  workspaceSlug: string
  isDragOverlay?: boolean
}

const statusConfig = {
  backlog: { icon: Archive, color: "text-slate-400", bg: "bg-slate-500/10", spin: false },
  todo: { icon: Circle, color: "text-blue-400", bg: "bg-blue-500/10", spin: false },
  in_progress: { icon: Loader2, color: "text-amber-400", bg: "bg-amber-500/10", spin: true },
  in_review: { icon: Clock, color: "text-violet-400", bg: "bg-violet-500/10", spin: false },
  done: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", spin: false },
  cancelled: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", spin: false },
}

const priorityConfig = {
  urgent: { dot: "bg-red-400", label: "Urgent" },
  high: { dot: "bg-orange-400", label: "High" },
  medium: { dot: "bg-amber-400", label: "Medium" },
  low: { dot: "bg-slate-400", label: "Low" },
  none: { dot: "", label: "" },
  no_priority: { dot: "", label: "" },
}

export function KanbanCard({ issue, workspaceSlug, isDragOverlay = false }: KanbanCardProps) {
  const router = useRouter()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({
    id: issue.id,
  })

  // Track if this was a drag or click
  const startPosRef = useRef<{ x: number; y: number } | null>(null)
  const [wasDragging, setWasDragging] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  }

  const status = statusConfig[issue.status as keyof typeof statusConfig] || statusConfig.backlog
  const StatusIcon = status.icon
  const priority = priorityConfig[issue.priority as keyof typeof priorityConfig] || priorityConfig.none

  // Handle navigation separately from drag
  const handleCardClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    // Don't navigate if we were dragging
    if (isDragging || wasDragging) {
      e.preventDefault()
      e.stopPropagation()
      setWasDragging(false)
      return
    }

    // Navigate to issue detail
    router.push(`/w/${workspaceSlug}/issue/${issue.identifier}`)
  }

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    startPosRef.current = { x: e.clientX, y: e.clientY }
    setWasDragging(false)
  }

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!startPosRef.current) return

    const dx = Math.abs(e.clientX - startPosRef.current.x)
    const dy = Math.abs(e.clientY - startPosRef.current.y)

    // If moved more than 5px, consider it a drag
    if (dx > 5 || dy > 5) {
      setWasDragging(true)
    }
  }

  const handleMouseUp = () => {
    startPosRef.current = null
  }

  // For overlay, render without drag functionality
  if (isDragOverlay) {
    return (
      <Card className="cursor-grabbing border-primary/50 shadow-2xl bg-background/95 backdrop-blur-sm transition-all duration-200 overflow-hidden ring-2 ring-primary/20">
        <CardContent className="p-3">
          <div className="flex items-start gap-2.5">
            <div className={cn("p-1.5 rounded-md mt-0.5", status.bg)}>
              <StatusIcon className={cn("h-3.5 w-3.5", status.color, status.spin && "animate-spin")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-2 leading-snug">{issue.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground font-mono">{issue.identifier}</span>
                {priority.dot && (
                  <div className="flex items-center gap-1">
                    <div className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      initial={false}
      animate={{
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)" : "none",
      }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        className={cn(
          "group cursor-pointer border-border/50 hover:border-border hover:shadow-card-hover transition-all duration-200 overflow-hidden",
          isDragging && "border-primary/50 ring-2 ring-primary/20"
        )}
        onClick={handleCardClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2.5">
            {/* Drag Handle */}
            <div
              ref={setActivatorNodeRef}
              {...listeners}
              className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 -ml-1 rounded hover:bg-muted transition-all duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className={cn("p-1.5 rounded-md mt-0.5 flex-shrink-0", status.bg)}>
              <StatusIcon className={cn("h-3.5 w-3.5", status.color, status.spin && "animate-spin")} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-2 leading-snug">{issue.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground font-mono">{issue.identifier}</span>
                {priority.dot && (
                  <div className="flex items-center gap-1">
                    <div className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
