"use client"

import { Issue } from "@/lib/actions/issues"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { formatRelativeTime } from "@/lib/utils"
import { Circle, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { updateIssue } from "@/lib/actions/issues"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { CommentSection } from "./comment-section"
import { RevisionTimeline } from "./revision-timeline"
import { type Revision } from "@/lib/actions/revisions"

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

interface IssueDetailProps {
  issue: Issue
  workspaceSlug: string
  initialComments?: Comment[]
  initialRevisions?: Revision[]
}

const statusOptions = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
]

const priorityOptions = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

export function IssueDetail({ issue, workspaceSlug, initialComments = [], initialRevisions = [] }: IssueDetailProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [status, setStatus] = useState(issue.status)
  const [priority, setPriority] = useState(issue.priority)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await updateIssue(issue.id, { status: newStatus })
      setStatus(newStatus)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    setIsUpdating(true)
    try {
      await updateIssue(issue.id, { priority: newPriority })
      setPriority(newPriority)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update priority",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

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
                    {statusOptions.map((option) => (
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
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

