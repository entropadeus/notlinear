"use server"

import { db } from "@/lib/db"
import { issues, views, workspaceMembers, users, labels, issueLabels, projects } from "@/lib/db/schema"
import { eq, and, or, inArray, desc, asc, like, isNull, sql } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { IssueFilters, SavedView, ASSIGNEE_ME, ASSIGNEE_NONE } from "@/lib/filters/types"
import { Issue } from "./issues"

// ============================================================================
// Filtered Issues
// ============================================================================

export interface GetFilteredIssuesOptions {
  workspaceId: string
  projectId?: string
  filters: IssueFilters
  sortBy?: "createdAt" | "updatedAt" | "priority" | "status"
  sortOrder?: "asc" | "desc"
  limit?: number
  offset?: number
}

export async function getFilteredIssues(options: GetFilteredIssuesOptions): Promise<Issue[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  const { workspaceId, projectId, filters, sortBy = "createdAt", sortOrder = "desc" } = options

  // Verify user has access to workspace
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
    return []
  }

  // Build conditions array
  const conditions: ReturnType<typeof eq>[] = []

  // Always filter by workspace
  conditions.push(eq(issues.workspaceId, workspaceId))

  // Project filter
  if (projectId) {
    conditions.push(eq(issues.projectId, projectId))
  } else if (filters.project && filters.project.length > 0) {
    conditions.push(inArray(issues.projectId, filters.project))
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    conditions.push(inArray(issues.status, filters.status))
  }

  // Priority filter
  if (filters.priority && filters.priority.length > 0) {
    conditions.push(inArray(issues.priority, filters.priority))
  }

  // Assignee filter
  if (filters.assignee && filters.assignee.length > 0) {
    const assigneeConditions: ReturnType<typeof eq>[] = []

    for (const assignee of filters.assignee) {
      if (assignee === ASSIGNEE_ME) {
        assigneeConditions.push(eq(issues.assigneeId, session.user.id))
      } else if (assignee === ASSIGNEE_NONE) {
        assigneeConditions.push(isNull(issues.assigneeId))
      } else {
        assigneeConditions.push(eq(issues.assigneeId, assignee))
      }
    }

    if (assigneeConditions.length === 1) {
      conditions.push(assigneeConditions[0])
    } else if (assigneeConditions.length > 1) {
      conditions.push(or(...assigneeConditions)!)
    }
  }

  // Text search
  if (filters.search) {
    const searchTerm = `%${filters.search}%`
    conditions.push(
      or(
        like(issues.title, searchTerm),
        like(issues.description, searchTerm),
        like(issues.identifier, searchTerm)
      )!
    )
  }

  // Build sort
  const orderBy = sortOrder === "asc"
    ? asc(issues[sortBy])
    : desc(issues[sortBy])

  // Execute query with left join for assignee info
  const result = await db
    .select({
      id: issues.id,
      identifier: issues.identifier,
      title: issues.title,
      description: issues.description,
      status: issues.status,
      priority: issues.priority,
      position: issues.position,
      projectId: issues.projectId,
      workspaceId: issues.workspaceId,
      assigneeId: issues.assigneeId,
      parentId: issues.parentId,
      createdAt: issues.createdAt,
      updatedAt: issues.updatedAt,
      completedAt: issues.completedAt,
      assigneeName: users.name,
      assigneeImage: users.image,
    })
    .from(issues)
    .leftJoin(users, eq(issues.assigneeId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)

  // Map to include assignee object
  const mappedResult: Issue[] = result.map(issue => ({
    ...issue,
    assignee: issue.assigneeId ? {
      id: issue.assigneeId,
      name: issue.assigneeName,
      image: issue.assigneeImage,
    } : null,
  }))

  // Handle label filtering (post-query since it's a join)
  if (filters.labels && filters.labels.length > 0) {
    // Get issue IDs that have ANY of the specified labels
    const labelLinks = await db
      .select({ issueId: issueLabels.issueId })
      .from(issueLabels)
      .where(inArray(issueLabels.labelId, filters.labels))

    const issueIdsWithLabels = new Set(labelLinks.map(l => l.issueId))
    return mappedResult.filter(issue => issueIdsWithLabels.has(issue.id))
  }

  return mappedResult
}

// ============================================================================
// Workspace Members (for assignee filter dropdown)
// ============================================================================

export interface WorkspaceMember {
  id: string
  name: string
  email: string
  image: string | null
}

