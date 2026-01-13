"use server"

import { db } from "@/lib/db"
import { issues, projects, workspaces, workspaceMembers, issueRevisions, comments, users } from "@/lib/db/schema"
import { eq, and, count, sql, gte, lte } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { unstable_cache } from "next/cache"

export interface ProjectStats {
  projectId: string
  totalIssues: number
  backlog: number
  todo: number
  inProgress: number
  inReview: number
  done: number
  cancelled: number
}

// Map database status values to ProjectStats/StatusDistribution keys
const STATUS_KEY_MAP: Record<string, "backlog" | "todo" | "inProgress" | "inReview" | "done" | "cancelled"> = {
  backlog: "backlog",
  todo: "todo",
  in_progress: "inProgress",
  in_review: "inReview",
  done: "done",
  cancelled: "cancelled",
}

export interface WorkspaceStats {
  workspaceId: string
  totalProjects: number
  totalIssues: number
  completedIssues: number
  openIssues: number
}

export async function getProjectStats(projectId: string): Promise<ProjectStats | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  // Use SQL aggregations instead of loading all rows into memory
  const statsResult = await db
    .select({
      status: issues.status,
      count: count(),
    })
    .from(issues)
    .where(eq(issues.projectId, projectId))
    .groupBy(issues.status)

  // Initialize stats object
  const stats: ProjectStats = {
    projectId,
    totalIssues: 0,
    backlog: 0,
    todo: 0,
    inProgress: 0,
    inReview: 0,
    done: 0,
    cancelled: 0,
  }

  // Aggregate counts by status
  for (const row of statsResult) {
    stats.totalIssues += row.count
    const key = STATUS_KEY_MAP[row.status]
    if (key) {
      stats[key] = row.count
    }
  }

  return stats
}

export async function getWorkspaceStats(workspaceId: string): Promise<WorkspaceStats | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  // Cache workspace stats for 2 minutes to reduce database load
  const getCachedWorkspaceStats = unstable_cache(
    async (workspaceId: string, userId: string) => {
      const [member] = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId)
          )
        )
        .limit(1)

      if (!member) {
        return null
      }

      // Use COUNT aggregations instead of loading all rows
      const [projectCount] = await db
        .select({ count: count() })
        .from(projects)
        .where(eq(projects.workspaceId, workspaceId))

      // Get issue counts by status using SQL aggregations
      const issueStats = await db
        .select({
          status: issues.status,
          count: count(),
        })
        .from(issues)
        .where(eq(issues.workspaceId, workspaceId))
        .groupBy(issues.status)

      let totalIssues = 0
      let completedIssues = 0
      let openIssues = 0

      for (const row of issueStats) {
        totalIssues += row.count
        if (row.status === "done") {
          completedIssues = row.count
        }
        if (row.status !== "done" && row.status !== "cancelled") {
          openIssues += row.count
        }
      }

      return {
        workspaceId,
        totalProjects: projectCount?.count || 0,
        totalIssues,
        completedIssues,
        openIssues,
      }
    },
    [`workspace-stats-${workspaceId}`],
    { revalidate: 120 } // Cache for 2 minutes
  )

  return getCachedWorkspaceStats(workspaceId, session.user.id)
}

export async function getAllProjectsStats(workspaceId: string): Promise<Map<string, ProjectStats>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Map()
  }

  const workspaceProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))

  if (workspaceProjects.length === 0) {
    return new Map()
  }

  const projectIds = workspaceProjects.map(p => p.id)

  // Use SQL aggregations grouped by projectId and status
  const issueStats = await db
    .select({
      projectId: issues.projectId,
      status: issues.status,
      count: count(),
    })
    .from(issues)
    .where(eq(issues.workspaceId, workspaceId))
    .groupBy(issues.projectId, issues.status)

  const statsMap = new Map<string, ProjectStats>()

  // Initialize stats for all projects
  for (const project of workspaceProjects) {
    statsMap.set(project.id, {
      projectId: project.id,
      totalIssues: 0,
      backlog: 0,
      todo: 0,
      inProgress: 0,
      inReview: 0,
      done: 0,
      cancelled: 0,
    })
  }

  // Aggregate counts by project and status
  for (const row of issueStats) {
    const stats = statsMap.get(row.projectId)
    if (!stats) continue

    stats.totalIssues += row.count
    const key = STATUS_KEY_MAP[row.status]
    if (key) {
      stats[key] = row.count
    }
  }

  return statsMap
}

