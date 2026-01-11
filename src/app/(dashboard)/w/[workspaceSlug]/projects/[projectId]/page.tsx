import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getProject } from "@/lib/actions/projects"
import { getIssues } from "@/lib/actions/issues"
import { getWorkspaceBySlug } from "@/lib/actions/workspaces"
import { getProjectStats } from "@/lib/actions/stats"
import {
  getFilteredIssues,
  getWorkspaceMembersForFilter,
  getLabelsForFilter,
} from "@/lib/actions/filters"
import { parseFiltersFromURL, isFiltersEmpty } from "@/lib/filters"
import { ProjectContent } from "@/components/project/project-content"

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: { workspaceSlug: string; projectId: string }
  searchParams: Record<string, string | string[] | undefined>
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

  // Parse filters from URL
  const filters = parseFiltersFromURL(searchParams)
  const hasFilters = !isFiltersEmpty(filters)

  // Fetch all data in parallel
  const [issues, projectStats, members, labels] = await Promise.all([
    hasFilters
      ? getFilteredIssues({
          workspaceId: workspace.id,
          projectId: params.projectId,
          filters,
        })
      : getIssues(params.projectId),
    getProjectStats(params.projectId),
    getWorkspaceMembersForFilter(workspace.id),
    getLabelsForFilter(workspace.id),
  ])

  return (
    <ProjectContent
      project={project}
      issues={issues}
      workspaceSlug={params.workspaceSlug}
      projectId={params.projectId}
      workspaceId={workspace.id}
      projectStats={projectStats}
      members={members}
      labels={labels}
      currentUserId={session.user?.id || ""}
    />
  )
}
