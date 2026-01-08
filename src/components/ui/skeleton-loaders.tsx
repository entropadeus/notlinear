"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Base skeleton with premium shimmer effect
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-muted/50", className)}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/[0.05] to-transparent"
        animate={{ translateX: ["-100%", "100%"] }}
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

// Card skeleton with inner content
function CardSkeleton({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card p-6 shadow-sm overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================
// PAGE SKELETON LOADERS
// ============================================

export function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header - matches Icon + Dashboard + Welcome back */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid - 4 stat cards */}
      <div className="mb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <CardSkeleton className="pt-5 pb-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardSkeleton>
            </div>
          ))}
        </div>

        {/* Overall Progress Card */}
        <div className="mt-5">
          <CardSkeleton className="py-5">
            <div className="flex items-center gap-5">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            </div>
          </CardSkeleton>
        </div>
      </div>

      {/* Workspaces Section Header */}
      <div className="mb-5">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24 ml-4" />
      </div>

      {/* Workspaces Grid - matches workspace cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <CardSkeleton className="h-full">
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-4 w-full" />

                {/* Stats row */}
                <div className="flex items-center gap-5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3.5 w-3.5 rounded" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3.5 w-3.5 rounded" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              </div>
            </CardSkeleton>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProjectsSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header - Icon + Projects + subtitle */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-5 w-52" />
          </div>
        </div>
      </div>

      {/* Stats Overview - 4 cards */}
      <div className="mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <CardSkeleton className="pt-5 pb-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardSkeleton>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <CardSkeleton className="py-5">
            <div className="flex items-center gap-5">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            </div>
          </CardSkeleton>
        </div>
      </div>

      {/* Search & View Controls */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 flex-1 max-w-md rounded-lg" />
        <Skeleton className="h-10 w-20 rounded-lg" />
      </div>

      {/* Workspace Group */}
      <div className="space-y-10">
        {/* Workspace Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>

        {/* Project Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <CardSkeleton>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-center gap-4 text-xs">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-14" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                </div>
              </CardSkeleton>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header - Icon + Settings */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-5 w-52" />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <div>
          <CardSkeleton>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>

            {/* Avatar + info */}
            <div className="flex items-center gap-6 mb-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>

            <Skeleton className="h-px w-full mb-6" />

            {/* Name input */}
            <div className="space-y-2 mb-6">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-80 rounded-lg" />
                <Skeleton className="h-10 w-24 rounded-lg" />
              </div>
            </div>

            {/* Email input */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-80 rounded-lg" />
              <Skeleton className="h-3 w-72" />
            </div>
          </CardSkeleton>
        </div>

        {/* Appearance Section */}
        <div>
          <CardSkeleton>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>

            {/* Theme selector - 3 buttons */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-12" />
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            </div>
          </CardSkeleton>
        </div>

        {/* Notifications Section */}
        <div>
          <CardSkeleton>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>

            {/* 3 switch rows */}
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                {i > 0 && <Skeleton className="h-px w-full my-6" />}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              </div>
            ))}
          </CardSkeleton>
        </div>

        {/* Danger Zone */}
        <div>
          <CardSkeleton className="border-destructive/30">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-52" />
              </div>
            </div>

            {/* Delete account row */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-72" />
              </div>
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </CardSkeleton>
        </div>
      </div>
    </div>
  )
}

export function WorkspaceSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header - back button + icon + title + buttons */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>

      {/* Workspace Stats Card */}
      <div className="mb-8">
        <CardSkeleton>
          {/* Progress bar */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>

          {/* 6 status columns */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </CardSkeleton>
      </div>

      {/* Projects Header */}
      <div className="mb-5">
        <Skeleton className="h-5 w-20 mb-2" />
        <Skeleton className="h-4 w-24 ml-4" />
      </div>

      {/* Projects Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <CardSkeleton className="h-full">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-4 w-full ml-11" />

                {/* Compact stats */}
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              </div>
            </CardSkeleton>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProjectSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto p-8 max-w-7xl mx-auto">
        {/* Header - back + icon + title + 3 buttons */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>

        {/* Project Stats Card */}
        <div className="mb-8">
          <CardSkeleton className="pt-6">
            {/* Progress bar */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>

            {/* 6 status breakdown columns */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-7 w-8" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </CardSkeleton>
        </div>

        {/* Issues Header */}
        <div className="mb-5">
          <Skeleton className="h-5 w-16 mb-2" />
          <Skeleton className="h-4 w-20 ml-4" />
        </div>

        {/* Issues List - matches IssueList component */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <CardSkeleton className="p-4">
                <div className="flex items-center gap-4">
                  {/* Status icon */}
                  <Skeleton className="h-8 w-8 rounded-lg" />

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 flex-1 max-w-xs" />
                    </div>
                    <Skeleton className="h-3 w-3/4" />
                  </div>

                  {/* Right side - priority, time, arrow */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                </div>
              </CardSkeleton>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function IssueSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header - back + title + identifier */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-72" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main content - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Card */}
              <CardSkeleton>
                <Skeleton className="h-5 w-24 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardSkeleton>

              {/* Comments Card */}
              <CardSkeleton>
                <Skeleton className="h-5 w-24 mb-4" />

                {/* Comment form */}
                <Skeleton className="h-24 w-full rounded-lg mb-4" />
                <Skeleton className="h-10 w-32 rounded-lg mb-6" />

                {/* Comments list */}
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardSkeleton>
            </div>

            {/* Sidebar - 1/3 */}
            <div className="space-y-6">
              {/* Details Card */}
              <CardSkeleton>
                <Skeleton className="h-4 w-16 mb-4" />

                <div className="space-y-4">
                  {/* Status */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>

                  {/* Created */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>

                  {/* Updated */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardSkeleton>

              {/* Activity Card */}
              <CardSkeleton>
                <Skeleton className="h-4 w-16 mb-4" />

                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-4 w-6 rounded-full" />
                </div>

                {/* Revision items */}
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardSkeleton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