// Status distribution for dashboard chart
export interface StatusDistribution {
  total: number
  backlog: number
  todo: number
  inProgress: number
  inReview: number
  done: number
  cancelled: number
}

/**
 * Get issue status distribution across all workspaces the user has access to
 */
export async function getStatusDistribution(): Promise<StatusDistribution> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return {
      total: 0,
      backlog: 0,
      todo: 0,
      inProgress: 0,
      inReview: 0,
      done: 0,
      cancelled: 0,
    }
  }

  // Get all workspaces user is a member of
  const userWorkspaces = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))

  if (userWorkspaces.length === 0) {
    return {
      total: 0,
      backlog: 0,
      todo: 0,
      inProgress: 0,
      inReview: 0,
      done: 0,
      cancelled: 0,
    }
  }

  const workspaceIds = userWorkspaces.map(w => w.workspaceId)

  // Use SQL aggregations instead of loading all rows
  const statusStats = await db
    .select({
      status: issues.status,
      count: count(),
    })
    .from(issues)
    .where(
      workspaceIds.length === 1
        ? eq(issues.workspaceId, workspaceIds[0])
        : sql`${issues.workspaceId} IN (${sql.join(workspaceIds.map(id => sql`${id}`), sql`, `)})`
    )
    .groupBy(issues.status)

  // Initialize distribution
  const distribution: StatusDistribution = {
    total: 0,
    backlog: 0,
    todo: 0,
    inProgress: 0,
    inReview: 0,
    done: 0,
    cancelled: 0,
  }

  // Aggregate counts by status
  for (const row of statusStats) {
    distribution.total += row.count
    const key = STATUS_KEY_MAP[row.status]
    if (key) {
      distribution[key] = row.count
    }
  }

  return distribution
}

// Activity data point for trend chart
export interface ActivityDataPoint {
  date: string // ISO date string (YYYY-MM-DD)
  count: number
}

export interface ActivityTrend {
  data: ActivityDataPoint[]
  totalThisWeek: number
  totalLastWeek: number
  percentChange: number | null // null when baseline is too low for meaningful percentage
}

/**
 * Get activity trend data for the last N days
 * Aggregates issue creations, revisions, and comments
 */
