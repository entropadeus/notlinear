"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FolderKanban, LayoutList, CheckCircle2, Circle, TrendingUp, Activity, ArrowRight } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { WorkspaceStats } from "@/lib/actions/stats"
import { cn } from "@/lib/utils"

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
}

export function DashboardContent({ workspaces, userName, workspaceStats = {} }: DashboardContentProps) {
  // Calculate totals across all workspaces
  const totals = Object.values(workspaceStats).reduce(
    (acc, stats) => ({
      totalProjects: acc.totalProjects + stats.totalProjects,
      totalIssues: acc.totalIssues + stats.totalIssues,
      completedIssues: acc.completedIssues + stats.completedIssues,
      openIssues: acc.openIssues + stats.openIssues,
    }),
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

          {/* Overall Progress */}
          {totals.totalIssues > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-5"
            >
              <Card className="overflow-hidden border-border/50">
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
                </CardContent>
              </Card>
            </motion.div>
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
