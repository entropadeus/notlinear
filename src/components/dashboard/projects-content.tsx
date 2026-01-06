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

interface ProjectsContentProps {
  workspaces: Workspace[]
}

export function ProjectsContent({ workspaces }: ProjectsContentProps) {
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
        {workspaces.map((workspace, index) => (
          <motion.div
            key={workspace.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{workspace.name}</CardTitle>
                <CardDescription>{workspace.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/w/${workspace.slug}`} className="text-sm text-primary hover:underline">
                  View projects →
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {workspaces.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">No workspaces yet. Create one to get started.</p>
        </motion.div>
      )}
    </div>
  )
}
