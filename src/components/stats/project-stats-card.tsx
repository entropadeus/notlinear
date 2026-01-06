"use client"

import { ProjectStats } from "@/lib/actions/stats"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ProjectStatsCardProps {
  stats: ProjectStats
  compact?: boolean
}

export function ProjectStatsCard({ stats, compact = false }: ProjectStatsCardProps) {
  const completionRate = stats.totalIssues > 0 
    ? Math.round((stats.done / stats.totalIssues) * 100) 
    : 0

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-0.5">
            {stats.done > 0 && (
              <div 
                className="h-2 rounded-full bg-green-500" 
                style={{ width: `${Math.max(8, stats.done * 4)}px` }}
              />
            )}
            {stats.inProgress > 0 && (
              <div 
                className="h-2 rounded-full bg-yellow-500" 
                style={{ width: `${Math.max(8, stats.inProgress * 4)}px` }}
              />
            )}
            {stats.todo > 0 && (
              <div 
                className="h-2 rounded-full bg-blue-500" 
                style={{ width: `${Math.max(8, stats.todo * 4)}px` }}
              />
            )}
            {stats.backlog > 0 && (
              <div 
                className="h-2 rounded-full bg-gray-400" 
                style={{ width: `${Math.max(8, stats.backlog * 4)}px` }}
              />
            )}
          </div>
        </div>
        <span className="text-muted-foreground">
          {stats.totalIssues} issue{stats.totalIssues !== 1 ? "s" : ""}
        </span>
        {stats.totalIssues > 0 && (
          <span className="text-muted-foreground">
            {completionRate}% done
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">{completionRate}%</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completionRate}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-green-500 rounded-full"
        />
      </div>

      {/* Stats breakdown */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Done</span>
          <span className="font-medium">{stats.done}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">Active</span>
          <span className="font-medium">{stats.inProgress + stats.inReview}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Todo</span>
          <span className="font-medium">{stats.todo + stats.backlog}</span>
        </div>
      </div>
    </div>
  )
}

