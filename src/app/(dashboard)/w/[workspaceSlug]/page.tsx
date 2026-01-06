import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getWorkspaceBySlug } from "@/lib/actions/workspaces"
import { getProjects } from "@/lib/actions/projects"
import { getWorkspaceStats, getAllProjectsStats, ProjectStats } from "@/lib/actions/stats"
import { WorkspaceContent } from "@/components/workspace/workspace-content"

export default async function WorkspacePage({
  params,
}: {
  params: { workspaceSlug: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const workspace = await getWorkspaceBySlug(params.workspaceSlug)
  if (!workspace) {
    redirect("/dashboard")
  }

  const [projects, workspaceStats, projectStatsMap] = await Promise.all([
    getProjects(workspace.id),
    getWorkspaceStats(workspace.id),
    getAllProjectsStats(workspace.id),
  ])

  // Convert Map to plain object for serialization
  const projectStats: Record<string, ProjectStats> = {}
  projectStatsMap.forEach((value, key) => {
    projectStats[key] = value
  })

  return (
    <WorkspaceContent 
      workspace={workspace} 
      projects={projects} 
      workspaceSlug={params.workspaceSlug}
      workspaceStats={workspaceStats}
      projectStats={projectStats}
    />
  )
}
