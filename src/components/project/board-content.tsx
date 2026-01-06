"use client"

import { KanbanBoard } from "@/components/kanban/board"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LayoutGrid } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Project {
  id: string
  name: string
  icon: string | null
}

interface Issue {
  id: string
  identifier: string
  title: string
  description: string | null
  status: string
  priority: string
  createdAt: Date
}

interface BoardContentProps {
  project: Project
  issues: Issue[]
  workspaceSlug: string
  projectId: string
}

export function BoardContent({ project, issues, workspaceSlug, projectId }: BoardContentProps) {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-b border-border/50 px-6 py-4"
      >
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <Link href={`/w/${workspaceSlug}/projects/${projectId}`}>
            <Button variant="ghost" size="icon" className="shrink-0 hover:bg-surface-2 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {project.icon ? (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center">
                <span className="text-xl">{project.icon}</span>
              </div>
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold tracking-tight">{project.name}</h1>
              <p className="text-xs text-muted-foreground">Kanban Board View</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Board */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex-1 overflow-auto p-6"
      >
        <KanbanBoard issues={issues as any} projectId={projectId} workspaceSlug={workspaceSlug} />
      </motion.div>
    </div>
  )
}