export async function getActivityTrend(days: number = 28): Promise<ActivityTrend> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { data: [], totalThisWeek: 0, totalLastWeek: 0, percentChange: 0 }
  }

  // Get all workspaces user is a member of
  const userWorkspaces = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))

  if (userWorkspaces.length === 0) {
    return { data: [], totalThisWeek: 0, totalLastWeek: 0, percentChange: 0 }
  }

  const workspaceIds = userWorkspaces.map(w => w.workspaceId)
  const workspaceFilter = workspaceIds.length === 1
    ? eq(issues.workspaceId, workspaceIds[0])
    : sql`${issues.workspaceId} IN (${sql.join(workspaceIds.map(id => sql`${id}`), sql`, `)})`

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

   const startTimestamp = Math.floor(startDate.getTime() / 1000)
   const endTimestamp = Math.floor(endDate.getTime() / 1000)

   // Get all activity types in parallel for better performance
   const [issueActivity, revisionActivity, commentActivity] = await Promise.all([
     // Issue creation activity
     db
       .select({
         date: sql<string>`date(${issues.createdAt}, 'unixepoch')`.as('date'),
         count: count(),
       })
       .from(issues)
       .where(and(
         workspaceFilter,
         sql`${issues.createdAt} >= ${startTimestamp}`,
         sql`${issues.createdAt} <= ${endTimestamp}`
       ))
       .groupBy(sql`date(${issues.createdAt}, 'unixepoch')`),

     // Revision activity
     db
       .select({
         date: sql<string>`date(${issueRevisions.createdAt}, 'unixepoch')`.as('date'),
         count: count(),
       })
       .from(issueRevisions)
       .innerJoin(issues, eq(issueRevisions.issueId, issues.id))
       .where(and(
         workspaceFilter,
         sql`${issueRevisions.createdAt} >= ${startTimestamp}`,
         sql`${issueRevisions.createdAt} <= ${endTimestamp}`
       ))
       .groupBy(sql`date(${issueRevisions.createdAt}, 'unixepoch')`),

     // Comment activity
     db
       .select({
         date: sql<string>`date(${comments.createdAt}, 'unixepoch')`.as('date'),
         count: count(),
       })
       .from(comments)
       .innerJoin(issues, eq(comments.issueId, issues.id))
       .where(and(
         workspaceFilter,
         sql`${comments.createdAt} >= ${startTimestamp}`,
         sql`${comments.createdAt} <= ${endTimestamp}`
       ))
       .groupBy(sql`date(${comments.createdAt}, 'unixepoch')`)
   ])

   // Merge all activity into a single map
   const activityMap = new Map<string, number>()

  // Initialize all dates with 0
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    activityMap.set(dateStr, 0)
  }

  // Add issue creations
  for (const row of issueActivity) {
    const current = activityMap.get(row.date) || 0
    activityMap.set(row.date, current + row.count)
  }

  // Add revisions
  for (const row of revisionActivity) {
    const current = activityMap.get(row.date) || 0
    activityMap.set(row.date, current + row.count)
  }

  // Add comments
  for (const row of commentActivity) {
    const current = activityMap.get(row.date) || 0
    activityMap.set(row.date, current + row.count)
  }

  // Convert to sorted array
  const data: ActivityDataPoint[] = Array.from(activityMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))

  // Calculate week-over-week change
  const today = new Date()
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)
  const twoWeeksAgo = new Date(today)
  twoWeeksAgo.setDate(today.getDate() - 14)

  let totalThisWeek = 0
  let totalLastWeek = 0

  for (const point of data) {
    const pointDate = new Date(point.date)
    if (pointDate >= oneWeekAgo && pointDate <= today) {
      totalThisWeek += point.count
    } else if (pointDate >= twoWeeksAgo && pointDate < oneWeekAgo) {
      totalLastWeek += point.count
    }
  }

  // Only show percent change if:
  // 1. We have a meaningful baseline (at least 5 activities last week)
  // 2. The percentage isn't absurdly high (cap at 500%)
  // Otherwise the percentage is misleading and we show absolute numbers instead
  const rawPercentChange = totalLastWeek >= 5
    ? Math.round(((totalThisWeek - totalLastWeek) / totalLastWeek) * 100)
    : null

  // If percentage is over 500%, it's not useful info - show absolute numbers instead
  const percentChange = rawPercentChange !== null && Math.abs(rawPercentChange) <= 500
    ? rawPercentChange
    : null

  return { data, totalThisWeek, totalLastWeek, percentChange }
}

// Heatmap data for activity visualization
export interface HeatmapDataPoint {
  date: string // ISO date string (YYYY-MM-DD)
  count: number
  level: 0 | 1 | 2 | 3 | 4 // Intensity level for coloring
}

export interface ActivityHeatmapData {
  data: HeatmapDataPoint[]
  totalActivities: number
  maxCount: number
}

/**
 * Get activity heatmap data for the last year (365 days)
 * Similar to GitHub's contribution graph
 */
