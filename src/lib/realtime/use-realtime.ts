"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { RealtimeEvent, RealtimeEventType } from "./events"

interface UseRealtimeOptions {
  workspaceId: string
  onEvent?: (event: RealtimeEvent) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  // Filter to specific event types
  eventTypes?: RealtimeEventType[]
  // Filter to specific project
  projectId?: string
  // Enable/disable the connection
  enabled?: boolean
}

interface UseRealtimeReturn {
  isConnected: boolean
  connectionId: string | null
  onlineUsers: string[]
  lastEvent: RealtimeEvent | null
  reconnect: () => void
}

export function useRealtime({
  workspaceId,
  onEvent,
  onConnect,
  onDisconnect,
  onError,
  eventTypes,
  projectId,
  enabled = true,
}: UseRealtimeOptions): UseRealtimeReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionId, setConnectionId] = useState<string | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const lastEventIdRef = useRef<string | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptRef = useRef(0)

  // Stable callback refs to avoid reconnection on callback changes
  const onEventRef = useRef(onEvent)
  const onConnectRef = useRef(onConnect)
  const onDisconnectRef = useRef(onDisconnect)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onEventRef.current = onEvent
    onConnectRef.current = onConnect
    onDisconnectRef.current = onDisconnect
    onErrorRef.current = onError
  }, [onEvent, onConnect, onDisconnect, onError])

  const connect = useCallback(() => {
    if (!workspaceId || !enabled) return

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    // Build URL with optional lastEventId for reconnection
    let url = `/api/realtime?workspaceId=${encodeURIComponent(workspaceId)}`
    if (lastEventIdRef.current) {
      url += `&lastEventId=${encodeURIComponent(lastEventIdRef.current)}`
    }

    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      reconnectAttemptRef.current = 0
      onConnectRef.current?.()
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // Handle connection event
        if (data.type === "connected") {
          setConnectionId(data.connectionId)
          return
        }

        // Store last event ID for reconnection
        if (data.id) {
          lastEventIdRef.current = data.id
        }

        // Update online users from presence events
        if (data.type === "member_joined" || data.type === "member_left") {
          if (data.payload?.onlineUsers) {
            setOnlineUsers(data.payload.onlineUsers)
          }
        }

        // Filter by event types if specified
        if (eventTypes && !eventTypes.includes(data.type)) {
          return
        }

        // Filter by project if specified
        if (projectId && data.projectId && data.projectId !== projectId) {
          return
        }

        setLastEvent(data)
        onEventRef.current?.(data)
      } catch (err) {
        console.error("[SSE] Failed to parse event:", err)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      setConnectionId(null)
      onDisconnectRef.current?.()

      // Exponential backoff reconnection
      const attempt = reconnectAttemptRef.current
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000) // Max 30s

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptRef.current++
        connect()
      }, delay)

      if (attempt === 0) {
        onErrorRef.current?.(new Error("SSE connection lost, reconnecting..."))
      }
    }
  }, [workspaceId, enabled, eventTypes, projectId])

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    reconnectAttemptRef.current = 0
    lastEventIdRef.current = null
    connect()
  }, [connect])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [connect])

  return {
    isConnected,
    connectionId,
    onlineUsers,
    lastEvent,
    reconnect,
  }
}

// Convenience hook for issue updates only
export function useIssueUpdates(
  workspaceId: string,
  projectId?: string,
  onIssueChange?: (event: RealtimeEvent) => void
) {
  return useRealtime({
    workspaceId,
    projectId,
    eventTypes: ["issue_created", "issue_updated", "issue_deleted", "issue_moved"],
    onEvent: onIssueChange,
  })
}

// Convenience hook for comments
export function useCommentUpdates(
  workspaceId: string,
  issueId: string,
  onCommentChange?: (event: RealtimeEvent) => void
) {
  return useRealtime({
    workspaceId,
    eventTypes: ["comment_added", "comment_updated", "comment_deleted"],
    onEvent: (event) => {
      if (event.issueId === issueId) {
        onCommentChange?.(event)
      }
    },
  })
}

// Hook for online presence
export function usePresence(workspaceId: string) {
  const { isConnected, onlineUsers } = useRealtime({
    workspaceId,
    eventTypes: ["member_joined", "member_left"],
  })

  return { isConnected, onlineUsers, onlineCount: onlineUsers.length }
}

// Hook for dashboard - connects to multiple workspaces and triggers callback on activity
export function useDashboardRealtime(
  workspaceIds: string[],
  onActivityChange?: () => void
) {
  const [connectedCount, setConnectedCount] = useState(0)
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map())
  const onActivityChangeRef = useRef(onActivityChange)

  useEffect(() => {
    onActivityChangeRef.current = onActivityChange
  }, [onActivityChange])

  useEffect(() => {
    if (workspaceIds.length === 0) return

    const eventSources = eventSourcesRef.current

    // Connect to each workspace
    workspaceIds.forEach((workspaceId) => {
      if (eventSources.has(workspaceId)) return // already connected

      const url = `/api/realtime?workspaceId=${encodeURIComponent(workspaceId)}`
      const eventSource = new EventSource(url)

      eventSource.onopen = () => {
        setConnectedCount((c) => c + 1)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Skip connection events
          if (data.type === "connected") return

          // Trigger callback on any activity event
          const activityEvents: RealtimeEventType[] = [
            "issue_created",
            "issue_updated",
            "issue_deleted",
            "comment_added",
          ]

          if (activityEvents.includes(data.type)) {
            onActivityChangeRef.current?.()
          }
        } catch (err) {
          // ignore parse errors
        }
      }

      eventSource.onerror = () => {
        setConnectedCount((c) => Math.max(0, c - 1))
        // Remove and let it reconnect
        eventSources.delete(workspaceId)
        eventSource.close()

        // Reconnect after delay
        setTimeout(() => {
          // Re-trigger effect by checking if we should reconnect
          if (!eventSources.has(workspaceId)) {
            const newSource = new EventSource(url)
            eventSources.set(workspaceId, newSource)
            // Copy handlers
            newSource.onopen = eventSource.onopen
            newSource.onmessage = eventSource.onmessage
            newSource.onerror = eventSource.onerror
          }
        }, 3000)
      }

      eventSources.set(workspaceId, eventSource)
    })

    return () => {
      eventSources.forEach((es) => es.close())
      eventSources.clear()
      setConnectedCount(0)
    }
  }, [workspaceIds.join(",")]) // reconnect if workspace list changes

  return {
    isConnected: connectedCount > 0,
    connectedCount,
    totalWorkspaces: workspaceIds.length,
  }
}
