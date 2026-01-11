"use server"

import { db } from "@/lib/db"
import { gitCommits, issueCommits, pullRequests, issuePullRequests, issues } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function linkCommitToIssue(commitSha: string, issueId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Find or create commit
  let [commit] = await db
    .select()
    .from(gitCommits)
    .where(eq(gitCommits.sha, commitSha))
    .limit(1)

  if (!commit) {
    throw new Error("Commit not found")
  }

  // Check if link already exists
  const [existing] = await db
    .select()
    .from(issueCommits)
    .where(and(eq(issueCommits.commitId, commit.id), eq(issueCommits.issueId, issueId)))
    .limit(1)

  if (existing) {
    return existing
  }

  const [link] = await db
    .insert(issueCommits)
    .values({
      commitId: commit.id,
      issueId,
    })
    .returning()

  const [issue] = await db.select().from(issues).where(eq(issues.id, issueId)).limit(1)
  if (issue) {
    revalidatePath(`/dashboard/*/issue/${issue.identifier}`)
  }

  return link
}

export async function linkPullRequestToIssue(pullRequestId: string, issueId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Check if link already exists
  const [existing] = await db
    .select()
    .from(issuePullRequests)
    .where(
      and(eq(issuePullRequests.pullRequestId, pullRequestId), eq(issuePullRequests.issueId, issueId))
    )
    .limit(1)

  if (existing) {
    return existing
  }

  const [link] = await db
    .insert(issuePullRequests)
    .values({
      pullRequestId,
      issueId,
    })
    .returning()

  const [issue] = await db.select().from(issues).where(eq(issues.id, issueId)).limit(1)
  if (issue) {
    revalidatePath(`/dashboard/*/issue/${issue.identifier}`)
  }

  return link
}

export async function getIssueCommits(issueId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  const links = await db
    .select()
    .from(issueCommits)
    .where(eq(issueCommits.issueId, issueId))

  if (links.length === 0) {
    return []
  }

  if (links.length === 0) return []
  
  const commitIds = links.map((l) => l.commitId)
  // Note: This is simplified - in production, use SQL IN clause
  const commits = []
  for (const id of commitIds) {
    const [commit] = await db.select().from(gitCommits).where(eq(gitCommits.id, id)).limit(1)
    if (commit) commits.push(commit)
  }
  return commits
}

export async function getIssuePullRequests(issueId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  const links = await db
    .select()
    .from(issuePullRequests)
    .where(eq(issuePullRequests.issueId, issueId))

  if (links.length === 0) {
    return []
  }

  if (links.length === 0) return []
  
  const prIds = links.map((l) => l.pullRequestId)
  // Note: This is simplified - in production, use SQL IN clause
  const prs = []
  for (const id of prIds) {
    const [pr] = await db.select().from(pullRequests).where(eq(pullRequests.id, id)).limit(1)
    if (pr) prs.push(pr)
  }
  return prs
}

