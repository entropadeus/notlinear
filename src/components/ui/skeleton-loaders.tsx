"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Base skeleton with premium shimmer effect
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-muted/50", className)}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/[0.05] to-transparent"
        animate={{ translateX: ["−100%", "100%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.5,
        }}
      />
    </div>
  )
}

// Stagger container for children
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    }
  },
}

// Card skeleton with inner content
function CardSkeleton({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        "rounded-xl border border-border/50 bg-card p-6 shadow-sm",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

// Stat card skeleton (for dashboard quick stats)
function StatCardSkeleton() {
  return (
    <CardSkeleton>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </CardSkeleton>
  )
}

// Workspace card skeleton
function WorkspaceCardSkeleton() {
  return (
    <CardSkeleton className="h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </div>
    </CardSkeleton>
  )
}

// Project card skeleton
function ProjectCardSkeleton() {
  return (
    <CardSkeleton>
      <div className="space-y-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </CardSkeleton>
  )
}

// Settings section skeleton
function SettingsSectionSkeleton() {
  return (
    <CardSkeleton>
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2 pb-2 border-b border-border/30">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Form fields */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
    </CardSkeleton>
  )
}

// Progress bar skeleton
function ProgressSkeleton() {
  return (
    <CardSkeleton className="py-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
    </CardSkeleton>
  )
}

// ============================================
// PAGE SKELETON LOADERS
// ============================================

export function DashboardSkeleton() {
  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Skeleton className="h-9 w-36 mb-2" />
        <Skeleton className="h-5 w-48" />
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="mb-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Overall progress */}
        <motion.div variants={staggerItem}>
          <ProgressSkeleton />
        </motion.div>
      </motion.div>

      {/* Workspaces Section Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-4 flex items-center justify-between"
      >
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </motion.div>

      {/* Workspaces Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {[...Array(3)].map((_, i) => (
          <WorkspaceCardSkeleton key={i} />
        ))}
      </motion.div>
    </div>
  )
}

export function ProjectsSkeleton() {
  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Skeleton className="h-9 w-28 mb-2" />
        <Skeleton className="h-5 w-64" />
      </motion.div>

      {/* Project cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {[...Array(3)].map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </motion.div>
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Skeleton className="h-9 w-24 mb-2" />
        <Skeleton className="h-5 w-52" />
      </motion.div>

      {/* Settings sections */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <SettingsSectionSkeleton />
        <SettingsSectionSkeleton />
      </motion.div>
    </div>
  )
}

export function WorkspaceSkeleton() {
  return (
    <div className="p-8">
      {/* Header with back button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </motion.div>

      {/* Stats card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="mb-8"
      >
        <CardSkeleton>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </CardSkeleton>
      </motion.div>

      {/* Projects header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mb-4"
      >
        <Skeleton className="h-5 w-20" />
      </motion.div>

      {/* Projects grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} variants={staggerItem}>
            <CardSkeleton className="h-32">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </CardSkeleton>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export function ProjectSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-8 w-36" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </motion.div>

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="mb-6"
        >
          <CardSkeleton>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/30">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </CardSkeleton>
        </motion.div>

        {/* Issues header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center justify-between mb-4"
        >
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-20" />
        </motion.div>

        {/* Issues list */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-card/50"
            >
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 flex-1 max-w-xs" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export function IssueSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-4xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-72" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <CardSkeleton>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24 mb-4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardSkeleton>

              <CardSkeleton>
                <div className="space-y-4">
                  <Skeleton className="h-5 w-24" />
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardSkeleton>
            </div>

            {/* Sidebar */}
            <div>
              <CardSkeleton>
                <div className="space-y-4">
                  <Skeleton className="h-5 w-16 mb-2" />
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-9 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              </CardSkeleton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
