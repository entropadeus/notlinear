import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getProject } from "@/lib/actions/projects"
import { getIssues } from "@/lib/actions/issues"
import { getWorkspaceBySlug } from "@/lib/actions/workspaces"
import { KanbanBoard } from "@/components/kanban/board"

export default async function ProjectBoardPage({
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

  const issues = await getIssues(params.projectId)

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          {project.icon && <span className="text-2xl">{project.icon}</span>}
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <KanbanBoard issues={issues} projectId={params.projectId} workspaceSlug={params.workspaceSlug} />
      </div>
    </div>
  )
}
