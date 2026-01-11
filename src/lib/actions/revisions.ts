"use server"

import { db } from "@/lib/db"
import { issueRevisions, issues, workspaces, workspaceMembers, users } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export interface Revision {
  id: string
  issueId: string
  field: string
  oldValue: string | null
  newValue: string | null
  authorId: string
  message: string | null
  createdAt: Date
  author?: {
    name: string | null
    image: string | null
  }
}

export async function createRevision(
  issueId: string,
  field: string,
  oldValue: string | null,
  newValue: string | null,
  message?: string
): Promise<Revision | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  // Don't create revision if values are the same
  if (oldValue === newValue) {
    return null
  }

  const [revision] = await db
    .insert(issueRevisions)
    .values({
      issueId,
      field,
      oldValue,
      newValue,
      authorId: session.user.id,
      message,
    })
    .returning()

  return revision as Revision
}

export async function createRevisions(
  issueId: string,
  changes: Array<{ field: string; oldValue: string | null; newValue: string | null }>,
  message?: string
): Promise<Revision[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  // Filter out unchanged fields
  const actualChanges = changes.filter((c) => c.oldValue !== c.newValue)
  if (actualChanges.length === 0) {
    return []
  }

  const revisions = await db
    .insert(issueRevisions)
    .values(
      actualChanges.map((change) => ({
        issueId,
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        authorId: session.user.id,
        message,
      }))
    )
    .returning()

  return revisions as Revision[]
}

export async function getRevisions(issueId: string): Promise<Revision[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  // Get the issue to verify workspace access
  const [issue] = await db
    .select()
    .from(issues)
    .where(eq(issues.id, issueId))
    .limit(1)

  if (!issue) {
    return []
  }

  // Verify user has access to workspace
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

  // Get revisions with author info
  const revisions = await db
    .select({
      id: issueRevisions.id,
      issueId: issueRevisions.issueId,
      field: issueRevisions.field,
      oldValue: issueRevisions.oldValue,
      newValue: issueRevisions.newValue,
      authorId: issueRevisions.authorId,
      message: issueRevisions.message,
      createdAt: issueRevisions.createdAt,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(issueRevisions)
    .leftJoin(users, eq(issueRevisions.authorId, users.id))
    .where(eq(issueRevisions.issueId, issueId))
    .orderBy(desc(issueRevisions.createdAt))

  return revisions.map((r) => ({
    id: r.id,
    issueId: r.issueId,
    field: r.field,
    oldValue: r.oldValue,
    newValue: r.newValue,
    authorId: r.authorId,
    message: r.message,
    createdAt: r.createdAt,
    author: {
      name: r.authorName,
      image: r.authorImage,
    },
  }))
}

