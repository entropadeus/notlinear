// Real-time collaboration utilities
// Server-side exports
export {
  eventBus,
  createIssueEvent,
  createCommentEvent,
  createMemberEvent,
  createProjectEvent,
  type RealtimeEvent,
  type RealtimeEventType,
  type SSEConnection,
} from "./events"

// Client-side exports (use-realtime is "use client" so import directly where needed)
// import { useRealtime, useIssueUpdates, useCommentUpdates, usePresence } from "@/lib/realtime/use-realtime"
