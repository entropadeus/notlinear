// Real-time event types and in-memory event bus
// This provides workspace-scoped event streaming for SSE

export type RealtimeEventType =
  | "issue_created"
  | "issue_updated"
  | "issue_deleted"
  | "issue_moved"
  | "comment_added"
  | "comment_updated"
  | "comment_deleted"
  | "member_joined"
  | "member_left"
  | "project_created"
  | "project_updated"
  | "project_deleted"

export interface RealtimeEvent {
  id: string
  type: RealtimeEventType
  workspaceId: string
  projectId?: string
  issueId?: string
  payload: Record<string, unknown>
  userId: string // Who triggered the event
  timestamp: number
}

export interface SSEConnection {
  id: string
  userId: string
  userName?: string
  userImage?: string | null
  workspaceId: string
  controller: ReadableStreamDefaultController<Uint8Array>
  createdAt: number
}

// Simple event ID generator
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// In-memory connection store
// In production, you'd use Redis pub/sub for multi-instance scaling
class RealtimeEventBus {
  private connections: Map<string, SSEConnection> = new Map()
  private eventBuffer: RealtimeEvent[] = []
  private maxBufferSize = 100 // Keep last 100 events for reconnection

  // Register a new SSE connection
  addConnection(connection: SSEConnection): void {
    this.connections.set(connection.id, connection)
    console.log(`[SSE] Connection added: ${connection.id} for workspace ${connection.workspaceId}`)
  }

  // Remove a connection (on disconnect)
  removeConnection(connectionId: string): void {
    const conn = this.connections.get(connectionId)
    if (conn) {
      this.connections.delete(connectionId)
      console.log(`[SSE] Connection removed: ${connectionId}`)
    }
  }

  // Get connection count for a workspace (useful for presence)
  getWorkspaceConnectionCount(workspaceId: string): number {
    let count = 0
    this.connections.forEach((conn) => {
      if (conn.workspaceId === workspaceId) count++
    })
    return count
  }

  // Get unique users in a workspace
  getWorkspaceUsers(workspaceId: string): string[] {
    const users = new Set<string>()
    this.connections.forEach((conn) => {
      if (conn.workspaceId === workspaceId) {
        users.add(conn.userId)
      }
    })
    return Array.from(users)
  }

  // Get unique users with details in a workspace
  getWorkspaceUsersWithDetails(workspaceId: string): { id: string; name: string; image: string | null }[] {
    const usersMap = new Map<string, { id: string; name: string; image: string | null }>()
    this.connections.forEach((conn) => {
      if (conn.workspaceId === workspaceId && conn.userName && !usersMap.has(conn.userId)) {
        usersMap.set(conn.userId, {
          id: conn.userId,
          name: conn.userName,
          image: conn.userImage || null,
        })
      }
    })
    return Array.from(usersMap.values())
  }

  // Broadcast event to all connections in a workspace
  broadcast(event: Omit<RealtimeEvent, "id" | "timestamp">): void {
    const fullEvent: RealtimeEvent = {
      ...event,
      id: generateEventId(),
      timestamp: Date.now(),
    }

    // Add to buffer for reconnection support
    this.eventBuffer.push(fullEvent)
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer.shift()
    }

    // Encode the event as SSE format
    const data = `data: ${JSON.stringify(fullEvent)}\n\n`
    const encoded = new TextEncoder().encode(data)

    // Send to all connections in the workspace
    let sentCount = 0
    this.connections.forEach((conn) => {
      if (conn.workspaceId === event.workspaceId) {
        try {
          conn.controller.enqueue(encoded)
          sentCount++
        } catch (error) {
          // Connection likely closed, remove it
          console.log(`[SSE] Failed to send to ${conn.id}, removing connection`)
          this.removeConnection(conn.id)
        }
      }
    })

    console.log(`[SSE] Broadcast ${event.type} to ${sentCount} connections in workspace ${event.workspaceId}`)
  }

  // Get events since a timestamp (for reconnection)
  getEventsSince(workspaceId: string, sinceTimestamp: number): RealtimeEvent[] {
    return this.eventBuffer.filter(
      (event) => event.workspaceId === workspaceId && event.timestamp > sinceTimestamp
    )
  }

  // Send a heartbeat ping to keep connections alive
  sendHeartbeat(): void {
    const ping = new TextEncoder().encode(`: heartbeat\n\n`)
    this.connections.forEach((conn) => {
      try {
        conn.controller.enqueue(ping)
      } catch {
        this.removeConnection(conn.id)
      }
    })
  }

  // Get stats for debugging
  getStats(): { totalConnections: number; workspaces: number; bufferedEvents: number } {
    const workspaces = new Set<string>()
    this.connections.forEach((conn) => workspaces.add(conn.workspaceId))
    return {
      totalConnections: this.connections.size,
      workspaces: workspaces.size,
      bufferedEvents: this.eventBuffer.length,
    }
  }
}

// Singleton instance
// Note: This only works for single-instance deployments
// For scaling, replace with Redis pub/sub
export const eventBus = new RealtimeEventBus()

// Start heartbeat interval (keeps connections alive through proxies)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    eventBus.sendHeartbeat()
  }, 30000) // Every 30 seconds
}

// Helper to create typed events
export function createIssueEvent(
  type: "issue_created" | "issue_updated" | "issue_deleted" | "issue_moved",
  workspaceId: string,
  projectId: string,
  issueId: string,
  userId: string,
  payload: Record<string, unknown>
): void {
  eventBus.broadcast({
    type,
    workspaceId,
    projectId,
    issueId,
    userId,
    payload,
  })
}

export function createCommentEvent(
  type: "comment_added" | "comment_updated" | "comment_deleted",
  workspaceId: string,
  issueId: string,
  userId: string,
  payload: Record<string, unknown>
): void {
  eventBus.broadcast({
    type,
    workspaceId,
    issueId,
    userId,
    payload,
  })
}

export function createMemberEvent(
  type: "member_joined" | "member_left",
  workspaceId: string,
  userId: string,
  payload: Record<string, unknown>
): void {
  eventBus.broadcast({
    type,
    workspaceId,
    userId,
    payload,
  })
}

export function createProjectEvent(
  type: "project_created" | "project_updated" | "project_deleted",
  workspaceId: string,
  projectId: string,
  userId: string,
  payload: Record<string, unknown>
): void {
  eventBus.broadcast({
    type,
    workspaceId,
    projectId,
    userId,
    payload,
  })
}
