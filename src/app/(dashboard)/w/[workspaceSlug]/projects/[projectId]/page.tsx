import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getProject } from "@/lib/actions/projects"
import { getIssues, Issue } from "@/lib/actions/issues"
import { getWorkspaceBySlug } from "@/lib/actions/workspaces"
import { getProjectStats } from "@/lib/actions/stats"
import { ProjectContent } from "@/components/project/project-content"

export default async function ProjectPage({
  params,
}: {
  params: { workspaceSlug: string; projectId: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const workspace = await getWorkspaceBySlug(params.workspaceSlug)
  if (!workspace) {
    redirect("/dashboard")
  }

  const project = await getProject(params.projectId)
  if (!project) {
    redirect(`/w/${params.workspaceSlug}`)
  }

  const [issues, projectStats] = await Promise.all([
    getIssues(params.projectId),
    getProjectStats(params.projectId),
  ])

  return (
    <ProjectContent
      project={project}
      issues={issues}
      workspaceSlug={params.workspaceSlug}
      projectId={params.projectId}
      projectStats={projectStats}
    />
  )
}
