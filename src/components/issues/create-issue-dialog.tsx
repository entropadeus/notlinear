"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { createIssue } from "@/lib/actions/issues"
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/filters/types"
import { UserCircle } from "lucide-react"

interface Member {
  id: string
  name: string
  email: string
  image: string | null
}

interface CreateIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  members?: Member[]
}

export function CreateIssueDialog({ open, onOpenChange, projectId, members = [] }: CreateIssueDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("backlog")
  const [priority, setPriority] = useState("none")
  const [assigneeId, setAssigneeId] = useState<string>("unassigned")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Issue title is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await createIssue(projectId, title, description || undefined, status, priority, assigneeId === "unassigned" ? undefined : assigneeId)

      toast({
        title: "Success",
        description: "Issue created successfully",
      })

      onOpenChange(false)
      setTitle("")
      setDescription("")
      setStatus("backlog")
      setPriority("none")
      setAssigneeId("unassigned")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create issue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Issue</DialogTitle>
            <DialogDescription>
              Add a new issue to this project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Issue title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue... (supports Markdown)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus} disabled={isLoading}>
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
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority} disabled={isLoading}>
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
            </div>
            {members.length > 0 && (
              <div className="grid gap-2">
                <Label>Assignee</Label>
                <Select value={assigneeId} onValueChange={setAssigneeId} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned">
                      {assigneeId && assigneeId !== "unassigned" ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={members.find(m => m.id === assigneeId)?.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {members.find(m => m.id === assigneeId)?.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span>{members.find(m => m.id === assigneeId)?.name}</span>
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
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "Creating..." : "Create Issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

