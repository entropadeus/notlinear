"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderKanban, Settings, LogOut, Plus, ChevronLeft, ChevronRight } from "lucide-react"
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

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban, exact: false },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, exact: false },
]

const SIDEBAR_WIDTH = 256
const SIDEBAR_COLLAPSED_WIDTH = 72

export function Sidebar() {
  const { data: session } = useSession()
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
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
        className="relative flex h-screen flex-col border-r border-border/50 bg-gradient-to-b from-card to-background overflow-hidden"
      >
        {/* Logo Section */}
        <div className={cn(
          "flex h-16 items-center border-b border-border/50 px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={isCollapsed ? toggleCollapse : undefined}
                className={cn(
                  "flex items-center gap-3",
                  isCollapsed && "cursor-pointer"
                )}
                whileHover={isCollapsed ? { scale: 1.05 } : undefined}
                whileTap={isCollapsed ? { scale: 0.95 } : undefined}
              >
                <div className="relative flex-shrink-0">
                  <Image
                    src="/NotLinear-icon.png"
                    alt="NotLinear"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <div className="absolute -inset-1 rounded-lg bg-primary/20 blur-md -z-10" />
                </div>
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="text-lg font-bold tracking-tight whitespace-nowrap"
                    >
                      NotLinear
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" sideOffset={10}>
                Expand sidebar
              </TooltipContent>
            )}
          </Tooltip>

          {/* Collapse Toggle Button - only show when expanded */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={toggleCollapse}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-surface-2 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Create Button */}
        <div className="p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setShowCreateWorkspace(true)}
                className={cn(
                  "btn-premium text-primary-foreground font-semibold transition-all duration-200",
                  isCollapsed ? "w-full px-0 justify-center" : "w-full"
                )}
                size="sm"
              >
                <Plus className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      New Workspace
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" sideOffset={10}>
                New Workspace
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        active
                          ? "nav-active text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-2",
                        isCollapsed && "justify-center px-0"
                      )}
                    >
                      <Icon className={cn(
                        "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                        active ? "text-primary" : "group-hover:text-primary/70"
                      )} />
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="whitespace-nowrap"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {active && !isCollapsed && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary shadow-glow-sm"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" sideOffset={10}>
                      {item.name}
                    </TooltipContent>
                  )}
                </Tooltip>
              </motion.div>
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
                      "w-full h-auto py-2.5 hover:bg-surface-2 rounded-lg transition-all duration-200",
                      isCollapsed ? "px-0 justify-center" : "justify-start gap-3 px-3"
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
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
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
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={10}>
                  {session?.user?.name}
                </TooltipContent>
              )}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
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
