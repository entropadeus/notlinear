"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FolderKanban, LayoutList, CheckCircle2, Circle, TrendingUp, Activity, ArrowRight, Zap, Flame } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { WorkspaceStats, StatusDistribution, ActivityTrend, ActivityHeatmapData, MostActiveProject } from "@/lib/actions/stats"
import { ActivityChart } from "./activity-chart"
import { ActivityHeatmap } from "./activity-heatmap"
import { cn } from "@/lib/utils"
import { useDashboardRealtime } from "@/lib/realtime/use-realtime"

interface Workspace {
  id: string
  name: string
  slug: string
  description: string | null
}

interface DashboardContentProps {
  workspaces: Workspace[]
  userName: string
  workspaceStats?: Record<string, WorkspaceStats>
  statusDistribution?: StatusDistribution
  activityTrend?: ActivityTrend
  heatmapData?: ActivityHeatmapData
  mostActiveProject?: MostActiveProject | null
}

export function DashboardContent({ workspaces, userName, workspaceStats = {}, statusDistribution, activityTrend, heatmapData, mostActiveProject }: DashboardContentProps) {
  const router = useRouter()
  const lastRefreshRef = useRef(Date.now())

  // Get workspace IDs for realtime connection
  const workspaceIds = useMemo(() => workspaces.map(w => w.id), [workspaces])

  // Debounced refresh to avoid hammering the server
  const handleActivityChange = useCallback(() => {
    const now = Date.now()
    // Only refresh if more than 2 seconds since last refresh
    if (now - lastRefreshRef.current > 2000) {
      lastRefreshRef.current = now
      router.refresh()
    }
  }, [router])

  // Connect to realtime for all workspaces
  useDashboardRealtime(workspaceIds, handleActivityChange)

  // Calculate totals across all workspaces
  const totals = Object.values(workspaceStats || {}).reduce(
    (acc, stats) => {
      if (!stats) return acc
      return {
        totalProjects: acc.totalProjects + (stats.totalProjects || 0),
        totalIssues: acc.totalIssues + (stats.totalIssues || 0),
        completedIssues: acc.completedIssues + (stats.completedIssues || 0),
        openIssues: acc.openIssues + (stats.openIssues || 0),
      }
    },
    { totalProjects: 0, totalIssues: 0, completedIssues: 0, openIssues: 0 }
  )

  const overallCompletionRate = totals.totalIssues > 0
    ? Math.round((totals.completedIssues / totals.totalIssues) * 100)
    : 0

  const quickStats = [
    {
      label: "Total Projects",
      value: totals.totalProjects,
      icon: FolderKanban,
      gradient: "from-blue-500/20 to-blue-600/10",
      iconColor: "text-blue-400",
      glow: "shadow-blue-500/5",
    },
    {
      label: "Total Issues",
      value: totals.totalIssues,
      icon: LayoutList,
      gradient: "from-violet-500/20 to-violet-600/10",
      iconColor: "text-violet-400",
      glow: "shadow-violet-500/5",
    },
    {
      label: "Open Issues",
      value: totals.openIssues,
      icon: Circle,
      gradient: "from-orange-500/20 to-orange-600/10",
      iconColor: "text-orange-400",
      glow: "shadow-orange-500/5",
    },
    {
      label: "Completed",
      value: totals.completedIssues,
      icon: CheckCircle2,
      gradient: "from-emerald-500/20 to-emerald-600/10",
      iconColor: "text-emerald-400",
      glow: "shadow-emerald-500/5",
    },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-10"
      >
        <div className="flex items-center gap-4 mb-2">
          <Image
            src="/NotLinear-icon.png"
            alt="NotLinear"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, <span className="text-foreground font-medium">{userName}</span></p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Overview */}
      {workspaces.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-10"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card className={cn(
                    "overflow-hidden hover-lift border-border/50",
                    stat.glow
                  )}>
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-xl bg-gradient-to-br",
                          stat.gradient
                        )}>
                          <Icon className={cn("h-5 w-5", stat.iconColor)} />
                        </div>
                        <div>
                          <p className="stat-number text-3xl text-foreground">{stat.value}</p>
                          <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Overall Progress & Activity Chart - Two Column Layout */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Overall Progress */}
            {totals.totalIssues > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card className="overflow-hidden border-border/50 h-full">
                  <CardContent className="py-5">
                    <div className="flex items-center gap-5">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/10">
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">Overall Completion Rate</span>
                          <span className="stat-number text-lg text-foreground">{overallCompletionRate}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-surface-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${overallCompletionRate}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full progress-glow"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 pt-5 border-t border-border/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Zap className="h-4 w-4 text-orange-400" />
                          <span>Quick Stats</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                            <span className="text-muted-foreground">{totals.openIssues} active</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-muted-foreground">{totals.completedIssues} done</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Project */}
                    {mostActiveProject && (
                      <div className="mt-5 pt-5 border-t border-border/30">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span>Top Project</span>
                        </div>
                        <Link href={`/w/${workspaces.find(w => w.name === mostActiveProject.workspaceName)?.slug || ""}/projects/${mostActiveProject.id}`}>
                          <div className="group flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-surface-2/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/10">
                                <FolderKanban className="h-4 w-4 text-orange-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                  {mostActiveProject.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {mostActiveProject.issueCount} total issues
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1.5">
                                <Circle className="h-2.5 w-2.5 text-orange-400" />
                                <span className="text-muted-foreground">{mostActiveProject.openIssues}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                                <span className="text-muted-foreground">{mostActiveProject.completedIssues}</span>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Activity Chart */}
            {statusDistribution && statusDistribution.total > 0 && (
              <ActivityChart distribution={statusDistribution} activityTrend={activityTrend} />
            )}
          </div>

          {/* Activity Heatmap */}
          {heatmapData && (
            <div className="mt-5">
              <ActivityHeatmap data={heatmapData} />
            </div>
          )}
        </motion.div>
      )}

      {/* Workspaces Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mb-5"
      >
        <div className="section-header">
          <h2 className="text-lg font-semibold">Your Workspaces</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1 ml-4">
          {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {workspaces.map((workspace, index) => {
          const stats = workspaceStats[workspace.id]
          const completionRate = stats && stats.totalIssues > 0
            ? Math.round((stats.completedIssues / stats.totalIssues) * 100)
            : 0

          return (
            <motion.div
              key={workspace.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.06, duration: 0.4 }}
            >
              <Link href={`/w/${workspace.slug}`}>
                <Card className="group card-premium h-full hover-lift cursor-pointer border-border/50 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </div>
                    <CardDescription className="line-clamp-2">
                      {workspace.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  {stats && (
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-5 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1.5">
                          <FolderKanban className="h-3.5 w-3.5 text-primary/70" />
                          <span>{stats.totalProjects} project{stats.totalProjects !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-orange-400/70" />
                          <span>{stats.openIssues} open</span>
                        </div>
                      </div>

                      {stats.totalIssues > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="stat-number text-foreground">{completionRate}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${completionRate}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                              className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Empty State */}
      {workspaces.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center mb-5">
            <FolderKanban className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm text-center">
            Create your first workspace to start organizing your projects and issues.
          </p>
          <Button className="btn-premium text-primary-foreground font-semibold">
            <Plus className="mr-2 h-4 w-4" />
            Create Workspace
          </Button>
        </motion.div>
      )}
    </div>
  )
}
