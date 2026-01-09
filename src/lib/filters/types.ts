// Issue filter types and constants

export const ISSUE_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
] as const

export const ISSUE_PRIORITIES = [
  "urgent",
  "high",
  "medium",
  "low",
  "none",
] as const

export type IssueStatus = (typeof ISSUE_STATUSES)[number]
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number]

// Special assignee values
export const ASSIGNEE_ME = "me"
export const ASSIGNEE_NONE = "none"

export interface IssueFilters {
  status?: string[]      // Multiple statuses allowed
  priority?: string[]    // Multiple priorities allowed
  assignee?: string[]    // User IDs, "me", or "none"
  labels?: string[]      // Label IDs
  project?: string[]     // Project IDs (workspace-level only)
  search?: string        // Text search in title/description
}

export interface SavedView {
  id: string
  name: string
  description?: string | null
  filters: IssueFilters
  workspaceId: string
  projectId?: string | null
  createdById: string
  icon?: string | null
  color?: string | null
  isShared: boolean
  position: number
  createdAt: Date
  updatedAt: Date
}

// Quick filter presets
export const QUICK_FILTERS = {
  myIssues: {
    name: "My Issues",
    icon: "👤",
    filters: { assignee: [ASSIGNEE_ME] },
  },
  active: {
    name: "Active",
    icon: "🔥",
    filters: { status: ["todo", "in_progress", "in_review"] },
  },
  backlog: {
    name: "Backlog",
    icon: "📥",
    filters: { status: ["backlog"] },
  },
  urgent: {
    name: "Urgent",
    icon: "🚨",
    filters: { priority: ["urgent", "high"] },
  },
  completed: {
    name: "Completed",
    icon: "✅",
    filters: { status: ["done"] },
  },
} as const

export type QuickFilterKey = keyof typeof QUICK_FILTERS

// Status display config
export const STATUS_CONFIG: Record<IssueStatus, { label: string; color: string }> = {
  backlog: { label: "Backlog", color: "slate" },
  todo: { label: "Todo", color: "blue" },
  in_progress: { label: "In Progress", color: "orange" },
  in_review: { label: "In Review", color: "violet" },
  done: { label: "Done", color: "emerald" },
  cancelled: { label: "Cancelled", color: "red" },
}

// Priority display config
export const PRIORITY_CONFIG: Record<IssuePriority, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "red" },
  high: { label: "High", color: "orange" },
  medium: { label: "Medium", color: "yellow" },
  low: { label: "Low", color: "slate" },
  none: { label: "No Priority", color: "gray" },
}

// Check if filters are empty (no active filters)
export function isFiltersEmpty(filters: IssueFilters): boolean {
  return (
    (!filters.status || filters.status.length === 0) &&
    (!filters.priority || filters.priority.length === 0) &&
    (!filters.assignee || filters.assignee.length === 0) &&
    (!filters.labels || filters.labels.length === 0) &&
    (!filters.project || filters.project.length === 0) &&
    !filters.search
  )
}

// Count active filters
export function countActiveFilters(filters: IssueFilters): number {
  let count = 0
  if (filters.status && filters.status.length > 0) count++
  if (filters.priority && filters.priority.length > 0) count++
  if (filters.assignee && filters.assignee.length > 0) count++
  if (filters.labels && filters.labels.length > 0) count++
  if (filters.project && filters.project.length > 0) count++
  if (filters.search) count++
  return count
}
