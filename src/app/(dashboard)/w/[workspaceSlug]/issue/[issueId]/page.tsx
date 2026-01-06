import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getIssues } from "@/lib/actions/issues"
import { getComments } from "@/lib/actions/comments"
import { IssueDetail } from "@/components/issues/issue-detail"
import { getWorkspaceBySlug } from "@/lib/actions/workspaces"

export default async function IssuePage({
  params,
}: {
  params: { workspaceSlug: string; issueId: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const workspace = await getWorkspaceBySlug(params.workspaceSlug)
  if (!workspace) {
    redirect("/dashboard")
  }

  // Find issue by identifier
  const issues = await getIssues(undefined, workspace.id)
  const issue = issues.find((i) => i.identifier === params.issueId)

  if (!issue) {
    redirect(`/w/${params.workspaceSlug}`)
  }

  const comments = await getComments(issue.id)

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto p-8">
        <IssueDetail issue={issue} workspaceSlug={params.workspaceSlug} initialComments={comments} />
      </div>
    </div>
  )
}
