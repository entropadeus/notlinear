import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getWorkspaces } from "@/lib/actions/workspaces"
import { getWorkspaceStats, getStatusDistribution, getActivityTrend, getActivityHeatmapData, getMostActiveProject, WorkspaceStats } from "@/lib/actions/stats"
import { getOldestOpenIssues, IssueWithProject } from "@/lib/actions/issues"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const workspaces = await getWorkspaces()

  // Get stats for all workspaces, status distribution, activity trend, heatmap, and most active project in parallel
  const [statsResults, statusDistribution, activityTrend, heatmapData, mostActiveProject, oldestIssues] = await Promise.all([
    Promise.all(workspaces.map(w => getWorkspaceStats(w.id))),
    getStatusDistribution(),
    getActivityTrend(),
    getActivityHeatmapData(),
    getMostActiveProject(),
    getOldestOpenIssues(5),
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
      activityTrend={activityTrend}
      heatmapData={heatmapData}
      mostActiveProject={mostActiveProject}
      oldestIssues={oldestIssues}
    />
  )
}
