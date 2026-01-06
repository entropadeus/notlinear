import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { gitCommits, pullRequests, issues, issueCommits, issuePullRequests } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const event = request.headers.get("x-github-event")

    if (event === "push") {
      // Handle push event - extract commits and link to issues
      const commits = payload.commits || []
      
      for (const commit of commits) {
        // Check if commit message references an issue (e.g., "fixes #PROJ-123")
        const issueMatches = commit.message.match(/#([A-Z]+-\d+)/g)
        
        if (issueMatches) {
          // Find or create commit record
          let [commitRecord] = await db
            .select()
            .from(gitCommits)
            .where(eq(gitCommits.sha, commit.id))
            .limit(1)

          if (!commitRecord) {
            [commitRecord] = await db
              .insert(gitCommits)
              .values({
                sha: commit.id,
                message: commit.message,
                author: commit.author.name,
                authorEmail: commit.author.email,
                url: commit.url,
                repository: payload.repository.full_name,
                branch: payload.ref.replace("refs/heads/", ""),
                createdAt: new Date(commit.timestamp),
              })
              .returning()
          }

          // Link to issues
          for (const match of issueMatches) {
            const identifier = match.replace("#", "")
            const [issue] = await db
              .select()
              .from(issues)
              .where(eq(issues.identifier, identifier))
              .limit(1)

            if (issue) {
              // Check if link exists
              const [existing] = await db
                .select()
                .from(issueCommits)
                .where(
                  and(
                    eq(issueCommits.issueId, issue.id),
                    eq(issueCommits.commitId, commitRecord.id)
                  )
                )
                .limit(1)

              if (!existing) {
                await db.insert(issueCommits).values({
                  issueId: issue.id,
                  commitId: commitRecord.id,
                })
              }
            }
          }
        }
      }
    } else if (event === "pull_request") {
      // Handle pull request event
      const pr = payload.pull_request
      const action = payload.action

      if (action === "opened" || action === "synchronize") {
        // Find or create PR record
        let [prRecord] = await db
          .select()
          .from(pullRequests)
          .where(eq(pullRequests.number, pr.number))
          .limit(1)

        if (!prRecord) {
          [prRecord] = await db
            .insert(pullRequests)
            .values({
              number: pr.number,
              title: pr.title,
              body: pr.body,
              state: pr.state,
              url: pr.html_url,
              repository: payload.repository.full_name,
              author: pr.user.login,
              createdAt: new Date(pr.created_at),
              updatedAt: new Date(pr.updated_at),
              mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
            })
            .returning()
        }

        // Check if PR body references issues
        const issueMatches = pr.body?.match(/#([A-Z]+-\d+)/g) || []
        
        for (const match of issueMatches) {
          const identifier = match.replace("#", "")
          const [issue] = await db
            .select()
            .from(issues)
            .where(eq(issues.identifier, identifier))
            .limit(1)

          if (issue) {
            // Check if link exists
            const [existing] = await db
              .select()
              .from(issuePullRequests)
              .where(
                and(
                  eq(issuePullRequests.issueId, issue.id),
                  eq(issuePullRequests.pullRequestId, prRecord.id)
                )
              )
              .limit(1)

            if (!existing) {
              await db.insert(issuePullRequests).values({
                issueId: issue.id,
                pullRequestId: prRecord.id,
              })
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("GitHub webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

