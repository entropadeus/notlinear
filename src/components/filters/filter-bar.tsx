"use client"

import { useState, useCallback, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Filter,
  X,
  ChevronDown,
  Circle,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Archive,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  User,
  Tag,
  FolderKanban,
  Search,
  Save,
  Sparkles,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  IssueFilters,
  ISSUE_STATUSES,
  ISSUE_PRIORITIES,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  ASSIGNEE_ME,
  ASSIGNEE_NONE,
  QUICK_FILTERS,
  QuickFilterKey,
  isFiltersEmpty,
  countActiveFilters,
} from "@/lib/filters/types"
import {
  parseFiltersFromURL,
  serializeFiltersToURL,
  toggleFilterValue,
  mergeFilters,
} from "@/lib/filters/url"
import { WorkspaceMember, LabelOption, ProjectOption } from "@/lib/actions/filters"

interface FilterBarProps {
  workspaceId: string
  projectId?: string
  members: WorkspaceMember[]
  labels: LabelOption[]
  projects?: ProjectOption[]
  currentUserId: string
  onSaveView?: () => void
}

const STATUS_ICONS: Record<string, any> = {
  backlog: Archive,
  todo: Circle,
  in_progress: Loader2,
  in_review: Clock,
  done: CheckCircle2,
  cancelled: XCircle,
}

const PRIORITY_ICONS: Record<string, any> = {
  urgent: AlertTriangle,
  high: ArrowUp,
  medium: Minus,
  low: ArrowDown,
  none: Minus,
}

