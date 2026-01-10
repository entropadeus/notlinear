"use client"

import { Issue } from "@/lib/actions/issues"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatRelativeTime, cn } from "@/lib/utils"
import { Circle, CheckCircle2, Clock, Archive, XCircle, Loader2, ListTodo, type LucideIcon } from "lucide-react"
import { STATUS_DISPLAY_CONFIG, PRIORITY_DISPLAY_CONFIG, type IssueStatus, type IssuePriority } from "@/lib/filters/types"
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation"

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

export function IssueGrid({ issues, workspaceSlug, members = [], onCreateNew, onStatusChange, onAssignToMe, onChangePriority, onDelete }: IssueGridProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
          >
            <Link href={`/w/${workspaceSlug}/issue/${issue.identifier}`}>
              <Card
                data-issue-index={index}
                className={cn(
                  "group h-full transition-all border-border/50 hover:border-border hover:shadow-card-hover cursor-pointer overflow-hidden",
                  selectedIndex === index && isNavigating && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
              >
                <CardContent className="p-4 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-mono">{issue.identifier}</span>
                    <div className={cn("p-1.5 rounded-md", statusConfig.bgClass)}>
                      <StatusIcon className={cn("h-3.5 w-3.5", statusConfig.color)} />
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
                      {priorityConfig.label && (
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", priorityConfig.colorClass)}>
                          {priorityConfig.label}
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
