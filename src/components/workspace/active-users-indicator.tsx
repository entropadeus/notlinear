"use client"

import { useEffect, useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface UserPresence {
  id: string
  name: string
  image: string | null
}

interface ActiveUsersIndicatorProps {
  workspaceId: string
  className?: string
}

export function ActiveUsersIndicator({ workspaceId, className }: ActiveUsersIndicatorProps) {
  const [users, setUsers] = useState<Map<string, UserPresence>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const url = `/api/realtime?workspaceId=${encodeURIComponent(workspaceId)}`
    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // Handle initial connection with existing users
        if (data.type === "connected" && data.onlineUsers) {
          const initialUsers = new Map<string, UserPresence>()
          data.onlineUsers.forEach((user: { id: string; name: string; image: string | null }) => {
            initialUsers.set(user.id, user)
          })
          setUsers(initialUsers)
          return
        }

        // Handle member joined
        if (data.type === "member_joined" && data.payload) {
          const { userName, userImage } = data.payload as { userName?: string; userImage?: string }
          if (userName) {
            setUsers((prev) => {
              const next = new Map(prev)
              next.set(data.userId, {
                id: data.userId,
                name: userName,
                image: userImage || null,
              })
              return next
            })
          }
        }

        // Handle member left
        if (data.type === "member_left") {
          setUsers((prev) => {
            const next = new Map(prev)
            next.delete(data.userId)
            return next
          })
        }
      } catch (err) {
        // ignore parse errors
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
    }

    return () => {
      eventSource.close()
    }
  }, [workspaceId])

  const activeUsers = Array.from(users.values())
  const displayUsers = activeUsers.slice(0, 5)
  const remainingCount = activeUsers.length - 5

  if (!isConnected || activeUsers.length === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center", className)}>
            <div className="flex -space-x-2">
              <AnimatePresence mode="popLayout">
                {displayUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.5, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, x: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Avatar className="h-8 w-8 border-2 border-background ring-2 ring-emerald-500/50">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                ))}
              </AnimatePresence>
              {remainingCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="h-8 w-8 rounded-full border-2 border-background bg-surface-2 flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      +{remainingCount}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
            <div className="ml-2 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs text-muted-foreground">
                {activeUsers.length} online
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="glass">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">Active now</p>
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.name}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
