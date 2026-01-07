"use server"

import { db } from "@/lib/db"
import { workspaceInvites, workspaceMembers, workspaces, users } from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"

// Types
export type InviteRole = "member" | "admin"

export interface CreateInviteOptions {
  workspaceId: string
  role?: InviteRole
  maxUses?: number | null
  expiresInDays?: number | null
}

export interface WorkspaceInvite {
  id: string
  token: string
  role: string
  maxUses: number | null
  usedCount: number
  expiresAt: Date | null
  status: string
  createdAt: Date
  createdBy: {
    id: string
    name: string
    image: string | null
  } | null
}

export interface InviteInfo {
  workspace: {
    id: string
    name: string
    description: string | null
  }
  role: string
  isValid: boolean
  error?: string
}

// Generate cryptographically secure token
// Using base64url encoding for URL-safe tokens
function generateInviteToken(): string {
  return randomBytes(12).toString("base64url")
}

// Check if user has admin/owner access to workspace
async function checkWorkspaceAdminAccess(workspaceId: string, userId: string): Promise<boolean> {
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

  return member?.role === "owner" || member?.role === "admin"
}

// Create a new invite token
export async function createInviteToken(options: CreateInviteOptions): Promise<{ success: true; invite: { token: string; id: string } } | { success: false; error: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Check admin access
    const hasAccess = await checkWorkspaceAdminAccess(options.workspaceId, session.user.id)
    if (!hasAccess) {
      return { success: false, error: "Only workspace owners and admins can create invites" }
    }

    // Generate unique token with retry logic for collision handling
    let token: string
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      token = generateInviteToken()

      // Check if token already exists (extremely unlikely but handle it)
      const [existing] = await db
        .select({ id: workspaceInvites.id })
        .from(workspaceInvites)
        .where(eq(workspaceInvites.token, token))
        .limit(1)

      if (!existing) break
      attempts++
    }

    if (attempts >= maxAttempts) {
      return { success: false, error: "Failed to generate unique token. Please try again." }
    }

    // Calculate expiration
    let expiresAt: Date | null = null
    if (options.expiresInDays) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + options.expiresInDays)
    }

    const [invite] = await db
      .insert(workspaceInvites)
      .values({
        workspaceId: options.workspaceId,
        token: token!,
        createdById: session.user.id,
        role: options.role || "member",
        maxUses: options.maxUses ?? null,
        expiresAt,
      })
      .returning({ id: workspaceInvites.id, token: workspaceInvites.token })

    revalidatePath(`/w/`)
    return { success: true, invite }
  } catch (error) {
    console.error("Error creating invite:", error)
    return { success: false, error: "Failed to create invite" }
  }
}

// Get all active invites for a workspace
export async function getWorkspaceInvites(workspaceId: string): Promise<WorkspaceInvite[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  // Check admin access
  const hasAccess = await checkWorkspaceAdminAccess(workspaceId, session.user.id)
  if (!hasAccess) {
    return []
  }

  const invites = await db
    .select({
      id: workspaceInvites.id,
      token: workspaceInvites.token,
      role: workspaceInvites.role,
      maxUses: workspaceInvites.maxUses,
      usedCount: workspaceInvites.usedCount,
      expiresAt: workspaceInvites.expiresAt,
      status: workspaceInvites.status,
      createdAt: workspaceInvites.createdAt,
      createdById: workspaceInvites.createdById,
      createdByName: users.name,
      createdByImage: users.image,
    })
    .from(workspaceInvites)
    .leftJoin(users, eq(workspaceInvites.createdById, users.id))
    .where(
      and(
        eq(workspaceInvites.workspaceId, workspaceId),
        eq(workspaceInvites.status, "active")
      )
    )
    .orderBy(workspaceInvites.createdAt)

  return invites.map((invite) => ({
    id: invite.id,
    token: invite.token,
    role: invite.role,
    maxUses: invite.maxUses,
    usedCount: invite.usedCount,
    expiresAt: invite.expiresAt,
    status: invite.status,
    createdAt: invite.createdAt,
    createdBy: invite.createdById
      ? {
          id: invite.createdById,
          name: invite.createdByName || "Unknown",
          image: invite.createdByImage,
        }
      : null,
  }))
}

