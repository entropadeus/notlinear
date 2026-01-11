import { IssueFilters } from "./types"

// URL parameter names
const PARAM_STATUS = "status"
const PARAM_PRIORITY = "priority"
const PARAM_ASSIGNEE = "assignee"
const PARAM_LABELS = "labels"
const PARAM_PROJECT = "project"
const PARAM_SEARCH = "q"

/**
 * Parse URL search params into IssueFilters
 * Example URL: ?status=todo,in_progress&priority=high&assignee=me
 */
export function parseFiltersFromURL(searchParams: URLSearchParams | Record<string, string | string[] | undefined>): IssueFilters {
  const filters: IssueFilters = {}

  // Helper to get param value (handles both URLSearchParams and plain object)
  const getParam = (key: string): string | null => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key)
    }
    const value = searchParams[key]
    if (Array.isArray(value)) return value[0] || null
    return value || null
  }

  // Parse comma-separated values
  const parseArray = (value: string | null): string[] | undefined => {
    if (!value) return undefined
    const items = value.split(",").map(s => s.trim()).filter(Boolean)
    return items.length > 0 ? items : undefined
  }

  filters.status = parseArray(getParam(PARAM_STATUS))
  filters.priority = parseArray(getParam(PARAM_PRIORITY))
  filters.assignee = parseArray(getParam(PARAM_ASSIGNEE))
  filters.labels = parseArray(getParam(PARAM_LABELS))
  filters.project = parseArray(getParam(PARAM_PROJECT))

  const search = getParam(PARAM_SEARCH)
  if (search) filters.search = search

  return filters
}

/**
 * Serialize IssueFilters to URL search params string
 * Returns empty string if no filters
 */
export function serializeFiltersToURL(filters: IssueFilters): string {
  const params = new URLSearchParams()

  if (filters.status && filters.status.length > 0) {
    params.set(PARAM_STATUS, filters.status.join(","))
  }
  if (filters.priority && filters.priority.length > 0) {
    params.set(PARAM_PRIORITY, filters.priority.join(","))
  }
  if (filters.assignee && filters.assignee.length > 0) {
    params.set(PARAM_ASSIGNEE, filters.assignee.join(","))
  }
  if (filters.labels && filters.labels.length > 0) {
    params.set(PARAM_LABELS, filters.labels.join(","))
  }
  if (filters.project && filters.project.length > 0) {
    params.set(PARAM_PROJECT, filters.project.join(","))
  }
  if (filters.search) {
    params.set(PARAM_SEARCH, filters.search)
  }

  const str = params.toString()
  return str ? `?${str}` : ""
}

/**
 * Merge new filters with existing filters
 * Passing undefined for a value keeps existing, passing [] clears it
 */
export function mergeFilters(existing: IssueFilters, updates: Partial<IssueFilters>): IssueFilters {
  const merged: IssueFilters = { ...existing }

  for (const key of Object.keys(updates) as (keyof IssueFilters)[]) {
    const value = updates[key]
    if (value === undefined) continue

    if (Array.isArray(value)) {
      if (value.length === 0) {
        delete merged[key]
      } else {
        (merged as any)[key] = value
      }
    } else if (value === "") {
      delete merged[key]
    } else {
      (merged as any)[key] = value
    }
  }

  return merged
}

/**
 * Toggle a value in a filter array
 * If value exists, remove it. If not, add it.
 */
export function toggleFilterValue(
  filters: IssueFilters,
  key: keyof Pick<IssueFilters, "status" | "priority" | "assignee" | "labels" | "project">,
  value: string
): IssueFilters {
  const existing = filters[key] || []
  const index = existing.indexOf(value)

  let updated: string[]
  if (index >= 0) {
    // Remove value
    updated = existing.filter((_, i) => i !== index)
  } else {
    // Add value
    updated = [...existing, value]
  }

  return mergeFilters(filters, { [key]: updated })
}

/**
 * Create URL with filters applied to current path
 */
export function createFilteredURL(basePath: string, filters: IssueFilters): string {
  const queryString = serializeFiltersToURL(filters)
  return `${basePath}${queryString}`
}