export function FilterBar({
  workspaceId,
  projectId,
  members,
  labels,
  projects,
  currentUserId,
  onSaveView,
}: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Parse current filters from URL
  const filters = parseFiltersFromURL(searchParams)
  const activeCount = countActiveFilters(filters)
  const hasFilters = !isFiltersEmpty(filters)

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters: IssueFilters) => {
      startTransition(() => {
        const queryString = serializeFiltersToURL(newFilters)
        router.push(`${pathname}${queryString}`, { scroll: false })
      })
    },
    [router, pathname]
  )

  // Toggle a filter value
  const handleToggle = useCallback(
    (key: keyof Pick<IssueFilters, "status" | "priority" | "assignee" | "labels" | "project">, value: string) => {
      const updated = toggleFilterValue(filters, key, value)
      updateFilters(updated)
    },
    [filters, updateFilters]
  )

  // Clear all filters
  const handleClearAll = useCallback(() => {
    router.push(pathname, { scroll: false })
  }, [router, pathname])

  // Apply quick filter
  const handleQuickFilter = useCallback(
    (key: QuickFilterKey) => {
      updateFilters(QUICK_FILTERS[key].filters)
    },
    [updateFilters]
  )

  // Search
  const [searchValue, setSearchValue] = useState(filters.search || "")
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value)
      const updated = mergeFilters(filters, { search: value || undefined })
      updateFilters(updated)
    },
    [filters, updateFilters]
  )

  return (
    <div className="space-y-3">
      {/* Main filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filter icon */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter</span>
        </div>

        {/* Status dropdown */}
        <FilterDropdown
          label="Status"
          icon={Circle}
          values={filters.status || []}
          options={ISSUE_STATUSES.map((status) => ({
            value: status,
            label: STATUS_CONFIG[status].label,
            icon: STATUS_ICONS[status],
            color: STATUS_CONFIG[status].color,
          }))}
          onToggle={(value) => handleToggle("status", value)}
        />

        {/* Priority dropdown */}
        <FilterDropdown
          label="Priority"
          icon={ArrowUp}
          values={filters.priority || []}
          options={ISSUE_PRIORITIES.map((priority) => ({
            value: priority,
            label: PRIORITY_CONFIG[priority].label,
            icon: PRIORITY_ICONS[priority],
            color: PRIORITY_CONFIG[priority].color,
          }))}
          onToggle={(value) => handleToggle("priority", value)}
        />

        {/* Assignee dropdown */}
        <FilterDropdown
          label="Assignee"
          icon={User}
          values={filters.assignee || []}
          options={[
            { value: ASSIGNEE_ME, label: "Me", icon: User, color: "primary" },
            { value: ASSIGNEE_NONE, label: "Unassigned", icon: User, color: "slate" },
            ...members.map((member) => ({
              value: member.id,
              label: member.name,
              icon: User,
              color: "blue",
              isCurrentUser: member.id === currentUserId,
            })),
          ]}
          onToggle={(value) => handleToggle("assignee", value)}
        />

        {/* Labels dropdown */}
        {labels.length > 0 && (
          <FilterDropdown
            label="Label"
            icon={Tag}
            values={filters.labels || []}
            options={labels.map((label) => ({
              value: label.id,
              label: label.name,
              icon: Tag,
              color: label.color,
            }))}
            onToggle={(value) => handleToggle("labels", value)}
          />
        )}

        {/* Projects dropdown (workspace-level only) */}
        {!projectId && projects && projects.length > 0 && (
          <FilterDropdown
            label="Project"
            icon={FolderKanban}
            values={filters.project || []}
            options={projects.map((project) => ({
              value: project.id,
              label: project.name,
              icon: FolderKanban,
              color: project.color,
            }))}
            onToggle={(value) => handleToggle("project", value)}
          />
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-8 w-40 pl-8 text-sm bg-surface-1 border-border/50"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quick filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Quick Filters
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 glass">
            {Object.entries(QUICK_FILTERS).map(([key, filter]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => handleQuickFilter(key as QuickFilterKey)}
              >
                <span className="mr-2">{filter.icon}</span>
                {filter.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Save view button */}
        {hasFilters && onSaveView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSaveView}
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Save className="h-3.5 w-3.5" />
            Save View
          </Button>
        )}
      </div>

      {/* Active filter pills */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 flex-wrap"
          >
            {/* Status pills */}
            {filters.status?.map((status) => (
              <FilterPill
                key={`status-${status}`}
                label={STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status}
                color={STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || "slate"}
                onRemove={() => handleToggle("status", status)}
              />
            ))}

            {/* Priority pills */}
            {filters.priority?.map((priority) => (
              <FilterPill
                key={`priority-${priority}`}
                label={PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]?.label || priority}
                color={PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]?.color || "slate"}
                onRemove={() => handleToggle("priority", priority)}
              />
            ))}

            {/* Assignee pills */}
            {filters.assignee?.map((assignee) => {
              let label = assignee
              if (assignee === ASSIGNEE_ME) label = "Me"
              else if (assignee === ASSIGNEE_NONE) label = "Unassigned"
              else {
                const member = members.find((m) => m.id === assignee)
                label = member?.name || assignee
              }
              return (
                <FilterPill
                  key={`assignee-${assignee}`}
                  label={label}
                  color="blue"
                  onRemove={() => handleToggle("assignee", assignee)}
                />
              )
            })}

            {/* Label pills */}
            {filters.labels?.map((labelId) => {
              const label = labels.find((l) => l.id === labelId)
              return (
                <FilterPill
                  key={`label-${labelId}`}
                  label={label?.name || labelId}
                  color={label?.color || "slate"}
                  onRemove={() => handleToggle("labels", labelId)}
                />
              )
            })}

            {/* Project pills */}
            {filters.project?.map((projectId) => {
              const project = projects?.find((p) => p.id === projectId)
              return (
                <FilterPill
                  key={`project-${projectId}`}
                  label={project?.name || projectId}
                  color="violet"
                  onRemove={() => handleToggle("project", projectId)}
                />
              )
            })}

            {/* Search pill */}
            {filters.search && (
              <FilterPill
                label={`"${filters.search}"`}
                color="gray"
                onRemove={() => {
                  setSearchValue("")
                  handleSearch("")
                }}
              />
            )}

            {/* Clear all */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
              <X className="ml-1 h-3 w-3" />
            </Button>

            {/* Loading indicator */}
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// Filter Dropdown Component
// ============================================================================

interface FilterOption {
  value: string
  label: string
  icon: any
  color: string
  isCurrentUser?: boolean
}

interface FilterDropdownProps {
  label: string
  icon: any
  values: string[]
  options: FilterOption[]
  onToggle: (value: string) => void
}

function FilterDropdown({ label, icon: Icon, values, options, onToggle }: FilterDropdownProps) {
  const hasSelection = values.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 border-border/50 bg-surface-1 hover:bg-surface-2",
            hasSelection && "border-primary/50 bg-primary/5"
          )}
        >
          <Icon className={cn("h-3.5 w-3.5", hasSelection && "text-primary")} />
          {label}
          {hasSelection && (
            <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {values.length}
            </span>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 glass">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const OptionIcon = option.icon
          const isSelected = values.includes(option.value)
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              onCheckedChange={() => onToggle(option.value)}
              className="gap-2"
            >
              <OptionIcon className={cn("h-4 w-4", getColorClass(option.color))} />
              <span className="flex-1">{option.label}</span>
              {option.isCurrentUser && (
                <span className="text-[10px] text-muted-foreground">(you)</span>
              )}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============================================================================
// Filter Pill Component
// ============================================================================

interface FilterPillProps {
  label: string
  color: string
  onRemove: () => void
}

function FilterPill({ label, color, onRemove }: FilterPillProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onRemove}
      className={cn(
        "group inline-flex items-center gap-1.5 h-6 px-2 rounded-full text-xs font-medium",
        "transition-all hover:opacity-80",
        getPillColorClass(color)
      )}
    >
      {label}
      <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
    </motion.button>
  )
}

// ============================================================================
// Color Utilities
// ============================================================================

function getColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    slate: "text-slate-400",
    blue: "text-blue-400",
    orange: "text-orange-400",
    violet: "text-violet-400",
    emerald: "text-emerald-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
    gray: "text-gray-400",
    primary: "text-primary",
  }
  return colorMap[color] || "text-muted-foreground"
}

function getPillColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    slate: "bg-slate-500/20 text-slate-300",
    blue: "bg-blue-500/20 text-blue-300",
    orange: "bg-orange-500/20 text-orange-300",
    violet: "bg-violet-500/20 text-violet-300",
    emerald: "bg-emerald-500/20 text-emerald-300",
    red: "bg-red-500/20 text-red-300",
    yellow: "bg-yellow-500/20 text-yellow-300",
    gray: "bg-gray-500/20 text-gray-300",
    primary: "bg-primary/20 text-primary",
  }
  return colorMap[color] || "bg-muted text-muted-foreground"
}
