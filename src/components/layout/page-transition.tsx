"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useRef, type ReactNode } from "react"
import { useNavigation } from "@/components/providers/navigation-provider"

// Smooth cross-fade
const TRANSITION_CONFIG = {
  duration: 0.25,
  ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
}

// Fast fade out for immediate feedback
const FADE_OUT_CONFIG = {
  duration: 0.15,
  ease: "easeOut" as const,
}

// Routes that get full-page transitions (pages without persistent nav)
const FULL_PAGE_ROUTES = ["/", "/login", "/register"]

function isFullPageRoute(path: string) {
  return FULL_PAGE_ROUTES.some((route) => path === route)
}

function isDashboardRoute(path: string) {
  return path.startsWith("/dashboard") || path.startsWith("/w/")
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const previousPath = useRef(pathname)
  const { isNavigating } = useNavigation()

  useEffect(() => {
    previousPath.current = pathname
  }, [pathname])

  // Determine if we should animate
  const currentIsFullPage = isFullPageRoute(pathname)
  const previousIsFullPage = isFullPageRoute(previousPath.current)
  const currentIsDashboard = isDashboardRoute(pathname)
  const previousIsDashboard = isDashboardRoute(previousPath.current)

  // Only animate full-page transitions:
  // 1. Between full-page routes (e.g., / <-> /login)
  // 2. From full-page to dashboard (login -> dashboard) - but dashboard handles its own entry
  // 3. From dashboard to full-page (logout scenario)
  const shouldAnimate =
    !reduceMotion &&
    (currentIsFullPage || previousIsFullPage) &&
    !(currentIsDashboard && previousIsDashboard)

  if (!shouldAnimate) {
    // Even if not animating route changes, fade out when navigating for feedback
    return (
      <motion.div
        animate={{ opacity: isNavigating ? 0.5 : 1 }}
        transition={FADE_OUT_CONFIG}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: isNavigating ? 0.5 : 1 }}
        exit={{ opacity: 0 }}
        transition={isNavigating ? FADE_OUT_CONFIG : TRANSITION_CONFIG}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
