"use client"

import { Issue } from "@/lib/db/schema"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanCard } from "./card"
import { cn } from "@/lib/utils"
import { Archive, Circle, Loader2, Clock, CheckCircle2 } from "lucide-react"

interface KanbanColumnProps {
  status: { id: string; title: string }
  issues: Issue[]
  workspaceSlug: string
}

const columnConfig = {
  backlog: { icon: Archive, color: "text-slate-400", gradient: "from-slate-500/20" },
  todo: { icon: Circle, color: "text-blue-400", gradient: "from-blue-500/20" },
  in_progress: { icon: Loader2, color: "text-amber-400", gradient: "from-amber-500/20" },
  in_review: { icon: Clock, color: "text-violet-400", gradient: "from-violet-500/20" },
  done: { icon: CheckCircle2, color: "text-emerald-400", gradient: "from-emerald-500/20" },
}

export function KanbanColumn({ status, issues, workspaceSlug }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
  })

  const config = columnConfig[status.id as keyof typeof columnConfig] || columnConfig.backlog
  const Icon = config.icon

  return (
    <div className="flex w-80 flex-shrink-0 flex-col">
      {/* Column Header */}
      <div className="mb-3 flex items-center gap-3 px-1">
        <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", config.gradient, "to-transparent")}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <span className="text-sm font-semibold">{status.title}</span>
        <span className="ml-auto text-xs text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full">
          {issues.length}
        </span>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 rounded-xl border-2 border-dashed p-2 transition-all duration-200 min-h-[200px]",
          isOver
            ? "border-primary/50 bg-primary/5 shadow-glow-sm"
            : "border-border/30 hover:border-border/50"
        )}
      >
        <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map((issue) => (
            <KanbanCard key={issue.id} issue={issue} workspaceSlug={workspaceSlug} />
          ))}
        </SortableContext>

        {issues.length === 0 && (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground/50">
            <span>Drop issues here</span>
          </div>
        )}
      </div>
    </div>
  )
}
