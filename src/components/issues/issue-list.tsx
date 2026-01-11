"use client"

import { Issue } from "@/lib/actions/issues"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatRelativeTime, cn } from "@/lib/utils"
import { Circle, CheckCircle2, Clock, Archive, XCircle, Loader2, ListTodo, ArrowRight, type LucideIcon } from "lucide-react"
import { STATUS_DISPLAY_CONFIG, PRIORITY_DISPLAY_CONFIG, type IssueStatus, type IssuePriority } from "@/lib/filters/types"
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation"

interface Member {
  id: string
  name: string
  email: string
  image: string | null
}

interface IssueListProps {
  issues: Issue[]
  workspaceSlug: string
  members?: Member[]
  onCreateNew?: () => void
  onStatusChange?: (id: string, status: string) => void
  onAssignToMe?: (id: string) => void
  onChangePriority?: (id: string) => void
  onDelete?: (id: string) => void
}

// Map status to icon - icons cannot be serialized in types.ts
const STATUS_ICONS: Record<IssueStatus, LucideIcon> = {
  backlog: Archive,
  todo: Circle,
  in_progress: Loader2,
  in_review: Clock,
  done: CheckCircle2,
  cancelled: XCircle,
}

export function IssueList({ issues, workspaceSlug, members = [], onCreateNew, onStatusChange, onAssignToMe, onChangePriority, onDelete }: IssueListProps) {
  const getAssignee = (assigneeId: string | null) => {
    if (!assigneeId) return null
    return members.find(m => m.id === assigneeId)
  }

  const { selectedIndex, selectedItem, isNavigating } = useKeyboardNavigation({
    items: issues,
    workspaceSlug,
    onCreateNew,
    onStatusChange,
    onAssignToMe,
    onChangePriority,
    onDelete,
    enabled: issues.length > 0,
  })

  return (
    <div className="space-y-2">
      {issues.map((issue, index) => {
        const statusKey = (issue.status as IssueStatus) || "backlog"
        const statusConfig = STATUS_DISPLAY_CONFIG[statusKey] || STATUS_DISPLAY_CONFIG.backlog
        const StatusIcon = STATUS_ICONS[statusKey] || STATUS_ICONS.backlog
        const priorityKey = (issue.priority as IssuePriority | "no_priority") || "no_priority"
        const priorityConfig = PRIORITY_DISPLAY_CONFIG[priorityKey] || PRIORITY_DISPLAY_CONFIG.no_priority
        const assignee = getAssignee(issue.assigneeId)

        return (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
          >
            <Link href={`/w/${workspaceSlug}/issue/${issue.identifier}`}>
              <Card
                data-issue-index={index}
                className={cn(
                  "group transition-all border-border/50 hover:border-border hover:shadow-card-hover cursor-pointer overflow-hidden",
                  selectedIndex === index && isNavigating && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={cn("p-2 rounded-lg", statusConfig.bgClass)}>
                    <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
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
                    {priorityConfig.label && (
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", priorityConfig.colorClass)}>
                        {priorityConfig.label}
                      </span>
                    )}
                    {assignee && (
                      <Avatar className="h-6 w-6" title={assignee.name}>
                        <AvatarImage src={assignee.image || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {assignee.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
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