export async function getWorkspaceMembersForFilter(workspaceId: string): Promise<WorkspaceMember[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId))

  return members
}

// ============================================================================
// Labels (for label filter dropdown)
// ============================================================================

export interface LabelOption {
  id: string
  name: string
  color: string
}

export async function getLabelsForFilter(workspaceId: string): Promise<LabelOption[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  const result = await db
    .select({
      id: labels.id,
      name: labels.name,
      color: labels.color,
    })
    .from(labels)
    .where(eq(labels.workspaceId, workspaceId))
    .orderBy(asc(labels.name))

  return result
}

// ============================================================================
// Projects (for project filter dropdown in workspace views)
// ============================================================================

export interface ProjectOption {
  id: string
  name: string
  icon: string | null
  color: string
}

export async function getProjectsForFilter(workspaceId: string): Promise<ProjectOption[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  const result = await db
    .select({
      id: projects.id,
      name: projects.name,
      icon: projects.icon,
      color: projects.color,
    })
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .orderBy(asc(projects.name))

  return result
}

// ============================================================================
// Saved Views
// ============================================================================

export async function getViews(workspaceId: string, projectId?: string): Promise<SavedView[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  const conditions = [eq(views.workspaceId, workspaceId)]

  if (projectId) {
    conditions.push(eq(views.projectId, projectId))
  } else {
    conditions.push(isNull(views.projectId))
  }

  // Get views created by user OR shared views
  conditions.push(
    or(
      eq(views.createdById, session.user.id),
      eq(views.isShared, true)
    )!
  )

  const result = await db
    .select()
    .from(views)
    .where(and(...conditions))
    .orderBy(asc(views.position), desc(views.createdAt))

  return result.map(v => ({
    ...v,
    filters: JSON.parse(v.filters) as IssueFilters,
    isShared: v.isShared ?? false,
  }))
}

export async function createView(data: {
  name: string
  description?: string
  filters: IssueFilters
  workspaceId: string
  projectId?: string
  icon?: string
  color?: string
  isShared?: boolean
}): Promise<SavedView | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  // Get max position
  const [maxPos] = await db
    .select({ maxPosition: sql<number>`MAX(${views.position})` })
    .from(views)
    .where(eq(views.workspaceId, data.workspaceId))

  const position = (maxPos?.maxPosition ?? 0) + 1

  const result = await db
    .insert(views)
    .values({
      name: data.name,
      description: data.description,
      filters: JSON.stringify(data.filters),
      workspaceId: data.workspaceId,
      projectId: data.projectId,
      createdById: session.user.id,
      icon: data.icon,
      color: data.color,
      isShared: data.isShared ?? false,
      position,
    })
    .returning()

  const view = Array.isArray(result) ? result[0] : null
  if (!view) return null

  revalidatePath(`/w/`)

  return {
    ...view,
    filters: JSON.parse(view.filters) as IssueFilters,
    isShared: view.isShared ?? false,
  }
}

export async function updateView(
  viewId: string,
  data: Partial<{
    name: string
    description: string
    filters: IssueFilters
    icon: string
    color: string
    isShared: boolean
    position: number
  }>
): Promise<SavedView | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  // Verify ownership
  const [existing] = await db
    .select()
    .from(views)
    .where(eq(views.id, viewId))
    .limit(1)

  if (!existing || existing.createdById !== session.user.id) {
    return null
  }

  const updateData: any = { updatedAt: new Date() }
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.filters !== undefined) updateData.filters = JSON.stringify(data.filters)
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.color !== undefined) updateData.color = data.color
  if (data.isShared !== undefined) updateData.isShared = data.isShared
  if (data.position !== undefined) updateData.position = data.position

  const result = await db
    .update(views)
    .set(updateData)
    .where(eq(views.id, viewId))
    .returning()

  const view = Array.isArray(result) ? result[0] : null
  if (!view) return null

  revalidatePath(`/w/`)

  return {
    ...view,
    filters: JSON.parse(view.filters) as IssueFilters,
    isShared: view.isShared ?? false,
  }
}

export async function deleteView(viewId: string): Promise<boolean> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return false
  }

  // Verify ownership
  const [existing] = await db
    .select()
    .from(views)
    .where(eq(views.id, viewId))
    .limit(1)

  if (!existing || existing.createdById !== session.user.id) {
    return false
  }

  await db.delete(views).where(eq(views.id, viewId))

  revalidatePath(`/w/`)

  return true
}
