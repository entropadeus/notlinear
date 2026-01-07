"use client"

import { useState, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Revision } from "@/lib/actions/revisions"
import { formatRelativeTime, cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  History,
  ChevronDown,
  ChevronUp,
  FileText,
  Tag,
  CircleDot,
  User,
  GitCommit,
} from "lucide-react"

interface RevisionTimelineProps {
  issueId: string
  initialRevisions: Revision[]
}

// Group revisions by timestamp (within a few seconds = same "commit")
function groupRevisionsByCommit(revisions: Revision[]): Array<{
  id: string
  timestamp: Date
  author: { name: string | null; image: string | null }
  message: string | null
  changes: Revision[]
}> {
  const groups: Array<{
    id: string
    timestamp: Date
    author: { name: string | null; image: string | null }
    message: string | null
    changes: Revision[]
  }> = []

  for (const revision of revisions) {
    const lastGroup = groups[groups.length - 1]
    const timeDiff = lastGroup
      ? Math.abs(new Date(revision.createdAt).getTime() - new Date(lastGroup.timestamp).getTime())
      : Infinity

    // Group revisions within 5 seconds of each other by the same author
    if (lastGroup && timeDiff < 5000 && lastGroup.author.name === revision.author?.name) {
      lastGroup.changes.push(revision)
      // Use the earliest message if one exists
      if (revision.message && !lastGroup.message) {
        lastGroup.message = revision.message
      }
    } else {
      groups.push({
        id: revision.id,
        timestamp: revision.createdAt,
        author: revision.author || { name: null, image: null },
        message: revision.message,
        changes: [revision],
      })
    }
  }

  return groups
}

// Status display mapping
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  backlog: { label: "Backlog", color: "bg-gray-500" },
  todo: { label: "Todo", color: "bg-blue-500" },
  in_progress: { label: "In Progress", color: "bg-yellow-500" },
  in_review: { label: "In Review", color: "bg-purple-500" },
  done: { label: "Done", color: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
}

// Priority display mapping
const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  none: { label: "None", color: "bg-gray-400" },
  low: { label: "Low", color: "bg-blue-400" },
  medium: { label: "Medium", color: "bg-yellow-400" },
  high: { label: "High", color: "bg-orange-400" },
  urgent: { label: "Urgent", color: "bg-red-500" },
}

// Field icons
const FIELD_ICONS: Record<string, React.ElementType> = {
  title: FileText,
  description: FileText,
  status: CircleDot,
  priority: Tag,
  assignee: User,
}

// Compute word-level diff between two strings
function computeWordDiff(
  oldText: string | null,
  newText: string | null
): Array<{ type: "unchanged" | "added" | "removed"; text: string }> {
  const oldWords = (oldText || "").split(/(\s+)/)
  const newWords = (newText || "").split(/(\s+)/)

  // Simple LCS-based diff
  const result: Array<{ type: "unchanged" | "added" | "removed"; text: string }> = []

  let i = 0
  let j = 0

  while (i < oldWords.length || j < newWords.length) {
    if (i >= oldWords.length) {
      // Rest are additions
      result.push({ type: "added", text: newWords[j] })
      j++
    } else if (j >= newWords.length) {
      // Rest are removals
      result.push({ type: "removed", text: oldWords[i] })
      i++
    } else if (oldWords[i] === newWords[j]) {
      result.push({ type: "unchanged", text: oldWords[i] })
      i++
      j++
    } else {
      // Look ahead to find potential match
      let foundInNew = newWords.indexOf(oldWords[i], j)
      let foundInOld = oldWords.indexOf(newWords[j], i)

      if (foundInNew === -1 && foundInOld === -1) {
        // Neither found, both changed
        result.push({ type: "removed", text: oldWords[i] })
        result.push({ type: "added", text: newWords[j] })
        i++
        j++
      } else if (foundInNew !== -1 && (foundInOld === -1 || foundInNew - j <= foundInOld - i)) {
        // Old word found later in new - additions first
        result.push({ type: "added", text: newWords[j] })
        j++
      } else {
        // New word found later in old - removals first
        result.push({ type: "removed", text: oldWords[i] })
        i++
      }
    }
  }

  return result
}

