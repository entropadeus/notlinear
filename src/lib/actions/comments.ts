"use server"

import { db } from "@/lib/db"
import { comments, issues, workspaceMembers, workspaces, users } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createComment(issueId: string, content: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Verify access
  const [issue] = await db.select().from(issues).where(eq(issues.id, issueId)).limit(1)

  if (!issue) {
    throw new Error("Issue not found")
  }

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
    throw new Error("Unauthorized")
  }

  const [comment] = await db
    .insert(comments)
    .values({
      issueId,
      authorId: session.user.id,
      content,
    })
    .returning()

  // Get author info to return with comment
  const [author] = await db
    .select({ name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, issue.workspaceId))
    .limit(1)

  revalidatePath(`/dashboard/${workspace[0]?.slug}/issue/${issue.identifier}`)
  revalidatePath(`/w/${workspace[0]?.slug}/issue/${issue.identifier}`)

  return {
    ...comment,
    author: author || { name: null, image: null },
  }
}

export async function getComments(issueId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  // Verify access
  const [issue] = await db.select().from(issues).where(eq(issues.id, issueId)).limit(1)

  if (!issue) {
    return []
  }

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
    return []
  }

  const results = await db
    .select({
      id: comments.id,
      content: comments.content,
      issueId: comments.issueId,
      authorId: comments.authorId,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.issueId, issueId))
    .orderBy(desc(comments.createdAt))

  return results.map((r) => ({
    id: r.id,
    content: r.content,
    issueId: r.issueId,
    authorId: r.authorId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    author: {
      name: r.authorName,
      image: r.authorImage,
    },
  }))
}

export async function updateComment(commentId: string, content: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const [comment] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)

  if (!comment || comment.authorId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  const [updated] = await db
    .update(comments)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, commentId))
    .returning()

  const [issue] = await db.select().from(issues).where(eq(issues.id, comment.issueId)).limit(1)
  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, issue?.workspaceId || ""))
    .limit(1)

  if (workspace[0] && issue) {
    revalidatePath(`/dashboard/${workspace[0].slug}/issue/${issue.identifier}`)
  }

  return updated
}

export async function deleteComment(commentId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const [comment] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)

  if (!comment || comment.authorId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  await db.delete(comments).where(eq(comments.id, commentId))

  const [issue] = await db.select().from(issues).where(eq(issues.id, comment.issueId)).limit(1)
  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, issue?.workspaceId || ""))
    .limit(1)

  if (workspace[0] && issue) {
    revalidatePath(`/dashboard/${workspace[0].slug}/issue/${issue.identifier}`)
  }
}

