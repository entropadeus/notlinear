"use client"

import { motion } from "framer-motion"

// Kanban board skeleton
function ColumnSkeleton() {
  return (
    <div className="flex-shrink-0 w-72 rounded-lg bg-muted/30 p-3">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="h-4 w-4 rounded bg-muted/50 animate-pulse" />
        <div className="h-4 w-20 rounded bg-muted/50 animate-pulse" />
        <div className="h-4 w-6 rounded bg-muted/50 animate-pulse ml-auto" />
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="p-3 rounded-lg bg-card border border-border/50"
          >
            <div className="space-y-2">
              <div className="h-3 w-12 rounded bg-muted/50 animate-pulse" />
              <div className="h-4 w-full rounded bg-muted/50 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-5 w-14 rounded-full bg-muted/50 animate-pulse" />
                <div className="h-5 w-12 rounded-full bg-muted/50 animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function BoardLoading() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted/50 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-muted/50 animate-pulse" />
            <div className="h-7 w-36 rounded bg-muted/50 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-auto p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex gap-4 h-full"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <ColumnSkeleton />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
