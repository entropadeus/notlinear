"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { updateWorkspace } from "@/lib/actions/workspaces"

interface EditWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: {
    id: string
    name: string
    slug: string
    description: string | null
  }
}

export function EditWorkspaceDialog({ open, onOpenChange, workspace }: EditWorkspaceDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState(workspace.name)
  const [description, setDescription] = useState(workspace.description || "")
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when workspace changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(workspace.name)
      setDescription(workspace.description || "")
    }
  }, [open, workspace])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Workspace name is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await updateWorkspace(workspace.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      })

      toast({
        title: "Success",
        description: "Workspace updated successfully",
      })

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update workspace",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const hasChanges =
    name !== workspace.name ||
    description !== (workspace.description || "")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>
              Update your workspace details. The URL slug cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My Workspace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                URL: /w/{workspace.slug}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this workspace for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim() || !hasChanges}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