// Revoke an invite
export async function revokeInvite(inviteId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Get the invite to check workspace access
    const [invite] = await db
      .select({ workspaceId: workspaceInvites.workspaceId })
      .from(workspaceInvites)
      .where(eq(workspaceInvites.id, inviteId))
      .limit(1)

    if (!invite) {
      return { success: false, error: "Invite not found" }
    }

    // Check admin access
    const hasAccess = await checkWorkspaceAdminAccess(invite.workspaceId, session.user.id)
    if (!hasAccess) {
      return { success: false, error: "Only workspace owners and admins can revoke invites" }
    }

    await db
      .update(workspaceInvites)
      .set({ status: "revoked" })
      .where(eq(workspaceInvites.id, inviteId))

    revalidatePath(`/w/`)
    return { success: true }
  } catch (error) {
    console.error("Error revoking invite:", error)
    return { success: false, error: "Failed to revoke invite" }
  }
}

// Get invite info by token (for join page preview)
export async function getInviteInfo(token: string): Promise<InviteInfo | null> {
  try {
    const [invite] = await db
      .select({
        id: workspaceInvites.id,
        workspaceId: workspaceInvites.workspaceId,
        role: workspaceInvites.role,
        maxUses: workspaceInvites.maxUses,
        usedCount: workspaceInvites.usedCount,
        expiresAt: workspaceInvites.expiresAt,
        status: workspaceInvites.status,
        workspaceName: workspaces.name,
        workspaceDescription: workspaces.description,
      })
      .from(workspaceInvites)
      .innerJoin(workspaces, eq(workspaceInvites.workspaceId, workspaces.id))
      .where(eq(workspaceInvites.token, token))
      .limit(1)

    if (!invite) {
      return null
    }

    // Validate invite
    const now = new Date()

    if (invite.status !== "active") {
      return {
        workspace: { id: invite.workspaceId, name: invite.workspaceName, description: invite.workspaceDescription },
        role: invite.role,
        isValid: false,
        error: "This invite has been revoked",
      }
    }

    if (invite.expiresAt && invite.expiresAt < now) {
      return {
        workspace: { id: invite.workspaceId, name: invite.workspaceName, description: invite.workspaceDescription },
        role: invite.role,
        isValid: false,
        error: "This invite has expired",
      }
    }

    if (invite.maxUses !== null && invite.usedCount >= invite.maxUses) {
      return {
        workspace: { id: invite.workspaceId, name: invite.workspaceName, description: invite.workspaceDescription },
        role: invite.role,
        isValid: false,
        error: "This invite has reached its maximum uses",
      }
    }

    return {
      workspace: { id: invite.workspaceId, name: invite.workspaceName, description: invite.workspaceDescription },
      role: invite.role,
      isValid: true,
    }
  } catch (error) {
    console.error("Error getting invite info:", error)
    return null
  }
}

