"use client"

import { Issue } from "@/lib/actions/issues"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanCard } from "./card"
import { cn } from "@/lib/utils"
import { Archive, Circle, Loader2, Clock, CheckCircle2, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface KanbanColumnProps {
  status: { id: string; title: string }
  issues: Issue[]
  workspaceSlug: string
  isOver?: boolean
}

const columnConfig = {
  backlog: {
    icon: Archive,
    color: "text-slate-400",
    gradient: "from-slate-500/20",
    borderColor: "border-slate-400/50",
    bgHover: "bg-slate-500/5",
    spin: false
  },
  todo: {
    icon: Circle,
    color: "text-blue-400",
    gradient: "from-blue-500/20",
    borderColor: "border-blue-400/50",
    bgHover: "bg-blue-500/5",
    spin: false
  },
  in_progress: {
    icon: Loader2,
    color: "text-amber-400",
    gradient: "from-amber-500/20",
    borderColor: "border-amber-400/50",
    bgHover: "bg-amber-500/5",
    spin: true
  },
  in_review: {
    icon: Clock,
    color: "text-violet-400",
    gradient: "from-violet-500/20",
    borderColor: "border-violet-400/50",
    bgHover: "bg-violet-500/5",
    spin: false
  },
  done: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    gradient: "from-emerald-500/20",
    borderColor: "border-emerald-400/50",
    bgHover: "bg-emerald-500/5",
    spin: false
  },
}

export function KanbanColumn({ status, issues, workspaceSlug, isOver: isOverProp }: KanbanColumnProps) {
  const { setNodeRef, isOver: isOverDroppable, active } = useDroppable({
    id: status.id,
  })

  const isOver = isOverProp || isOverDroppable

  const config = columnConfig[status.id as keyof typeof columnConfig] || columnConfig.backlog
  const Icon = config.icon

  return (
    <div className="flex w-80 flex-shrink-0 flex-col h-full">
      {/* Column Header */}
      <div className="mb-3 flex items-center gap-3 px-1">
        <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", config.gradient, "to-transparent")}>
          <Icon className={cn("h-4 w-4", config.color, config.spin && "animate-spin")} />
        </div>
        <span className="text-sm font-semibold">{status.title}</span>
        <motion.span
          key={issues.length}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="ml-auto text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full font-medium"
        >
          {issues.length}
        </motion.span>
      </div>

      {/* Column Content */}
      <motion.div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 rounded-xl border-2 border-dashed p-2 transition-all duration-200 min-h-[200px]",
          isOver
            ? cn("border-primary bg-primary/10 shadow-lg", config.borderColor)
            : "border-border/30 hover:border-border/50",
          active && !isOver && "border-border/50"
        )}
        animate={{
          scale: isOver ? 1.02 : 1,
          backgroundColor: isOver ? "rgba(var(--primary-rgb), 0.05)" : "transparent",
        }}
        transition={{ duration: 0.15 }}
      >
        <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {issues.map((issue, index) => (
              <motion.div
                key={issue.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.02,
                  layout: { duration: 0.2 }
                }}
              >
                <KanbanCard issue={issue} workspaceSlug={workspaceSlug} />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>

        {issues.length === 0 && (
          <motion.div
            className={cn(
              "flex h-32 items-center justify-center text-sm rounded-lg transition-colors duration-200",
              isOver
                ? "text-primary/70 bg-primary/5 border border-primary/20"
                : "text-muted-foreground/50"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center gap-2">
              <Plus className={cn("h-5 w-5", isOver && "text-primary")} />
              <span>{isOver ? "Release to drop here" : "Drop issues here"}</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
