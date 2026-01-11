"use client"

import { WorkspaceStats } from "@/lib/actions/stats"
import { Card, CardContent } from "@/components/ui/card"
import { FolderKanban, CheckCircle2, Circle, LayoutList } from "lucide-react"
import { motion } from "framer-motion"

interface WorkspaceStatsCardProps {
  stats: WorkspaceStats
}

export function WorkspaceStatsCard({ stats }: WorkspaceStatsCardProps) {
  const completionRate = stats.totalIssues > 0 
    ? Math.round((stats.completedIssues / stats.totalIssues) * 100) 
    : 0

  const statItems = [
    {
      label: "Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total Issues",
      value: stats.totalIssues,
      icon: LayoutList,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Open",
      value: stats.openIssues,
      icon: Circle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Completed",
      value: stats.completedIssues,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="rounded-stat hover:shadow-glow-sm transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${item.bgColor}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold stat-number">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

