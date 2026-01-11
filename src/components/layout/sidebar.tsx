"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderKanban, Settings, LogOut, Plus, ChevronLeft } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog"
import { motion, AnimatePresence } from "framer-motion"
import type { Session } from "next-auth"

// Custom click animations for each nav icon (plays when tab becomes active)
const iconAnimations = {
  // Dashboard: pulse effect like activity indicator
  Dashboard: {
    active: { scale: [1, 1.25, 1], transition: { duration: 0.4, times: [0, 0.4, 1] } },
    initial: { scale: 1 },
  },
  // Projects: shuffle/bounce like organizing cards
  Projects: {
    active: { y: [0, -4, 0], rotate: [0, -8, 8, 0], transition: { duration: 0.5, times: [0, 0.3, 0.6, 1] } },
    initial: { y: 0, rotate: 0 },
  },
  // Settings: gear rotation
  Settings: {
    active: { rotate: [0, 180], transition: { type: "spring", stiffness: 200, damping: 12 } },
    initial: { rotate: 0 },
  },
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban, exact: false },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, exact: false },
]

const SIDEBAR_WIDTH = 256
const SIDEBAR_COLLAPSED_WIDTH = 72

// Fluid spring configurations for different interaction types
const springConfig = {
  // Main sidebar collapse - snappy with subtle overshoot
  sidebar: { stiffness: 400, damping: 35, mass: 0.8 },
  // Nav item hover - quick and responsive
  hover: { stiffness: 500, damping: 30, mass: 0.5 },
  // Active indicator morph - smooth and elegant
  indicator: { stiffness: 350, damping: 30, mass: 1 },
  // Text fade - gentle
  text: { stiffness: 300, damping: 25, mass: 0.6 },
  // Icon micro-interactions - bouncy
  icon: { stiffness: 600, damping: 20, mass: 0.3 },
}

interface SidebarProps {
  session: Session | null
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname()
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed")
    if (stored !== null) {
      setIsCollapsed(JSON.parse(stored))
    }
    setIsHydrated(true)
  }, [])

  // Persist collapsed state
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed))
    }
  }, [isCollapsed, isHydrated])

  // Keyboard shortcut: Cmd/Ctrl + B to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        setIsCollapsed((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname === item.href || pathname?.startsWith(item.href + "/")
  }

  const toggleCollapse = () => setIsCollapsed((prev) => !prev)

  // Prevent flash of wrong width on initial render
  if (!isHydrated) {
    return (
      <aside className="flex h-screen w-64 flex-col border-r border-border/50 bg-gradient-to-b from-card to-background" />
    )
  }

  return (
    <TooltipProvider delayDuration={100}>
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        }}
        transition={{
          type: "spring",
          ...springConfig.sidebar,
        }}
        className="relative flex h-screen flex-col border-r border-border/50 bg-gradient-to-b from-card to-background overflow-hidden"
        style={{ willChange: "width" }}
      >
        {/* Logo Section */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-border/50 px-4 transition-all duration-200",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={isCollapsed ? toggleCollapse : undefined}
                className={cn(
                  "flex items-center gap-3 transition-transform duration-200",
                  isCollapsed && "cursor-pointer hover:scale-105 active:scale-95"
                )}
              >
                <div className="relative flex-shrink-0">
                  <Image
                    src="/NotLinear-icon.png"
                    alt="NotLinear"
                    width={32}
                    height={32}
                    className={cn(
                      "rounded-lg transition-transform duration-200",
                      isCollapsed && "scale-110"
                    )}
                  />
                  <div
                    className={cn(
                      "absolute -inset-1 rounded-lg bg-primary/20 blur-md -z-10 transition-all duration-200",
                      isCollapsed ? "scale-125 opacity-70" : "scale-100 opacity-50"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-lg font-bold tracking-tight whitespace-nowrap transition-all duration-200 overflow-hidden",
                    isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  NotLinear
                </span>
              </button>
            </TooltipTrigger>
          </Tooltip>

          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md hover:bg-surface-2 transition-all duration-200",
              isCollapsed ? "w-0 opacity-0 overflow-hidden" : "opacity-100 hover:scale-105 active:scale-95"
            )}
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Create Button */}
        <div className="p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setShowCreateWorkspace(true)}
                className={cn(
                  "btn-premium text-primary-foreground font-semibold transition-all duration-200 overflow-hidden",
                  isCollapsed ? "w-full px-0 justify-center" : "w-full"
                )}
                size="sm"
              >
                <Plus className={cn("h-4 w-4 flex-shrink-0 transition-all duration-200", !isCollapsed && "mr-2")} />
                <span
                  className={cn(
                    "whitespace-nowrap overflow-hidden transition-all duration-300 ease-out",
                    isCollapsed
                      ? "w-0 opacity-0 translate-y-2"
                      : "w-auto opacity-100 translate-y-0"
                  )}
                >
                  New Workspace
                </span>
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <div key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        active
                          ? "text-foreground bg-gradient-to-r from-[hsl(var(--amber-glow))] to-transparent"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-2 hover:translate-x-1",
                        isCollapsed && "justify-center px-0"
                      )}
                    >
                      {/* Icon with custom animation per icon type - animates on click/navigation */}
                      <motion.div
                        className="relative z-10 flex-shrink-0"
                        initial={false}
                        animate={active ? iconAnimations[item.name as keyof typeof iconAnimations]?.active : iconAnimations[item.name as keyof typeof iconAnimations]?.initial}
                      >
                        <Icon className={cn(
                          "h-[18px] w-[18px] flex-shrink-0",
                          active ? "text-primary" : "text-current group-hover:text-primary/70 transition-colors duration-200"
                        )} />
                      </motion.div>

                      {/* Text - hidden when collapsed */}
                      {!isCollapsed && (
                        <span className="whitespace-nowrap relative z-10">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </TooltipTrigger>
                </Tooltip>
              </div>
            )
          })}
        </nav>

        {/* Decorative Element */}
        <div className="px-4 py-3">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* User Section */}
        <div className="p-3">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full h-14 hover:bg-surface-2 rounded-lg transition-all duration-200 justify-start items-center",
                      isCollapsed ? "px-[6px]" : "gap-3 px-3"
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-9 w-9 ring-2 ring-border/50">
                        <AvatarImage src={session?.user?.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-orange-500/20 text-foreground font-semibold">
                          {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
                    </div>
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                          transition={{
                            type: "spring",
                            ...springConfig.text,
                          }}
                          className="flex flex-col items-start text-left min-w-0"
                        >
                          <span className="text-sm font-medium truncate max-w-[140px]">
                            {session?.user?.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                            {session?.user?.email}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
            </Tooltip>
            <DropdownMenuContent align={isCollapsed ? "center" : "end"} side={isCollapsed ? "right" : "top"} className="w-56 glass">
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Keyboard shortcut hint */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              transition={{
                type: "spring",
                ...springConfig.text,
                delay: 0.1,
              }}
              className="px-4 pb-3"
            >
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground/50">
                <kbd className="px-1.5 py-0.5 rounded bg-surface-2 font-mono">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-2 font-mono">B</kbd>
                <span className="ml-1">to collapse</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
      />
    </TooltipProvider>
  )
}
