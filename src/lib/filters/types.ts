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
export const QUICK_FILTERS: Record<string, { name: string; icon: string; filters: IssueFilters }> = {
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
}

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

// Extended status config for components that need icons and backgrounds
// Icon classes: Archive, Circle, Loader2, Clock, CheckCircle2, XCircle from lucide-react
export const STATUS_DISPLAY_CONFIG: Record<IssueStatus, {
  label: string
  color: string
  bgClass: string
}> = {
  backlog: { label: "Backlog", color: "text-slate-400", bgClass: "bg-slate-500/10" },
  todo: { label: "Todo", color: "text-blue-400", bgClass: "bg-blue-500/10" },
  in_progress: { label: "In Progress", color: "text-orange-400", bgClass: "bg-orange-500/10" },
  in_review: { label: "In Review", color: "text-violet-400", bgClass: "bg-violet-500/10" },
  done: { label: "Done", color: "text-emerald-400", bgClass: "bg-emerald-500/10" },
  cancelled: { label: "Cancelled", color: "text-red-400", bgClass: "bg-red-500/10" },
}

// Extended priority config for components that need styling
export const PRIORITY_DISPLAY_CONFIG: Record<IssuePriority | "no_priority", {
  label: string
  colorClass: string
}> = {
  urgent: { label: "Urgent", colorClass: "text-red-400 bg-red-500/10" },
  high: { label: "High", colorClass: "text-orange-400 bg-orange-500/10" },
  medium: { label: "Medium", colorClass: "text-orange-400 bg-orange-500/10" },
  low: { label: "Low", colorClass: "text-slate-400 bg-slate-500/10" },
  none: { label: "", colorClass: "" },
  no_priority: { label: "", colorClass: "" },
}

// Priority display config
export const PRIORITY_CONFIG: Record<IssuePriority, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "red" },
  high: { label: "High", color: "orange" },
  medium: { label: "Medium", color: "yellow" },
  low: { label: "Low", color: "slate" },
  none: { label: "No Priority", color: "gray" },
}

// Derived options for select dropdowns (status)
export const STATUS_OPTIONS = ISSUE_STATUSES.map((status) => ({
  value: status,
  label: STATUS_CONFIG[status].label,
}))

// Derived options for select dropdowns (priority)
export const PRIORITY_OPTIONS = ISSUE_PRIORITIES.map((priority) => ({
  value: priority,
  label: PRIORITY_CONFIG[priority].label,
}))

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
