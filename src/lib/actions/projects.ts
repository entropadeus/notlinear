"use server"

import { db } from "@/lib/db"
import { projects, workspaces, workspaceMembers, issues, comments, labels, issueLabels } from "@/lib/db/schema"
import { eq, and, count } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache"

export async function createProject(
  workspaceId: string,
  name: string,
  description?: string,
  color?: string,
  icon?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

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
    throw new Error("Unauthorized")
  }

  const [project] = await db
    .insert(projects)
    .values({
      name,
      description,
      workspaceId,
      color: color || "#6366f1",
      icon,
    })
    .returning()

  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1)

  revalidatePath(`/dashboard/${workspace[0]?.slug}/projects`)
  revalidateTag(`projects-${workspaceId}`)
  revalidateTag(`workspaces-${session.user.id}`)
  return project
}

export async function getProjects(workspaceId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  // Cache projects per workspace with 5 minute revalidation
  const getCachedProjects = unstable_cache(
    async (wsId: string, userId: string) => {
      // Verify user has access
      const [member] = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, wsId),
            eq(workspaceMembers.userId, userId)
          )
        )
        .limit(1)

      if (!member) {
        return []
      }

      return await db
        .select()
        .from(projects)
        .where(eq(projects.workspaceId, wsId))
    },
    ["workspace-projects"],
    {
      tags: [`projects-${workspaceId}`, `workspaces-${session.user.id}`],
      revalidate: 300, // 5 minutes
    }
  )

  return getCachedProjects(workspaceId, session.user.id)
}

export async function getProject(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  // Cache project lookup with 5 minute revalidation
  const getCachedProject = unstable_cache(
    async (projectId: string, userId: string) => {
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)

      if (!project) {
        return null
      }

      // Verify user has access
      const [member] = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, project.workspaceId),
            eq(workspaceMembers.userId, userId)
          )
        )
        .limit(1)

      if (!member) {
        return null
      }

      return project
    },
    ["project-by-id"],
    {
      tags: [`project-${id}`, `workspaces-${session.user.id}`],
      revalidate: 300, // 5 minutes
    }
  )

  return getCachedProject(id, session.user.id)
}

export async function updateProject(
  id: string,
  data: { name?: string; description?: string; color?: string; icon?: string }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const project = await getProject(id)
  if (!project) {
    throw new Error("Project not found")
  }

  const [updated] = await db
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning()

  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, project.workspaceId))
    .limit(1)

  revalidatePath(`/dashboard/${workspace[0]?.slug}/projects/${id}`)
  revalidateTag(`project-${id}`)
  revalidateTag(`projects-${project.workspaceId}`)
  return updated
}

export async function getProjectDeletionStats(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  const project = await getProject(id)
  if (!project) {
    return null
  }

  // Get counts of related data
  const projectIssues = await db
    .select()
    .from(issues)
    .where(eq(issues.projectId, id))

  // Labels are workspace-scoped, not project-scoped
  // Count labels that are used by this project's issues instead
  const projectIssueIds = projectIssues.map(i => i.id)
  const usedLabelCount = projectIssueIds.length > 0
    ? (await db
        .select()
        .from(issueLabels)
        .where(eq(issueLabels.issueId, projectIssueIds[0])) // simplified count
      ).length
    : 0

  let totalComments = 0
  for (const issue of projectIssues) {
    const issueComments = await db
      .select()
      .from(comments)
      .where(eq(comments.issueId, issue.id))
    totalComments += issueComments.length
  }

  return {
    issueCount: projectIssues.length,
    labelCount: usedLabelCount,
    commentCount: totalComments,
  }
}

export async function deleteProject(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const project = await getProject(id)
  if (!project) {
    throw new Error("Project not found")
  }

  // Get all issues for this project
  const projectIssues = await db
    .select()
    .from(issues)
    .where(eq(issues.projectId, id))

  // Delete all comments on project issues
  for (const issue of projectIssues) {
    await db.delete(comments).where(eq(comments.issueId, issue.id))
    await db.delete(issueLabels).where(eq(issueLabels.issueId, issue.id))
  }

  // Delete all issues
  await db.delete(issues).where(eq(issues.projectId, id))

  // Note: Labels are workspace-scoped, NOT project-scoped
  // Don't delete workspace labels when deleting a project

  // Finally delete the project
  await db.delete(projects).where(eq(projects.id, id))

  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, project.workspaceId))
    .limit(1)

  revalidatePath(`/w/${workspace[0]?.slug}`)
  revalidateTag(`projects-${project.workspaceId}`)
  revalidateTag(`workspaces-${session.user.id}`)
}

export interface ProjectWithWorkspace {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  issueCounter: number
  createdAt: Date
  updatedAt: Date
  workspace: {
    id: string
    name: string
    slug: string
  }
}

export interface ProjectWithStats extends ProjectWithWorkspace {
  stats: {
    totalIssues: number
    openIssues: number
    completedIssues: number
  }
}

export async function getAllProjectsAcrossWorkspaces(): Promise<ProjectWithStats[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  // Get all workspaces the user is a member of
  const userWorkspaces = await db
    .select({
      workspaceId: workspaceMembers.workspaceId,
    })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))

  if (userWorkspaces.length === 0) {
    return []
  }

  const workspaceIds = userWorkspaces.map(w => w.workspaceId)

  // Get all workspaces data
  const workspacesData = await db
    .select()
    .from(workspaces)

  const workspacesMap = new Map(workspacesData.map(w => [w.id, w]))

  // Get all projects from user's workspaces
  const allProjects: ProjectWithStats[] = []

  for (const workspaceId of workspaceIds) {
    const workspaceProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId))

    const workspaceIssues = await db
      .select()
      .from(issues)
      .where(eq(issues.workspaceId, workspaceId))

    const workspace = workspacesMap.get(workspaceId)
    if (!workspace) continue

    for (const project of workspaceProjects) {
      const projectIssues = workspaceIssues.filter(i => i.projectId === project.id)
      allProjects.push({
        ...project,
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
        },
        stats: {
          totalIssues: projectIssues.length,
          openIssues: projectIssues.filter(i =>
            i.status !== "done" && i.status !== "cancelled"
          ).length,
          completedIssues: projectIssues.filter(i => i.status === "done").length,
        },
      })
    }
  }

  // Sort by most recently updated
  return allProjects.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

