"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import Link from "next/link"

interface Workspace {
  id: string
  name: string
  slug: string
  description: string | null
}

interface ProjectsPageContentProps {
  workspaces: Workspace[]
}

export function ProjectsPageContent({ workspaces }: ProjectsPageContentProps) {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">Manage your projects across workspaces</p>
      </motion.div>

      <div className="space-y-6">
        {workspaces.map((workspace) => (
          <motion.div
            key={workspace.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{workspace.name}</CardTitle>
                <CardDescription>{workspace.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/${workspace.slug}/projects`} className="text-sm text-primary hover:underline">
                  View projects →
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

