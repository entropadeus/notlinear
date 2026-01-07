"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, ArrowLeft, ArrowRight, FolderKanban, Layers, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { CreateProjectDialog } from "./create-project-dialog"
import { EditWorkspaceDialog } from "./edit-workspace-dialog"
import { TeamManagementDialog } from "./team-management-dialog"
import { WorkspaceStatsCard } from "@/components/stats/workspace-stats-card"
import { ProjectStatsCard } from "@/components/stats/project-stats-card"
import { WorkspaceStats, ProjectStats } from "@/lib/actions/stats"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  name: string
  description: string | null
  icon: string | null
}

interface Workspace {
  id: string
  name: string
  slug: string
  description: string | null
}

interface WorkspaceContentProps {
  workspace: Workspace
  projects: Project[]
  workspaceSlug: string
  workspaceStats?: WorkspaceStats | null
  projectStats?: Record<string, ProjectStats>
  currentUserRole: "owner" | "admin" | "member"
}

export function WorkspaceContent({
  workspace,
  projects,
  workspaceSlug,
  workspaceStats,
  projectStats = {},
  currentUserRole,
}: WorkspaceContentProps) {
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showEditWorkspace, setShowEditWorkspace] = useState(false)
  const [showTeamManagement, setShowTeamManagement] = useState(false)

  const isAdmin = currentUserRole === "owner" || currentUserRole === "admin"

  return (
    <>
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="shrink-0 hover:bg-surface-2 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{workspace.name}</h1>
              <p className="text-muted-foreground">{workspace.description || "No description"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCreateProject(true)} className="btn-premium text-primary-foreground font-semibold">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-surface-2 rounded-xl">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass">
              <DropdownMenuItem onClick={() => setShowTeamManagement(true)}>
                <Users className="mr-2 h-4 w-4" />
                Manage team
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowEditWorkspace(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit workspace
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Workspace Stats */}
      {workspaceStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8"
        >
          <WorkspaceStatsCard stats={workspaceStats} />
        </motion.div>
      )}

      {/* Projects Header */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-5"
        >
          <div className="section-header">
            <h2 className="text-lg font-semibold">Projects</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-4">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project, index) => {
          const stats = projectStats[project.id]
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.06 }}
            >
              <Link href={`/w/${workspaceSlug}/projects/${project.id}`}>
                <Card className="group card-premium transition-all hover-lift cursor-pointer h-full border-border/50 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {project.icon ? (
                          <span className="text-2xl">{project.icon}</span>
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center">
                            <FolderKanban className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </div>
                    <CardDescription className="line-clamp-2 ml-11">
                      {project.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  {stats && (
                    <CardContent className="pt-0">
                      <ProjectStatsCard stats={stats} compact />
                    </CardContent>
                  )}
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Empty State */}
      {projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center mb-5">
            <FolderKanban className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm text-center">
            Create your first project to start tracking issues and tasks.
          </p>
          <Button onClick={() => setShowCreateProject(true)} className="btn-premium text-primary-foreground font-semibold">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </motion.div>
      )}

      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        workspaceId={workspace.id}
      />

      <EditWorkspaceDialog
        open={showEditWorkspace}
        onOpenChange={setShowEditWorkspace}
        workspace={workspace}
      />

      <TeamManagementDialog
        open={showTeamManagement}
        onOpenChange={setShowTeamManagement}
        workspace={workspace}
        currentUserRole={currentUserRole}
      />
    </div>
    </>
  )
}
