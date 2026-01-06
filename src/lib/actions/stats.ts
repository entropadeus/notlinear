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

  const projectIssues = await db
    .select()
    .from(issues)
    .where(eq(issues.projectId, projectId))

  const stats: ProjectStats = {
    projectId,
    totalIssues: projectIssues.length,
    backlog: projectIssues.filter(i => i.status === "backlog").length,
    todo: projectIssues.filter(i => i.status === "todo").length,
    inProgress: projectIssues.filter(i => i.status === "in_progress").length,
    inReview: projectIssues.filter(i => i.status === "in_review").length,
    done: projectIssues.filter(i => i.status === "done").length,
    cancelled: projectIssues.filter(i => i.status === "cancelled").length,
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

  const workspaceProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))

  const workspaceIssues = await db
    .select()
    .from(issues)
    .where(eq(issues.workspaceId, workspaceId))

  return {
    workspaceId,
    totalProjects: workspaceProjects.length,
    totalIssues: workspaceIssues.length,
    completedIssues: workspaceIssues.filter(i => i.status === "done").length,
    openIssues: workspaceIssues.filter(i => i.status !== "done" && i.status !== "cancelled").length,
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

  const allIssues = await db
    .select()
    .from(issues)
    .where(eq(issues.workspaceId, workspaceId))

  const statsMap = new Map<string, ProjectStats>()

  for (const project of workspaceProjects) {
    const projectIssues = allIssues.filter(i => i.projectId === project.id)
    statsMap.set(project.id, {
      projectId: project.id,
      totalIssues: projectIssues.length,
      backlog: projectIssues.filter(i => i.status === "backlog").length,
      todo: projectIssues.filter(i => i.status === "todo").length,
      inProgress: projectIssues.filter(i => i.status === "in_progress").length,
      inReview: projectIssues.filter(i => i.status === "in_review").length,
      done: projectIssues.filter(i => i.status === "done").length,
      cancelled: projectIssues.filter(i => i.status === "cancelled").length,
    })
  }

  return statsMap
}

