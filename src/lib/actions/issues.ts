"use server"

import { db } from "@/lib/db"
import { issues, projects, workspaces, workspaceMembers, projects as projectsTable } from "@/lib/db/schema"
import { eq, and, desc, asc } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createIssue(
  projectId: string,
  title: string,
  description?: string,
  status: string = "backlog",
  priority: string = "none",
  assigneeId?: string,
  parentId?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Get project and verify access
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId))
    .limit(1)

  if (!project) {
    throw new Error("Project not found")
  }

  // Verify user has access to workspace
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, project.workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      )
    )
    .limit(1)

  if (!member) {
    throw new Error("Unauthorized")
  }

  // Increment issue counter and generate identifier
  const issueNumber = project.issueCounter + 1
  const projectName = project.name.toUpperCase().replace(/\s+/g, "").substring(0, 4)
  const identifier = `${projectName}-${issueNumber}`

  // Update project counter
  await db
    .update(projectsTable)
    .set({ issueCounter: issueNumber })
    .where(eq(projectsTable.id, projectId))

  const [issue] = await db
    .insert(issues)
    .values({
      identifier,
      title,
      description,
      status,
      priority,
      projectId,
      workspaceId: project.workspaceId,
      assigneeId,
      parentId,
    })
    .returning()

  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, project.workspaceId))
    .limit(1)

  revalidatePath(`/dashboard/${workspace[0]?.slug}/projects/${projectId}`)
  return issue
}

export interface Issue {
  id: string
  identifier: string
  title: string
  description: string | null
  status: string
  priority: string
  position: number
  projectId: string
  workspaceId: string
  assigneeId: string | null
  parentId: string | null
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

export async function getIssues(projectId?: string, workspaceId?: string): Promise<Issue[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  let query = db.select().from(issues)

  if (projectId) {
    query = query.where(eq(issues.projectId, projectId)) as any
  } else if (workspaceId) {
    query = query.where(eq(issues.workspaceId, workspaceId)) as any
  }

  const allIssues = await query.orderBy(desc(issues.createdAt))

  // Filter by workspace access
  const accessibleIssues: Issue[] = []
  for (const issue of allIssues) {
    const [member] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, issue.workspaceId),
          eq(workspaceMembers.userId, session.user.id)
        )
      )
      .limit(1)

    if (member) {
      accessibleIssues.push(issue as Issue)
    }
  }

  return accessibleIssues
}

export async function getIssue(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  const [issue] = await db
    .select()
    .from(issues)
    .where(eq(issues.id, id))
    .limit(1)

  if (!issue) {
    return null
  }

  // Verify access
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, issue.workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      )
    )
    .limit(1)

  if (!member) {
    return null
  }

  return issue
}

export async function updateIssue(
  id: string,
  data: {
    title?: string
    description?: string
    status?: string
    priority?: string
    assigneeId?: string | null
    parentId?: string | null
  }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const issue = await getIssue(id)
  if (!issue) {
    throw new Error("Issue not found")
  }

  const updateData: any = {
    ...data,
    updatedAt: new Date(),
  }

  if (data.status === "done" && issue.status !== "done") {
    updateData.completedAt = new Date()
  } else if (data.status !== "done" && issue.status === "done") {
    updateData.completedAt = null
  }

  const [updated] = await db
    .update(issues)
    .set(updateData)
    .where(eq(issues.id, id))
    .returning()

  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, issue.workspaceId))
    .limit(1)

  revalidatePath(`/dashboard/${workspace[0]?.slug}/issue/${updated.identifier}`)
  return updated
}

export async function deleteIssue(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const issue = await getIssue(id)
  if (!issue) {
    throw new Error("Issue not found")
  }

  await db.delete(issues).where(eq(issues.id, id))

  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, issue.workspaceId))
    .limit(1)

  revalidatePath(`/dashboard/${workspace[0]?.slug}/projects/${issue.projectId}`)
}

export async function updateIssuePosition(
  id: string,
  newStatus: string,
  newPosition: number
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const issue = await getIssue(id)
  if (!issue) {
    throw new Error("Issue not found")
  }

  // Get all issues in the target column
  const targetIssues = await db
    .select()
    .from(issues)
    .where(
      and(
        eq(issues.projectId, issue.projectId),
        eq(issues.status, newStatus)
      )
    )
    .orderBy(asc(issues.position))

  // Calculate positions - shift other issues if needed
  const issuesToUpdate: { id: string; position: number }[] = []

  // If moving to a different column or changing position
  const otherIssues = targetIssues.filter((i) => i.id !== id)

  // Recalculate positions for all issues in the target column
  let position = 0
  let insertedActive = false

  for (const targetIssue of otherIssues) {
    if (position === newPosition && !insertedActive) {
      // This is where the active issue should go
      insertedActive = true
      position++
    }

    if (targetIssue.position !== position) {
      issuesToUpdate.push({ id: targetIssue.id, position })
    }
    position++
  }

  // If we haven't inserted yet, the active issue goes at the end
  const finalPosition = insertedActive ? newPosition : position

  // Update the dragged issue
  const updateData: any = {
    status: newStatus,
    position: finalPosition,
    updatedAt: new Date(),
  }

  // Handle completedAt for done status
  if (newStatus === "done" && issue.status !== "done") {
    updateData.completedAt = new Date()
  } else if (newStatus !== "done" && issue.status === "done") {
    updateData.completedAt = null
  }

  // Update the main issue
  const [updated] = await db
    .update(issues)
    .set(updateData)
    .where(eq(issues.id, id))
    .returning()

  // Update other affected issues' positions
  for (const issueToUpdate of issuesToUpdate) {
    await db
      .update(issues)
      .set({ position: issueToUpdate.position })
      .where(eq(issues.id, issueToUpdate.id))
  }

  // Revalidate paths
  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, issue.workspaceId))
    .limit(1)

  if (workspace[0]) {
    revalidatePath(`/w/${workspace[0].slug}/projects/${issue.projectId}`)
    revalidatePath(`/w/${workspace[0].slug}/projects/${issue.projectId}/board`)
  }

  return updated
}

