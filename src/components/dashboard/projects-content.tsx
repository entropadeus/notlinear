"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  FolderKanban,
  Search,
  Grid3X3,
  LayoutList,
  ArrowRight,
  Circle,
  CheckCircle2,
  Activity,
  MoreHorizontal,
  ExternalLink,
  Layers,
  TrendingUp,
  Hash,
} from "lucide-react"
import { useState, useMemo } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"
import type { ProjectWithStats } from "@/lib/actions/projects"

interface ProjectsContentProps {
  projects: ProjectWithStats[]
}

type ViewMode = "grid" | "list"

export function ProjectsContent({ projects }: ProjectsContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>("dashboard-projects-view", "grid")

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    const query = searchQuery.toLowerCase()
    return projects.filter(
      p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.workspace.name.toLowerCase().includes(query)
    )
  }, [projects, searchQuery])

  // Group projects by workspace
  const projectsByWorkspace = useMemo(() => {
    const grouped = new Map<string, { workspace: { id: string; name: string; slug: string }; projects: ProjectWithStats[] }>()

    for (const project of filteredProjects) {
      const existing = grouped.get(project.workspace.id)
      if (existing) {
        existing.projects.push(project)
      } else {
        grouped.set(project.workspace.id, {
          workspace: project.workspace,
          projects: [project],
        })
      }
    }

    return Array.from(grouped.values())
  }, [filteredProjects])

  // Calculate totals
  const totals = useMemo(() => {
    return projects.reduce(
      (acc, p) => ({
        totalProjects: acc.totalProjects + 1,
        totalIssues: acc.totalIssues + p.stats.totalIssues,
        openIssues: acc.openIssues + p.stats.openIssues,
        completedIssues: acc.completedIssues + p.stats.completedIssues,
      }),
      { totalProjects: 0, totalIssues: 0, openIssues: 0, completedIssues: 0 }
    )
  }, [projects])

  const completionRate = totals.totalIssues > 0
    ? Math.round((totals.completedIssues / totals.totalIssues) * 100)
    : 0

  const quickStats = [
    {
      label: "Total Projects",
      value: totals.totalProjects,
      icon: FolderKanban,
      gradient: "from-primary/20 to-orange-500/10",
      iconColor: "text-primary",
    },
    {
      label: "Total Issues",
      value: totals.totalIssues,
      icon: Hash,
      gradient: "from-violet-500/20 to-violet-600/10",
      iconColor: "text-violet-400",
    },
    {
      label: "Open",
      value: totals.openIssues,
      icon: Circle,
      gradient: "from-amber-500/20 to-amber-600/10",
      iconColor: "text-amber-400",
    },
    {
      label: "Completed",
      value: totals.completedIssues,
      icon: CheckCircle2,
      gradient: "from-emerald-500/20 to-emerald-600/10",
      iconColor: "text-emerald-400",
    },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center">
            <FolderKanban className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              All your projects across {projectsByWorkspace.length} workspace{projectsByWorkspace.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8"
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
                  <Card className="overflow-hidden hover-lift border-border/50">
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

          {/* Progress Bar */}
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
                        <span className="stat-number text-lg text-foreground">{completionRate}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-surface-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${completionRate}%` }}
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

      {/* Search & View Controls */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface-1 border-border/50 focus-visible:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-1 border border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-8 px-3 rounded-md transition-all",
                viewMode === "grid"
                  ? "bg-surface-2 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "h-8 px-3 rounded-md transition-all",
                viewMode === "list"
                  ? "bg-surface-2 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Projects by Workspace */}
      <AnimatePresence mode="wait">
        {projectsByWorkspace.length > 0 ? (
          <motion.div
            key="projects"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
          >
            {projectsByWorkspace.map((group, groupIndex) => (
              <motion.div
                key={group.workspace.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + groupIndex * 0.1 }}
              >
                {/* Workspace Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-orange-500/5 flex items-center justify-center">
                      <Layers className="h-4 w-4 text-primary/70" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{group.workspace.name}</h2>
                      <p className="text-xs text-muted-foreground">
                        {group.projects.length} project{group.projects.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <Link href={`/w/${group.workspace.slug}`}>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
                      View workspace
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>

                {/* Projects Grid/List */}
                <div className={cn(
                  viewMode === "grid"
                    ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-3"
                )}>
                  {group.projects.map((project, projectIndex) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      viewMode={viewMode}
                      index={projectIndex}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : projects.length > 0 ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mb-5">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground text-sm text-center max-w-sm">
              No projects match &ldquo;{searchQuery}&rdquo;. Try a different search term.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center mb-5">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm text-center">
              Create a workspace first, then add projects to start tracking your issues.
            </p>
            <Link href="/dashboard">
              <Button className="btn-premium text-primary-foreground font-semibold">
                Go to Dashboard
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ProjectCardProps {
  project: ProjectWithStats
  viewMode: ViewMode
  index: number
}

function ProjectCard({ project, viewMode, index }: ProjectCardProps) {
  const completionRate = project.stats.totalIssues > 0
    ? Math.round((project.stats.completedIssues / project.stats.totalIssues) * 100)
    : 0

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
      >
        <Link href={`/w/${project.workspace.slug}/projects/${project.id}`}>
          <Card className="group hover-lift cursor-pointer border-border/50 overflow-hidden">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${project.color}20, ${project.color}10)`,
                  }}
                >
                  {project.icon ? (
                    <span className="text-xl">{project.icon}</span>
                  ) : (
                    <FolderKanban className="h-5 w-5" style={{ color: project.color }} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{project.name}</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {project.description || "No description"}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Circle className="h-3.5 w-3.5 text-amber-400" />
                    <span>{project.stats.openIssues} open</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{project.stats.completedIssues} done</span>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="stat-number text-foreground">{completionRate}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${completionRate}%`,
                          background: `linear-gradient(90deg, ${project.color}, ${project.color}cc)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/w/${project.workspace.slug}/projects/${project.id}`}>
        <Card className="group card-premium h-full hover-lift cursor-pointer border-border/50 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${project.color}20, ${project.color}10)`,
                  }}
                >
                  {project.icon ? (
                    <span className="text-xl">{project.icon}</span>
                  ) : (
                    <FolderKanban className="h-5 w-5" style={{ color: project.color }} />
                  )}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
            </div>
            <CardDescription className="line-clamp-2 mt-2">
              {project.description || "No description"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-primary/70" />
                <span>{project.stats.totalIssues} issue{project.stats.totalIssues !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle className="h-3.5 w-3.5 text-amber-400/70" />
                <span>{project.stats.openIssues} open</span>
              </div>
            </div>

            {/* Progress Bar */}
            {project.stats.totalIssues > 0 && (
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
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${project.color}, ${project.color}cc)`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
