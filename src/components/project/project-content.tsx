"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, LayoutGrid, List, Circle, Loader2, CheckCircle2, XCircle, Clock, Archive, MoreHorizontal, Trash2, ArrowLeft, Pencil, ListTodo } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { IssueList } from "@/components/issues/issue-list"
import { IssueGrid } from "@/components/issues/issue-grid"
import { useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { CreateIssueDialog } from "@/components/issues/create-issue-dialog"
import { DeleteProjectDialog } from "@/components/project/delete-project-dialog"
import { EditProjectDialog } from "@/components/project/edit-project-dialog"
import { FilterBar } from "@/components/filters"
import { ProjectStats } from "@/lib/actions/stats"
import { Issue } from "@/lib/actions/issues"
import { WorkspaceMember, LabelOption } from "@/lib/actions/filters"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string
}

interface ProjectContentProps {
  project: Project
  issues: Issue[]
  workspaceSlug: string
  projectId: string
  workspaceId: string
  projectStats?: ProjectStats | null
  members: WorkspaceMember[]
  labels: LabelOption[]
  currentUserId: string
}

const statusConfig = [
  { key: "backlog", label: "Backlog", icon: Archive, color: "text-slate-400", gradient: "from-slate-500/20 to-slate-600/10" },
  { key: "todo", label: "Todo", icon: Circle, color: "text-blue-400", gradient: "from-blue-500/20 to-blue-600/10" },
  { key: "inProgress", label: "In Progress", icon: Loader2, color: "text-orange-400", gradient: "from-orange-500/20 to-orange-600/10" },
  { key: "inReview", label: "In Review", icon: Clock, color: "text-violet-400", gradient: "from-violet-500/20 to-violet-600/10" },
  { key: "done", label: "Done", icon: CheckCircle2, color: "text-emerald-400", gradient: "from-emerald-500/20 to-emerald-600/10" },
  { key: "cancelled", label: "Cancelled", icon: XCircle, color: "text-red-400", gradient: "from-red-500/20 to-red-600/10" },
]

type ViewMode = "list" | "grid"

export function ProjectContent({ project, issues, workspaceSlug, projectId, workspaceId, projectStats, members, labels, currentUserId }: ProjectContentProps) {
  const [showCreateIssue, setShowCreateIssue] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(`project-view-${projectId}`, "list")

  const handleCreateNew = () => setShowCreateIssue(true)

  const handleStatusChange = async (issueId: string, status: string) => {
    // TODO: Implement status change logic
    console.log("Status change:", issueId, status)
  }

  const handleAssignToMe = async (issueId: string) => {
    // TODO: Implement assign to me logic
    console.log("Assign to me:", issueId)
  }

  const handleChangePriority = async (issueId: string) => {
    // TODO: Implement priority change logic
    console.log("Change priority:", issueId)
  }

  const handleDelete = async (issueId: string) => {
    // TODO: Implement delete logic
    console.log("Delete issue:", issueId)
  }

  const completionRate = projectStats && projectStats.totalIssues > 0
    ? Math.round((projectStats.done / projectStats.totalIssues) * 100)
    : 0

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Link href={`/w/${workspaceSlug}`}>
              <Button variant="ghost" size="icon" className="shrink-0 hover:bg-surface-2 rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center">
                {project.icon ? (
                  <span className="text-2xl">{project.icon}</span>
                ) : (
                  <ListTodo className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <p className="text-muted-foreground">{project.description || "No description"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border/50 p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-8 px-3 rounded-md",
                  viewMode === "list" ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-8 px-3 rounded-md",
                  viewMode === "grid" ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setShowCreateIssue(true)} className="btn-premium text-primary-foreground font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              New Issue
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-surface-2 rounded-xl">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 glass">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Project Stats */}
        {projectStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-8"
          >
            <Card className="overflow-hidden border-border/50">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Progress bar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="stat-number text-lg text-foreground">{completionRate}% complete</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-surface-2 overflow-hidden flex">
                      {projectStats.totalIssues > 0 && (
                        <>
                          {projectStats.done > 0 && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(projectStats.done / projectStats.totalIssues) * 100}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-green-400"
                            />
                          )}
                          {projectStats.inReview > 0 && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(projectStats.inReview / projectStats.totalIssues) * 100}%` }}
                              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                              className="h-full bg-gradient-to-r from-violet-500 to-purple-400"
                            />
                          )}
                          {projectStats.inProgress > 0 && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(projectStats.inProgress / projectStats.totalIssues) * 100}%` }}
                              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                              className="h-full bg-gradient-to-r from-orange-500 to-orange-300"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status breakdown */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {statusConfig.map((status, index) => {
                      const Icon = status.icon
                      const count = projectStats[status.key as keyof ProjectStats] as number
                      return (
                        <motion.div
                          key={status.key}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 + index * 0.05 }}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br",
                            status.gradient
                          )}
                        >
                          <Icon className={cn("h-5 w-5", status.color)} />
                          <span className="stat-number text-2xl text-foreground">{count}</span>
                          <span className="text-xs text-muted-foreground text-center font-medium">{status.label}</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card to-surface-2/50">
            <CardContent className="py-4">
              <FilterBar
                workspaceId={workspaceId}
                projectId={projectId}
                members={members}
                labels={labels}
                currentUserId={currentUserId}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Issues Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-5"
        >
          <div className="section-header">
            <h2 className="text-lg font-semibold">Issues</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-4">
            {issues.length} issue{issues.length !== 1 ? "s" : ""} {issues.length < (projectStats?.totalIssues || 0) && <span className="text-primary">(filtered)</span>}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {viewMode === "list" ? (
            <IssueList
              issues={issues}
              workspaceSlug={workspaceSlug}
              members={members}
              onCreateNew={handleCreateNew}
              onStatusChange={handleStatusChange}
              onAssignToMe={handleAssignToMe}
              onChangePriority={handleChangePriority}
              onDelete={handleDelete}
            />
          ) : (
            <IssueGrid
              issues={issues}
              workspaceSlug={workspaceSlug}
              members={members}
              onCreateNew={handleCreateNew}
              onStatusChange={handleStatusChange}
              onAssignToMe={handleAssignToMe}
              onChangePriority={handleChangePriority}
              onDelete={handleDelete}
            />
          )}
        </motion.div>
      </div>

      <CreateIssueDialog
        open={showCreateIssue}
        onOpenChange={setShowCreateIssue}
        projectId={projectId}
        members={members}
      />

      <DeleteProjectDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        projectId={projectId}
        projectName={project.name}
        projectIcon={project.icon}
        workspaceSlug={workspaceSlug}
      />

      <EditProjectDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        project={project}
      />
    </div>
  )
}
