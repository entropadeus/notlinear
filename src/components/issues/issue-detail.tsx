"use client"

import { Issue } from "@/lib/actions/issues"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { formatRelativeTime } from "@/lib/utils"
import { ArrowLeft, UserCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { updateIssue } from "@/lib/actions/issues"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { CommentSection } from "./comment-section"
import { RevisionTimeline } from "./revision-timeline"
import { type Revision } from "@/lib/actions/revisions"
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/filters/types"

interface Comment {
  id: string
  content: string
  authorId: string
  createdAt: Date
  updatedAt: Date
  author?: {
    name: string | null
    image: string | null
  }
}

interface Member {
  id: string
  name: string
  email: string
  image: string | null
}

interface IssueDetailProps {
  issue: Issue
  workspaceSlug: string
  initialComments?: Comment[]
  initialRevisions?: Revision[]
  members?: Member[]
}

export function IssueDetail({ issue, workspaceSlug, initialComments = [], initialRevisions = [], members = [] }: IssueDetailProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [status, setStatus] = useState(issue.status)
  const [priority, setPriority] = useState(issue.priority)
  const [assigneeId, setAssigneeId] = useState(issue.assigneeId || "unassigned")
  const [isUpdating, setIsUpdating] = useState(false)

  const currentAssignee = assigneeId !== "unassigned" ? members.find(m => m.id === assigneeId) : null

  useEffect(() => {
    setStatus(issue.status)
    setPriority(issue.priority)
    setAssigneeId(issue.assigneeId || "unassigned")
  }, [issue.status, issue.priority, issue.assigneeId])

  // Generic field update handler to reduce repetition
  async function handleFieldUpdate<T extends string>(
    field: "status" | "priority" | "assigneeId",
    newValue: T,
    setter: (value: T) => void,
    errorMessage: string
  ): Promise<void> {
    setIsUpdating(true)
    try {
      const updateData = field === "assigneeId"
        ? { assigneeId: newValue === "unassigned" ? null : newValue }
        : { [field]: newValue }
      await updateIssue(issue.id, updateData)
      setter(newValue)
      router.refresh()
    } catch {
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusChange = (newStatus: string) =>
    handleFieldUpdate("status", newStatus, setStatus, "Failed to update status")

  const handlePriorityChange = (newPriority: string) =>
    handleFieldUpdate("priority", newPriority, setPriority, "Failed to update priority")

  const handleAssigneeChange = (newAssigneeId: string) =>
    handleFieldUpdate("assigneeId", newAssigneeId, setAssigneeId, "Failed to update assignee")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-4xl space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link href={`/w/${workspaceSlug}/projects/${issue.projectId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{issue.title}</h1>
          <p className="text-muted-foreground">{issue.identifier}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.description ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{issue.description}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground">No description provided</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentSection issueId={issue.id} initialComments={initialComments} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={handlePriorityChange} disabled={isUpdating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Assignee</label>
                {members.length > 0 ? (
                  <Select value={assigneeId} onValueChange={handleAssigneeChange} disabled={isUpdating}>
                    <SelectTrigger>
                      <SelectValue>
                        {currentAssignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={currentAssignee.image || undefined} />
                              <AvatarFallback className="text-xs">
                                {currentAssignee.name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{currentAssignee.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <UserCircle className="h-5 w-5" />
                            <span>Unassigned</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-5 w-5 text-muted-foreground" />
                          <span>Unassigned</span>
                        </div>
                      </SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={member.image || undefined} />
                              <AvatarFallback className="text-xs">
                                {member.name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {currentAssignee ? currentAssignee.name : "Unassigned"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Created</label>
                <p className="text-sm text-muted-foreground">
                  {formatRelativeTime(issue.createdAt)}
                </p>
              </div>

              {issue.updatedAt && (
                <div>
                  <label className="text-sm font-medium">Updated</label>
                  <p className="text-sm text-muted-foreground">
                    {formatRelativeTime(issue.updatedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <RevisionTimeline issueId={issue.id} initialRevisions={initialRevisions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