export async function getActivityHeatmapData(): Promise<ActivityHeatmapData> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { data: [], totalActivities: 0, maxCount: 0 }
  }

  // Get all workspaces user is a member of
  const userWorkspaces = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))

  if (userWorkspaces.length === 0) {
    return { data: [], totalActivities: 0, maxCount: 0 }
  }

  const workspaceIds = userWorkspaces.map(w => w.workspaceId)
  const workspaceFilter = workspaceIds.length === 1
    ? eq(issues.workspaceId, workspaceIds[0])
    : sql`${issues.workspaceId} IN (${sql.join(workspaceIds.map(id => sql`${id}`), sql`, `)})`

  // Calculate date range - 365 days back, using UTC to match SQL date() function
  const today = new Date()
  const endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999))
  const startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 364))

  const startTimestamp = Math.floor(startDate.getTime() / 1000)
  const endTimestamp = Math.floor(endDate.getTime() / 1000)

  // Get issue creation activity grouped by date
  const issueActivity = await db
    .select({
      date: sql<string>`date(${issues.createdAt}, 'unixepoch')`.as('date'),
      count: count(),
    })
    .from(issues)
    .where(and(
      workspaceFilter,
      sql`${issues.createdAt} >= ${startTimestamp}`,
      sql`${issues.createdAt} <= ${endTimestamp}`
    ))
    .groupBy(sql`date(${issues.createdAt}, 'unixepoch')`)

  // Get revision activity grouped by date
  const revisionActivity = await db
    .select({
      date: sql<string>`date(${issueRevisions.createdAt}, 'unixepoch')`.as('date'),
      count: count(),
    })
    .from(issueRevisions)
    .innerJoin(issues, eq(issueRevisions.issueId, issues.id))
    .where(and(
      workspaceFilter,
      sql`${issueRevisions.createdAt} >= ${startTimestamp}`,
      sql`${issueRevisions.createdAt} <= ${endTimestamp}`
    ))
    .groupBy(sql`date(${issueRevisions.createdAt}, 'unixepoch')`)

  // Get comment activity grouped by date
  const commentActivity = await db
    .select({
      date: sql<string>`date(${comments.createdAt}, 'unixepoch')`.as('date'),
      count: count(),
    })
    .from(comments)
    .innerJoin(issues, eq(comments.issueId, issues.id))
    .where(and(
      workspaceFilter,
      sql`${comments.createdAt} >= ${startTimestamp}`,
      sql`${comments.createdAt} <= ${endTimestamp}`
    ))
    .groupBy(sql`date(${comments.createdAt}, 'unixepoch')`)

  // Merge all activity into a single map
  const activityMap = new Map<string, number>()

  // Initialize all dates with 0 - use UTC dates to match frontend
  for (let i = 0; i <= 364; i++) {
    const date = new Date(startDate)
    date.setUTCDate(startDate.getUTCDate() + i)
    const dateStr = date.getUTCFullYear() + '-' +
      String(date.getUTCMonth() + 1).padStart(2, '0') + '-' +
      String(date.getUTCDate()).padStart(2, '0')
    activityMap.set(dateStr, 0)
  }

  // Add issue creations
  for (const row of issueActivity) {
    const current = activityMap.get(row.date) || 0
    activityMap.set(row.date, current + row.count)
  }

  // Add revisions
  for (const row of revisionActivity) {
    const current = activityMap.get(row.date) || 0
    activityMap.set(row.date, current + row.count)
  }

  // Add comments
  for (const row of commentActivity) {
    const current = activityMap.get(row.date) || 0
    activityMap.set(row.date, current + row.count)
  }

  // Find max count for level calculation
  let maxCount = 0
  let totalActivities = 0
  activityMap.forEach((count) => {
    if (count > maxCount) maxCount = count
    totalActivities += count
  })

  // Convert to sorted array with levels
  const data: HeatmapDataPoint[] = Array.from(activityMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => {
      // Calculate level based on quartiles (GitHub-style)
      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (count > 0 && maxCount > 0) {
        const ratio = count / maxCount
        if (ratio <= 0.25) level = 1
        else if (ratio <= 0.5) level = 2
        else if (ratio <= 0.75) level = 3
        else level = 4
      }
      return { date, count, level }
    })

  return { data, totalActivities, maxCount }
}

// Most active project data
export interface MostActiveProject {
  id: string
  name: string
  identifier: string
  workspaceName: string
  issueCount: number // total issues in project
  openIssues: number
  completedIssues: number
}

/**
 * Get the project with the most issues across all user's workspaces
 */
// Recent activity item for activity feed
export interface RecentActivityItem {
  id: string
  type: "issue_created" | "issue_updated" | "comment_added"
  timestamp: number
  issueId: string
  issueIdentifier: string
  issueTitle: string
  projectName: string
  workspaceSlug: string
  // For updates: which field changed
  field?: string
  oldValue?: string | null
  newValue?: string | null
  // For comments: preview text
  commentPreview?: string
  // Actor info
  actorId: string
  actorName: string
  actorImage: string | null
}

/**
 * Get recent activity across all workspaces
 */
