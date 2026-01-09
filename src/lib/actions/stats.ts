"use server"

import { db } from "@/lib/db"
import { issues, projects, workspaces, workspaceMembers } from "@/lib/db/schema"
import { eq, and, count, sql } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
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

