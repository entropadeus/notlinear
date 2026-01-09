"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { CommandPalette } from "@/components/command-palette"
import { motion } from "framer-motion"
import type { Session } from "next-auth"

interface DashboardClientWrapperProps {
  children: React.ReactNode
  session: Session | null
}

export function DashboardClientWrapper({ children, session }: DashboardClientWrapperProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar session={session} />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-auto"
      >
        {children}
      </motion.main>
      <CommandPalette />
    </div>
  )
}
