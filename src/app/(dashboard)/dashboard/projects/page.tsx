import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllProjectsAcrossWorkspaces } from "@/lib/actions/projects"
import { ProjectsContent } from "@/components/dashboard/projects-content"

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const projects = await getAllProjectsAcrossWorkspaces()

  return <ProjectsContent projects={projects} />
}
