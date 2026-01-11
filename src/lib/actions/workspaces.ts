"use server"

import { db } from "@/lib/db"
import { workspaces, workspaceMembers } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache"

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
  revalidateTag(`workspaces-${session.user.id}`)
  return workspace
}

export async function getWorkspaces() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  // Cache workspaces per user with 5 minute revalidation
  const getCachedWorkspaces = unstable_cache(
    async (userId: string) => {
      const userWorkspaces = await db
        .select({
          workspace: workspaces,
        })
        .from(workspaces)
        .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
        .where(eq(workspaceMembers.userId, userId))

      return userWorkspaces.map((w) => w.workspace)
    },
    ["user-workspaces"],
    {
      tags: [`workspaces-${session.user.id}`],
      revalidate: 300, // 5 minutes
    }
  )

  return getCachedWorkspaces(session.user.id)
}

export async function getWorkspaceBySlug(slug: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  // Cache workspace lookup with 5 minute revalidation
  const getCachedWorkspace = unstable_cache(
    async (workspaceSlug: string, userId: string) => {
      const [workspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.slug, workspaceSlug))
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
            eq(workspaceMembers.userId, userId)
          )
        )
        .limit(1)

      if (!member) {
        return null
      }

      return workspace
    },
    ["workspace-by-slug"],
    {
      tags: [`workspace-${slug}`, `workspaces-${session.user.id}`],
      revalidate: 300, // 5 minutes
    }
  )

  return getCachedWorkspace(slug, session.user.id)
}

export async function getCurrentUserRole(workspaceId: string): Promise<"owner" | "admin" | "member" | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  const [member] = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      )
    )
    .limit(1)

  return (member?.role as "owner" | "admin" | "member") || null
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
  revalidateTag(`workspace-${updated.slug}`)
  revalidateTag(`workspaces-${session.user.id}`)
  return updated
}

