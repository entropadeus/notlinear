import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getWorkspaces } from "@/lib/actions/workspaces"
import { ProjectsContent } from "@/components/dashboard/projects-content"

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const workspaces = await getWorkspaces()

  return <ProjectsContent workspaces={workspaces} />
}
