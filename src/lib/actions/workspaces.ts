"use server"

import { db } from "@/lib/db"
import { workspaces, workspaceMembers } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createWorkspace(name: string, slug: string, description?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const [workspace] = await db
    .insert(workspaces)
    .values({
      name,
      slug,
      description,
      ownerId: session.user.id,
    })
    .returning()

  // Add owner as member
  await db.insert(workspaceMembers).values({
    workspaceId: workspace.id,
    userId: session.user.id,
    role: "owner",
  })

  revalidatePath("/dashboard")
  return workspace
}

export async function getWorkspaces() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  const userWorkspaces = await db
    .select({
      workspace: workspaces,
    })
    .from(workspaces)
    .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, session.user.id))

  return userWorkspaces.map((w) => w.workspace)
}

export async function getWorkspaceBySlug(slug: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1)

  if (!workspace) {
    return null
  }

  // Check if user is a member
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspace.id),
        eq(workspaceMembers.userId, session.user.id)
      )
    )
    .limit(1)

  if (!member) {
    return null
  }

  return workspace
}

export async function updateWorkspace(id: string, data: { name?: string; description?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Check if user is owner or admin
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, id),
        eq(workspaceMembers.userId, session.user.id)
      )
    )
    .limit(1)

  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    throw new Error("Unauthorized")
  }

  const [updated] = await db
    .update(workspaces)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, id))
    .returning()

  revalidatePath(`/dashboard/${updated.slug}`)
  return updated
}

