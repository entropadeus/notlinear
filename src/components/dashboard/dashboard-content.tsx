"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FolderKanban, LayoutList, CheckCircle2, Circle, TrendingUp, Activity, ArrowRight, Zap, Flame, Clock } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { WorkspaceStats, StatusDistribution, ActivityTrend, ActivityHeatmapData, MostActiveProject } from "@/lib/actions/stats"
import { ActivityChart } from "./activity-chart"
import { ActivityHeatmap } from "./activity-heatmap"
import { cn } from "@/lib/utils"
import { useDashboardRealtime } from "@/lib/realtime/use-realtime"
import { LiveDateTime } from "./live-date-time"
import { IssueWithProject } from "@/lib/actions/issues"

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
  oldestIssues?: IssueWithProject[]
}

export function DashboardContent({ workspaces, userName, workspaceStats = {}, statusDistribution, activityTrend, heatmapData, mostActiveProject, oldestIssues = [] }: DashboardContentProps) {
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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-10"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src="/NotLinear-icon.png"
                alt="NotLinear"
                width={40}
                height={40}
                className="rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, <span className="text-foreground font-medium">{userName}</span></p>
            </div>
          </div>
          <LiveDateTime />
        </div>
      </motion.div>

      {/* Quick Stats Overview */}
      {workspaces.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className="mb-10"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.03 }}
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
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
        transition={{ delay: 0.1 }}
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
        transition={{ delay: 0.12, duration: 0.35 }}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 + index * 0.04, duration: 0.35 }}
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

      {/* Longest Open Issues - Heat Intensity Design */}
      {oldestIssues.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur-lg opacity-40" />
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Aging Issues</h2>
              <p className="text-sm text-muted-foreground">
                {oldestIssues.length} issue{oldestIssues.length !== 1 ? 's' : ''} waiting the longest
              </p>
            </div>
          </div>

          {/* Issues Grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {oldestIssues.map((issue, index) => {
              const daysOpen = Math.floor((Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24))
              // Heat level: 0-3 based on age (7d, 14d, 30d, 60d+)
              const heatLevel = daysOpen >= 60 ? 3 : daysOpen >= 30 ? 2 : daysOpen >= 14 ? 1 : 0
              const heatColors = [
                { border: 'border-orange-500/20', glow: 'from-orange-500/0 to-orange-500/0', text: 'text-orange-400', bg: 'from-orange-500/5 to-transparent' },
                { border: 'border-orange-500/30', glow: 'from-orange-500/10 to-orange-500/5', text: 'text-orange-400', bg: 'from-orange-500/10 to-transparent' },
                { border: 'border-orange-500/40', glow: 'from-orange-500/20 to-red-500/10', text: 'text-orange-300', bg: 'from-orange-500/15 to-red-500/5' },
                { border: 'border-red-500/50', glow: 'from-red-500/30 to-orange-500/15', text: 'text-red-400', bg: 'from-red-500/20 to-orange-500/10' },
              ]
              const heat = heatColors[heatLevel]

              return (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 + index * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Link href={`/w/${issue.workspace.slug}/issue/${issue.identifier}`}>
                    <div className={cn(
                      "group relative overflow-hidden rounded-2xl border transition-all duration-300",
                      "bg-gradient-to-b from-surface-1 to-card hover:-translate-y-1",
                      heat.border
                    )}>
                      {/* Heat glow overlay */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        heat.glow
                      )} />

                      {/* Top heat bar */}
                      <div className={cn(
                        "h-1 w-full bg-gradient-to-r",
                        heat.bg
                      )} />

                      <div className="relative p-4">
                        {/* Header row: identifier + days */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span className="text-xs font-mono text-muted-foreground tracking-wide">
                            {issue.identifier}
                          </span>
                          <div className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-lg",
                            "bg-gradient-to-r",
                            heat.bg
                          )}>
                            <Flame className={cn("h-3 w-3", heat.text)} />
                            <span className={cn("text-xs font-bold tabular-nums", heat.text)}>
                              {daysOpen}d
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-3 group-hover:text-foreground transition-colors">
                          {issue.title}
                        </h3>

                        {/* Footer: project + workspace */}
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-muted-foreground truncate max-w-[100px]">
                            {issue.project.name}
                          </span>
                          <span className="text-border">•</span>
                          <span className="text-muted-foreground/70 truncate">
                            {issue.workspace.name}
                          </span>
                        </div>
                      </div>

                      {/* Hover arrow indicator */}
                      <div className="absolute bottom-4 right-4 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {workspaces.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
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
