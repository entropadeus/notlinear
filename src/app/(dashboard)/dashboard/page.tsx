import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getWorkspaces } from "@/lib/actions/workspaces"
import { getWorkspaceStats, getStatusDistribution, WorkspaceStats } from "@/lib/actions/stats"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const workspaces = await getWorkspaces()

  // Get stats for all workspaces and status distribution in parallel
  const [statsResults, statusDistribution] = await Promise.all([
    Promise.all(workspaces.map(w => getWorkspaceStats(w.id))),
    getStatusDistribution(),
  ])

  const workspaceStats: Record<string, WorkspaceStats> = {}
  workspaces.forEach((w, idx) => {
    if (statsResults[idx]) {
      workspaceStats[w.id] = statsResults[idx]!
    }
  })

  return (
    <DashboardContent
      workspaces={workspaces}
      userName={session.user?.name || "User"}
      workspaceStats={workspaceStats}
      statusDistribution={statusDistribution}
    />
  )
}