// Render inline diff for text content
function InlineDiff({ oldValue, newValue }: { oldValue: string | null; newValue: string | null }) {
  const diff = useMemo(() => computeWordDiff(oldValue, newValue), [oldValue, newValue])

  if (!oldValue && newValue) {
    return <span className="text-green-600 bg-green-500/10 px-1 rounded">{newValue}</span>
  }

  if (oldValue && !newValue) {
    return <span className="text-red-600 bg-red-500/10 px-1 rounded line-through">{oldValue}</span>
  }

  return (
    <span className="font-mono text-sm">
      {diff.map((part, i) => (
        <span
          key={i}
          className={cn(
            part.type === "added" && "text-green-600 bg-green-500/10",
            part.type === "removed" && "text-red-600 bg-red-500/10 line-through"
          )}
        >
          {part.text}
        </span>
      ))}
    </span>
  )
}

// Render status badge
function StatusBadge({ status }: { status: string }) {
  const config = STATUS_LABELS[status] || { label: status, color: "bg-gray-500" }
  return (
    <Badge variant="outline" className="text-xs">
      <span className={cn("w-2 h-2 rounded-full mr-1.5", config.color)} />
      {config.label}
    </Badge>
  )
}

// Render priority badge
function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_LABELS[priority] || { label: priority, color: "bg-gray-400" }
  return (
    <Badge variant="outline" className="text-xs">
      <span className={cn("w-2 h-2 rounded-full mr-1.5", config.color)} />
      {config.label}
    </Badge>
  )
}

// Render a single change
function ChangeDisplay({ revision }: { revision: Revision }) {
  const Icon = FIELD_ICONS[revision.field] || FileText

  const renderChange = () => {
    switch (revision.field) {
      case "status":
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-muted-foreground">changed status from</span>
            {revision.oldValue && <StatusBadge status={revision.oldValue} />}
            <span className="text-muted-foreground">to</span>
            {revision.newValue && <StatusBadge status={revision.newValue} />}
          </div>
        )

      case "priority":
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-muted-foreground">changed priority from</span>
            {revision.oldValue && <PriorityBadge priority={revision.oldValue} />}
            <span className="text-muted-foreground">to</span>
            {revision.newValue && <PriorityBadge priority={revision.newValue} />}
          </div>
        )

      case "assignee":
        return (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {revision.newValue
                ? revision.oldValue
                  ? "reassigned issue"
                  : "assigned issue"
                : "unassigned issue"}
            </span>
          </div>
        )

      case "title":
        return (
          <div className="space-y-1">
            <span className="text-muted-foreground">changed title</span>
            <div className="pl-4 border-l-2 border-muted">
              <InlineDiff oldValue={revision.oldValue} newValue={revision.newValue} />
            </div>
          </div>
        )

      case "description":
        return (
          <div className="space-y-1">
            <span className="text-muted-foreground">updated description</span>
            <div className="pl-4 border-l-2 border-muted text-sm max-h-32 overflow-y-auto">
              <InlineDiff oldValue={revision.oldValue} newValue={revision.newValue} />
            </div>
          </div>
        )

      default:
        return (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">changed {revision.field}</span>
          </div>
        )
    }
  }

  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      {renderChange()}
    </div>
  )
}

export function RevisionTimeline({ issueId, initialRevisions }: RevisionTimelineProps) {
  const [revisions] = useState<Revision[]>(initialRevisions)
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAll, setShowAll] = useState(false)

  const groupedRevisions = useMemo(
    () => groupRevisionsByCommit(revisions),
    [revisions]
  )

  const displayedGroups = showAll ? groupedRevisions : groupedRevisions.slice(0, 5)
  const hasMore = groupedRevisions.length > 5

  if (revisions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <History className="h-4 w-4" />
        No changes recorded yet
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
      >
        <History className="h-4 w-4" />
        <span>History</span>
        <Badge variant="secondary" className="text-xs">
          {revisions.length}
        </Badge>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 ml-auto" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-auto" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {displayedGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-3"
              >
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={group.author.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {group.author.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  {index < displayedGroups.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {group.author.name || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(group.timestamp)}
                    </span>
                  </div>

                  {group.message && (
                    <div className="flex items-center gap-2 text-sm">
                      <GitCommit className="h-3 w-3 text-muted-foreground" />
                      <span className="italic text-muted-foreground">
                        &ldquo;{group.message}&rdquo;
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {group.changes.map((change) => (
                      <ChangeDisplay key={change.id} revision={change} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}

            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-muted-foreground"
              >
                {showAll
                  ? "Show less"
                  : `Show ${groupedRevisions.length - 5} more changes`}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
