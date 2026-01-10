"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { IssueList } from "@/components/issues/issue-list"
import { type Issue } from "@/lib/actions/issues"

interface Project {
  id: string
  name: string
  description: string | null
  icon: string | null
}

interface ProjectPageContentProps {
  project: Project
  issues: Issue[]
  workspaceSlug: string
  projectId: string
}

export function ProjectPageContent({ project, issues, workspaceSlug, projectId }: ProjectPageContentProps) {
  const handleCreateNew = () => {
    // TODO: Implement create new issue
    console.log("Create new issue")
  }

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
  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              {project.icon && <span className="text-2xl">{project.icon}</span>}
              <h1 className="text-3xl font-bold">{project.name}</h1>
            </div>
            <p className="text-muted-foreground">{project.description || "No description"}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/${workspaceSlug}/projects/${projectId}/board`}>
              <Button variant="outline">Board View</Button>
            </Link>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Issue
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <IssueList
            issues={issues}
            workspaceSlug={workspaceSlug}
            onCreateNew={handleCreateNew}
            onStatusChange={handleStatusChange}
            onAssignToMe={handleAssignToMe}
            onChangePriority={handleChangePriority}
            onDelete={handleDelete}
          />
        </motion.div>
      </div>
    </div>
  )
}

