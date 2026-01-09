"use client"

import { Issue } from "@/lib/actions/issues"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatRelativeTime, cn } from "@/lib/utils"
import { Circle, CheckCircle2, Clock, Archive, XCircle, Loader2, ListTodo } from "lucide-react"

interface Member {
  id: string
  name: string
  email: string
  image: string | null
}

interface IssueGridProps {
  issues: Issue[]
  workspaceSlug: string
  members?: Member[]
}

const statusConfig = {
  backlog: { icon: Archive, color: "text-slate-400", bg: "bg-slate-500/10", label: "Backlog" },
  todo: { icon: Circle, color: "text-blue-400", bg: "bg-blue-500/10", label: "Todo" },
  in_progress: { icon: Loader2, color: "text-orange-400", bg: "bg-orange-500/10", label: "In Progress" },
  in_review: { icon: Clock, color: "text-violet-400", bg: "bg-violet-500/10", label: "In Review" },
  done: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Done" },
  cancelled: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Cancelled" },
}

const priorityConfig = {
  urgent: { label: "Urgent", color: "text-red-400 bg-red-500/10" },
  high: { label: "High", color: "text-orange-400 bg-orange-500/10" },
  medium: { label: "Medium", color: "text-orange-400 bg-orange-500/10" },
  low: { label: "Low", color: "text-slate-400 bg-slate-500/10" },
  no_priority: { label: "", color: "" },
}

export function IssueGrid({ issues, workspaceSlug, members = [] }: IssueGridProps) {
  const getAssignee = (assigneeId: string | null) => {
    if (!assigneeId) return null
    return members.find(m => m.id === assigneeId)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {issues.map((issue, index) => {
        const status = statusConfig[issue.status as keyof typeof statusConfig] || statusConfig.backlog
        const StatusIcon = status.icon
        const priority = priorityConfig[issue.priority as keyof typeof priorityConfig] || priorityConfig.no_priority
        const assignee = getAssignee(issue.assigneeId)

        return (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
          >
            <Link href={`/w/${workspaceSlug}/issue/${issue.identifier}`}>
              <Card className="group h-full transition-all border-border/50 hover:border-border hover:shadow-card-hover cursor-pointer overflow-hidden">
                <CardContent className="p-4 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-mono">{issue.identifier}</span>
                    <div className={cn("p-1.5 rounded-md", status.bg)}>
                      <StatusIcon className={cn("h-3.5 w-3.5", status.color)} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {issue.title}
                  </h3>

                  {/* Description */}
                  {issue.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                      {issue.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      {priority.label && (
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", priority.color)}>
                          {priority.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {assignee && (
                        <Avatar className="h-5 w-5" title={assignee.name}>
                          <AvatarImage src={assignee.image || undefined} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {assignee.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(issue.createdAt)}
                      </span>
                    </div>
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
          className="col-span-full flex flex-col items-center justify-center py-16"
        >
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center mb-4">
            <ListTodo className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold mb-1">No issues yet</h3>
          <p className="text-sm text-muted-foreground">Create your first issue to get started</p>
        </motion.div>
      )}
    </div>
  )
}
