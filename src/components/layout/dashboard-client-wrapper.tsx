"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { CommandPalette } from "@/components/command-palette"
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { useNavigation } from "@/components/providers/navigation-provider"
import { useEffect, useState } from "react"
import type { Session } from "next-auth"

interface DashboardClientWrapperProps {
  children: React.ReactNode
  session: Session | null
}

const CONTENT_TRANSITION = {
  duration: 0.2,
  ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
}

const FADE_OUT_TRANSITION = {
  duration: 0.12,
  ease: "easeOut" as const,
}

export function DashboardClientWrapper({ children, session }: DashboardClientWrapperProps) {
  const pathname = usePathname()
  const { isNavigating } = useNavigation()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar stays static - no transition */}
      <Sidebar session={session} />

      {/* Main content transitions between pages */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={isMounted ? false : { opacity: 0 }}
          animate={{ opacity: isNavigating ? 0.4 : 1 }}
          exit={{ opacity: 0 }}
          transition={isNavigating ? FADE_OUT_TRANSITION : CONTENT_TRANSITION}
          className="flex-1 overflow-auto"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <CommandPalette />
      <KeyboardShortcutsDialog />
    </div>
  )
}