export async function getRecentActivity(limit: number = 10): Promise<RecentActivityItem[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  // Get all workspaces user is a member of
  const userWorkspaces = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))

  if (userWorkspaces.length === 0) {
    return []
  }

  const workspaceIds = userWorkspaces.map(w => w.workspaceId)
  const workspaceFilter = workspaceIds.length === 1
    ? eq(issues.workspaceId, workspaceIds[0])
    : sql`${issues.workspaceId} IN (${sql.join(workspaceIds.map(id => sql`${id}`), sql`, `)})`

  // Get recent issue creations
  const recentIssues = await db
    .select({
      id: issues.id,
      identifier: issues.identifier,
      title: issues.title,
      createdAt: issues.createdAt,
      projectName: projects.name,
      workspaceSlug: workspaces.slug,
      actorId: issues.assigneeId,
    })
    .from(issues)
    .innerJoin(projects, eq(issues.projectId, projects.id))
    .innerJoin(workspaces, eq(issues.workspaceId, workspaces.id))
    .where(workspaceFilter)
    .orderBy(sql`${issues.createdAt} DESC`)
    .limit(limit)

  // Get recent revisions
  const recentRevisions = await db
    .select({
      id: issueRevisions.id,
      issueId: issueRevisions.issueId,
      field: issueRevisions.field,
      oldValue: issueRevisions.oldValue,
      newValue: issueRevisions.newValue,
      createdAt: issueRevisions.createdAt,
      authorId: issueRevisions.authorId,
      issueIdentifier: issues.identifier,
      issueTitle: issues.title,
      projectName: projects.name,
      workspaceSlug: workspaces.slug,
    })
    .from(issueRevisions)
    .innerJoin(issues, eq(issueRevisions.issueId, issues.id))
    .innerJoin(projects, eq(issues.projectId, projects.id))
    .innerJoin(workspaces, eq(issues.workspaceId, workspaces.id))
    .where(workspaceFilter)
    .orderBy(sql`${issueRevisions.createdAt} DESC`)
    .limit(limit)

  // Get recent comments
  const recentComments = await db
    .select({
      id: comments.id,
      issueId: comments.issueId,
      content: comments.content,
      createdAt: comments.createdAt,
      authorId: comments.authorId,
      issueIdentifier: issues.identifier,
      issueTitle: issues.title,
      projectName: projects.name,
      workspaceSlug: workspaces.slug,
    })
    .from(comments)
    .innerJoin(issues, eq(comments.issueId, issues.id))
    .innerJoin(projects, eq(issues.projectId, projects.id))
    .innerJoin(workspaces, eq(issues.workspaceId, workspaces.id))
    .where(workspaceFilter)
    .orderBy(sql`${comments.createdAt} DESC`)
    .limit(limit)

  // Get user info for actors
  const actorIds = new Set<string>()
  recentIssues.forEach(i => i.actorId && actorIds.add(i.actorId))
  recentRevisions.forEach(r => r.authorId && actorIds.add(r.authorId))
  recentComments.forEach(c => c.authorId && actorIds.add(c.authorId))
  // Add current user as fallback for issue creators
  actorIds.add(session.user.id)

  const actorIdsArray = Array.from(actorIds)
  const actorsData = actorIdsArray.length > 0
    ? await db
        .select({
          id: users.id,
          name: users.name,
          image: users.image,
        })
        .from(users)
        .where(sql`${users.id} IN (${sql.join(actorIdsArray.map(id => sql`${id}`), sql`, `)})`)
    : []

  const actorsMap = new Map(actorsData.map(a => [a.id, a]))

  // Combine and sort all activities
  const activities: RecentActivityItem[] = []

  // Add issue creations
  for (const issue of recentIssues) {
    const actor = actorsMap.get(issue.actorId || session.user.id) || { name: "Unknown", image: null }
    activities.push({
      id: `issue-${issue.id}`,
      type: "issue_created",
      timestamp: typeof issue.createdAt === 'number' ? issue.createdAt : Math.floor(new Date(issue.createdAt).getTime() / 1000),
      issueId: issue.id,
      issueIdentifier: issue.identifier,
      issueTitle: issue.title,
      projectName: issue.projectName,
      workspaceSlug: issue.workspaceSlug,
      actorId: issue.actorId || session.user.id,
      actorName: actor.name || "Unknown",
      actorImage: actor.image,
    })
  }

  // Add revisions
  for (const rev of recentRevisions) {
    const actor = actorsMap.get(rev.authorId) || { name: "Unknown", image: null }
    activities.push({
      id: `rev-${rev.id}`,
      type: "issue_updated",
      timestamp: typeof rev.createdAt === 'number' ? rev.createdAt : Math.floor(new Date(rev.createdAt).getTime() / 1000),
      issueId: rev.issueId,
      issueIdentifier: rev.issueIdentifier,
      issueTitle: rev.issueTitle,
      projectName: rev.projectName,
      workspaceSlug: rev.workspaceSlug,
      field: rev.field,
      oldValue: rev.oldValue,
      newValue: rev.newValue,
      actorId: rev.authorId,
      actorName: actor.name || "Unknown",
      actorImage: actor.image,
    })
  }

  // Add comments
  for (const comment of recentComments) {
    const actor = actorsMap.get(comment.authorId) || { name: "Unknown", image: null }
    activities.push({
      id: `comment-${comment.id}`,
      type: "comment_added",
      timestamp: typeof comment.createdAt === 'number' ? comment.createdAt : Math.floor(new Date(comment.createdAt).getTime() / 1000),
      issueId: comment.issueId,
      issueIdentifier: comment.issueIdentifier,
      issueTitle: comment.issueTitle,
      projectName: comment.projectName,
      workspaceSlug: comment.workspaceSlug,
      commentPreview: comment.content?.substring(0, 100) || "",
      actorId: comment.authorId,
      actorName: actor.name || "Unknown",
      actorImage: actor.image,
    })
  }

  // Sort by timestamp descending and limit
  activities.sort((a, b) => b.timestamp - a.timestamp)
  return activities.slice(0, limit)
}

