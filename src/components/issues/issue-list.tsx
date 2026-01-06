"use client"

import { Issue } from "@/lib/actions/issues"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatRelativeTime, cn } from "@/lib/utils"
import { Circle, CheckCircle2, Clock, Archive, XCircle, Loader2, ListTodo, ArrowRight } from "lucide-react"

interface IssueListProps {
  issues: Issue[]
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
  urgent: { label: "Urgent", color: "text-red-400 bg-red-500/10" },
  high: { label: "High", color: "text-orange-400 bg-orange-500/10" },
  medium: { label: "Medium", color: "text-amber-400 bg-amber-500/10" },
  low: { label: "Low", color: "text-slate-400 bg-slate-500/10" },
  no_priority: { label: "", color: "" },
}

export function IssueList({ issues, workspaceSlug }: IssueListProps) {
  return (
    <div className="space-y-2">
      {issues.map((issue, index) => {
        const status = statusConfig[issue.status as keyof typeof statusConfig] || statusConfig.backlog
        const StatusIcon = status.icon
        const priority = priorityConfig[issue.priority as keyof typeof priorityConfig] || priorityConfig.no_priority

        return (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
          >
            <Link href={`/w/${workspaceSlug}/issue/${issue.identifier}`}>
              <Card className="group transition-all border-border/50 hover:border-border hover:shadow-card-hover cursor-pointer overflow-hidden">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={cn("p-2 rounded-lg", status.bg)}>
                    <StatusIcon className={cn("h-4 w-4", status.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground font-mono">{issue.identifier}</span>
                      <span className="font-medium truncate">{issue.title}</span>
                    </div>
                    {issue.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {issue.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {priority.label && (
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", priority.color)}>
                        {priority.label}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(issue.createdAt)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )
      })}

      {issues.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/10 flex items-center justify-center mb-4">
            <ListTodo className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold mb-1">No issues yet</h3>
          <p className="text-sm text-muted-foreground">Create your first issue to get started</p>
        </motion.div>
      )}
    </div>
  )
}
