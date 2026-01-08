import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { workspaceMembers } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { eventBus, type SSEConnection } from "@/lib/realtime/events"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Generate connection ID
function generateConnectionId(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export async function GET(request: Request) {
  // Authenticate the user
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Get workspace from query params
  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get("workspaceId")
  const lastEventId = searchParams.get("lastEventId")

  if (!workspaceId) {
    return new Response("Missing workspaceId parameter", { status: 400 })
  }

  // Verify user has access to this workspace
  const [member] = await db
    .select({ id: workspaceMembers.id })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      )
    )
    .limit(1)

  if (!member) {
    return new Response("Access denied to workspace", { status: 403 })
  }

  // Create SSE stream
  const connectionId = generateConnectionId()
  let connection: SSEConnection | null = null

  const stream = new ReadableStream({
    start(controller) {
      // Register the connection
      connection = {
        id: connectionId,
        userId: session.user!.id!,
        workspaceId,
        controller,
        createdAt: Date.now(),
      }
      eventBus.addConnection(connection)

      // Send initial connection event
      const initEvent = JSON.stringify({
        type: "connected",
        connectionId,
        workspaceId,
        timestamp: Date.now(),
      })
      controller.enqueue(new TextEncoder().encode(`data: ${initEvent}\n\n`))

      // If client provided lastEventId, send any missed events
      if (lastEventId) {
        const lastTimestamp = parseInt(lastEventId.split("-")[0], 10)
        if (!isNaN(lastTimestamp)) {
          const missedEvents = eventBus.getEventsSince(workspaceId, lastTimestamp)
          missedEvents.forEach((event) => {
            const data = `data: ${JSON.stringify(event)}\n\n`
            controller.enqueue(new TextEncoder().encode(data))
          })
        }
      }

      // Broadcast presence update
      eventBus.broadcast({
        type: "member_joined",
        workspaceId,
        userId: session.user!.id!,
        payload: {
          userName: session.user!.name,
          userImage: session.user!.image,
          connectionId,
          onlineUsers: eventBus.getWorkspaceUsers(workspaceId),
        },
      })
    },

    cancel() {
      // Clean up on disconnect
      if (connection) {
        eventBus.removeConnection(connection.id)

        // Broadcast presence update
        eventBus.broadcast({
          type: "member_left",
          workspaceId,
          userId: session.user!.id!,
          payload: {
            connectionId,
            onlineUsers: eventBus.getWorkspaceUsers(workspaceId),
          },
        })
      }
    },
  })

  // Return SSE response with proper headers
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  })
}