// Join workspace using invite token
export async function joinWorkspaceWithToken(token: string): Promise<{ success: true; workspaceSlug: string } | { success: false; error: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Please sign in to join a workspace" }
    }

    // Get invite with workspace info
    const [invite] = await db
      .select({
        id: workspaceInvites.id,
        workspaceId: workspaceInvites.workspaceId,
        role: workspaceInvites.role,
        maxUses: workspaceInvites.maxUses,
        usedCount: workspaceInvites.usedCount,
        expiresAt: workspaceInvites.expiresAt,
        status: workspaceInvites.status,
        workspaceSlug: workspaces.slug,
      })
      .from(workspaceInvites)
      .innerJoin(workspaces, eq(workspaceInvites.workspaceId, workspaces.id))
      .where(eq(workspaceInvites.token, token))
      .limit(1)

    if (!invite) {
      return { success: false, error: "Invalid invite link" }
    }

    // Validate invite status
    if (invite.status !== "active") {
      return { success: false, error: "This invite has been revoked" }
    }

    // Validate expiration
    const now = new Date()
    if (invite.expiresAt && invite.expiresAt < now) {
      return { success: false, error: "This invite has expired" }
    }

    // Validate usage count - do this check before attempting join
    // This is a soft check; the atomic increment below handles race conditions
    if (invite.maxUses !== null && invite.usedCount >= invite.maxUses) {
      return { success: false, error: "This invite has reached its maximum uses" }
    }

    // Check if user is already a member
    const [existingMember] = await db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, invite.workspaceId),
          eq(workspaceMembers.userId, session.user.id)
        )
      )
      .limit(1)

    if (existingMember) {
      // Already a member - just redirect them
      return { success: true, workspaceSlug: invite.workspaceSlug }
    }

    // Atomic increment of usedCount with maxUses check
    // This prevents race conditions where multiple users try to use the last slot
    if (invite.maxUses !== null) {
      const updateResult = await db
        .update(workspaceInvites)
        .set({ usedCount: sql`${workspaceInvites.usedCount} + 1` })
        .where(
          and(
            eq(workspaceInvites.id, invite.id),
            eq(workspaceInvites.status, "active"),
            sql`${workspaceInvites.usedCount} < ${invite.maxUses}`
          )
        )
        .returning({ id: workspaceInvites.id })

      if (updateResult.length === 0) {
        return { success: false, error: "This invite has reached its maximum uses" }
      }
    } else {
      // No max uses limit, just increment
      await db
        .update(workspaceInvites)
        .set({ usedCount: sql`${workspaceInvites.usedCount} + 1` })
        .where(eq(workspaceInvites.id, invite.id))
    }

    // Add user as workspace member
    await db.insert(workspaceMembers).values({
      workspaceId: invite.workspaceId,
      userId: session.user.id,
      role: invite.role,
    })

    revalidatePath("/dashboard")
    revalidatePath(`/w/${invite.workspaceSlug}`)

    return { success: true, workspaceSlug: invite.workspaceSlug }
  } catch (error) {
    console.error("Error joining workspace:", error)
    return { success: false, error: "Failed to join workspace" }
  }
}

// Get workspace members (for team management UI)
export async function getWorkspaceMembers(workspaceId: string): Promise<Array<{
  id: string
  userId: string
  role: string
  joinedAt: Date
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  // Check if user is a member of the workspace
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

  const members = await db
    .select({
      id: workspaceMembers.id,
      userId: workspaceMembers.userId,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
      userName: users.name,
      userEmail: users.email,
      userImage: users.image,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId))
    .orderBy(workspaceMembers.joinedAt)

  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    joinedAt: m.joinedAt,
    user: {
      id: m.userId,
      name: m.userName,
      email: m.userEmail,
      image: m.userImage,
    },
  }))
}

// Update member role (owner/admin only)
export async function updateMemberRole(
  memberId: string,
  newRole: "admin" | "member"
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Get the member to find workspace
    const [targetMember] = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.id, memberId))
      .limit(1)

    if (!targetMember) {
      return { success: false, error: "Member not found" }
    }

    // Cannot change owner's role
    if (targetMember.role === "owner") {
      return { success: false, error: "Cannot change the workspace owner's role" }
    }

    // Check if current user has admin access
    const hasAccess = await checkWorkspaceAdminAccess(targetMember.workspaceId, session.user.id)
    if (!hasAccess) {
      return { success: false, error: "Only owners and admins can change member roles" }
    }

    await db
      .update(workspaceMembers)
      .set({ role: newRole })
      .where(eq(workspaceMembers.id, memberId))

    revalidatePath(`/w/`)
    return { success: true }
  } catch (error) {
    console.error("Error updating member role:", error)
    return { success: false, error: "Failed to update member role" }
  }
}

// Remove member from workspace (owner/admin only, cannot remove owner)
export async function removeMember(memberId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Get the member to find workspace and check role
    const [targetMember] = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.id, memberId))
      .limit(1)

    if (!targetMember) {
      return { success: false, error: "Member not found" }
    }

    // Cannot remove owner
    if (targetMember.role === "owner") {
      return { success: false, error: "Cannot remove the workspace owner" }
    }

    // Check if current user has admin access (or is removing themselves)
    const isSelf = targetMember.userId === session.user.id
    const hasAccess = await checkWorkspaceAdminAccess(targetMember.workspaceId, session.user.id)

    if (!hasAccess && !isSelf) {
      return { success: false, error: "Only owners and admins can remove members" }
    }

    await db
      .delete(workspaceMembers)
      .where(eq(workspaceMembers.id, memberId))

    revalidatePath(`/w/`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error removing member:", error)
    return { success: false, error: "Failed to remove member" }
  }
}
