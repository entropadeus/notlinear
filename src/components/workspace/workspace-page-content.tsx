"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Project {
  id: string
  name: string
  description: string | null
  icon: string | null
}

interface Workspace {
  id: string
  name: string
  description: string | null
}

interface WorkspacePageContentProps {
  workspace: Workspace
  projects: Project[]
  workspaceSlug: string
}

export function WorkspacePageContent({ workspace, projects, workspaceSlug }: WorkspacePageContentProps) {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">{workspace.name}</h1>
          <p className="text-muted-foreground">{workspace.description || "No description"}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/dashboard/${workspaceSlug}/projects/${project.id}`}>
              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {project.icon && <span className="text-2xl">{project.icon}</span>}
                    <CardTitle>{project.name}</CardTitle>
                  </div>
                  <CardDescription>{project.description || "No description"}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <p className="mb-4 text-muted-foreground">No projects yet</p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </motion.div>
      )}
    </div>
  )
}