export async function getMostActiveProject(): Promise<MostActiveProject | null> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return null
    }

    // Get all workspaces user is a member of
    const userWorkspaces = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, session.user.id))

    if (userWorkspaces.length === 0) {
      return null
    }

    const workspaceIds = userWorkspaces.map(w => w.workspaceId)

    // Get issue counts per project and status
    const projectsWithCounts = await db
      .select({
        projectId: issues.projectId,
        status: issues.status,
        count: count(),
      })
      .from(issues)
      .where(
        workspaceIds.length === 1
          ? eq(issues.workspaceId, workspaceIds[0])
          : sql`${issues.workspaceId} IN (${sql.join(workspaceIds.map(id => sql`${id}`), sql`, `)})`
      )
      .groupBy(issues.projectId, issues.status)

    if (projectsWithCounts.length === 0) {
      return null
    }

    // Aggregate by project
    const projectStats = new Map<string, { total: number; open: number; completed: number }>()
    for (const row of projectsWithCounts) {
      const existing = projectStats.get(row.projectId) || { total: 0, open: 0, completed: 0 }
      existing.total += row.count
      if (row.status === "done") {
        existing.completed += row.count
      } else if (row.status !== "cancelled") {
        existing.open += row.count
      }
      projectStats.set(row.projectId, existing)
    }

    // Find project with most total issues
    let topProjectId: string | null = null
    let maxIssues = 0
    projectStats.forEach((stats, projectId) => {
      if (stats.total > maxIssues) {
        maxIssues = stats.total
        topProjectId = projectId
      }
    })

    if (!topProjectId || maxIssues === 0) {
      return null
    }

    const topStats = projectStats.get(topProjectId)!

    // Get project details (use .select() without object to work around Drizzle bug)
    const [projectData] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, topProjectId))
      .limit(1)

    if (!projectData) {
      return null
    }

    // Get workspace name (use .select() without object to work around Drizzle bug)
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, projectData.workspaceId))
      .limit(1)

    return {
      id: projectData.id,
      name: projectData.name,
      identifier: projectData.name, // Projects don't have identifiers like issues, use name
      workspaceName: workspace?.name || "Unknown",
      issueCount: topStats.total,
      openIssues: topStats.open,
      completedIssues: topStats.completed,
    }
  } catch (error) {
    console.error("[getMostActiveProject] Error:", error)
    return null
  }
}

