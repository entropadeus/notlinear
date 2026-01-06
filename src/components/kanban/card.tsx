"use client"

import { Issue } from "@/lib/db/schema"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { motion } from "framer-motion"
import { Archive, Circle, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface KanbanCardProps {
  issue: Issue
  workspaceSlug: string
}

const statusConfig = {
  backlog: { icon: Archive, color: "text-slate-400", bg: "bg-slate-500/10" },
  todo: { icon: Circle, color: "text-blue-400", bg: "bg-blue-500/10" },
  in_progress: { icon: Loader2, color: "text-amber-400", bg: "bg-amber-500/10" },
  in_review: { icon: Clock, color: "text-violet-400", bg: "bg-violet-500/10" },
  done: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  cancelled: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
}

const priorityConfig = {
  urgent: { dot: "bg-red-400" },
  high: { dot: "bg-orange-400" },
  medium: { dot: "bg-amber-400" },
  low: { dot: "bg-slate-400" },
  no_priority: { dot: "" },
}

export function KanbanCard({ issue, workspaceSlug }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const status = statusConfig[issue.status as keyof typeof statusConfig] || statusConfig.backlog
  const StatusIcon = status.icon
  const priority = priorityConfig[issue.priority as keyof typeof priorityConfig] || priorityConfig.no_priority

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(isDragging && "opacity-50")}
      >
        <Link href={`/w/${workspaceSlug}/issue/${issue.identifier}`}>
          <Card className="cursor-grab active:cursor-grabbing border-border/50 hover:border-border hover:shadow-card-hover transition-all duration-200 overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-start gap-2.5">
                <div className={cn("p-1.5 rounded-md mt-0.5", status.bg)}>
                  <StatusIcon className={cn("h-3.5 w-3.5", status.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2 leading-snug">{issue.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground font-mono">{issue.identifier}</span>
                    {priority.dot && (
                      <div className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  )
}
