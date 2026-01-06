"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderKanban, Settings, LogOut, Plus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog"
import { motion } from "framer-motion"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban, exact: false },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, exact: false },
]

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname === item.href || pathname?.startsWith(item.href + "/")
  }

  return (
    <>
      <aside className="flex h-screen w-64 flex-col border-r border-border/50 bg-gradient-to-b from-card to-background">
        {/* Logo Section */}
        <div className="flex h-16 items-center gap-3 border-b border-border/50 px-6">
          <div className="relative">
            <Image
              src="/notlinear-icon.png"
              alt="NotLinear"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div className="absolute -inset-1 rounded-lg bg-primary/20 blur-md -z-10" />
          </div>
          <span className="text-lg font-bold tracking-tight">NotLinear</span>
        </div>

        {/* Create Button */}
        <div className="p-4">
          <Button
            onClick={() => setShowCreateWorkspace(true)}
            className="w-full btn-premium text-primary-foreground font-semibold"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
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
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "nav-active text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  )}
                >
                  <Icon className={cn(
                    "h-[18px] w-[18px] transition-colors",
                    active ? "text-primary" : "group-hover:text-primary/70"
                  )} />
                  <span>{item.name}</span>
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary shadow-glow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Decorative Element */}
        <div className="px-4 py-3">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* User Section */}
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto py-2.5 px-3 hover:bg-surface-2 rounded-lg transition-all duration-200"
              >
                <div className="relative">
                  <Avatar className="h-9 w-9 ring-2 ring-border/50">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-amber-500/20 text-foreground font-semibold">
                      {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
                </div>
                <div className="flex flex-col items-start text-left min-w-0">
                  <span className="text-sm font-medium truncate max-w-[140px]">
                    {session?.user?.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {session?.user?.email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass">
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
      </aside>

      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
      />
    </>
  )
}
