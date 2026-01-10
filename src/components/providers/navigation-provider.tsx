"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface NavigationContextType {
  isNavigating: boolean
  startNavigation: () => void
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
  startNavigation: () => {},
})

export function useNavigation() {
  return useContext(NavigationContext)
}

function LoadingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="flex items-center justify-center"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full scale-150" />
          {/* Spinner */}
          <Loader2 className="relative h-8 w-8 text-primary animate-spin" />
        </div>
      </motion.div>
    </motion.div>
  )
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Reset navigation state when route changes complete
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname, searchParams])

  const startNavigation = useCallback(() => {
    setIsNavigating(true)
  }, [])

  // Intercept all internal link clicks to trigger immediate feedback
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")

      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (!href) return

      // Skip external links, hash links, and special protocols
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        anchor.target === "_blank"
      ) {
        return
      }

      // Skip if modifier keys are pressed (open in new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey) return

      // Skip if navigating to the same page
      if (href === pathname) return

      // Trigger immediate visual feedback
      setIsNavigating(true)
    }

    document.addEventListener("click", handleClick, { capture: true })
    return () => document.removeEventListener("click", handleClick, { capture: true })
  }, [pathname])

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation }}>
      {children}
      <AnimatePresence>
        {isNavigating && <LoadingSpinner />}
      </AnimatePresence>
    </NavigationContext.Provider>
  )
}
