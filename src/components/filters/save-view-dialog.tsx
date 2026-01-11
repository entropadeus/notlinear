"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Bookmark, Users } from "lucide-react"
import { motion } from "framer-motion"
import { IssueFilters, countActiveFilters } from "@/lib/filters/types"
import { createView } from "@/lib/actions/filters"

interface SaveViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: IssueFilters
  workspaceId: string
  projectId?: string
  onSaved?: () => void
}

const VIEW_ICONS = ["📋", "🎯", "🔥", "⭐", "🚀", "💡", "🐛", "✅", "📌", "🏷️"]

export function SaveViewDialog({
  open,
  onOpenChange,
  filters,
  workspaceId,
  projectId,
  onSaved,
}: SaveViewDialogProps) {
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("📋")
  const [isShared, setIsShared] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const activeFilters = countActiveFilters(filters)

  const handleSave = () => {
    if (!name.trim()) {
      setError("Name is required")
      return
    }

    setError("")
    startTransition(async () => {
      const result = await createView({
        name: name.trim(),
        filters,
        workspaceId,
        projectId,
        icon,
        isShared,
      })

      if (result) {
        onOpenChange(false)
        setName("")
        setIcon("📋")
        setIsShared(false)
        onSaved?.()
      } else {
        setError("Failed to save view")
      }
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    setName("")
    setIcon("📋")
    setIsShared(false)
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center">
              <Bookmark className="h-5 w-5 text-primary" />
            </div>
            Save View
          </DialogTitle>
          <DialogDescription>
            Save your current filters as a view for quick access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* View name */}
          <div className="space-y-2">
            <Label htmlFor="view-name">Name</Label>
            <Input
              id="view-name"
              placeholder="My Issues, Active Bugs, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-surface-1 border-border/50"
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Icon picker */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {VIEW_ICONS.map((emoji) => (
                <motion.button
                  key={emoji}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIcon(emoji)}
                  className={`h-10 w-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    icon === emoji
                      ? "bg-primary/20 ring-2 ring-primary"
                      : "bg-surface-2 hover:bg-surface-3"
                  }`}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Shared toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="shared" className="font-medium">
                  Share with team
                </Label>
                <p className="text-sm text-muted-foreground">
                  Make this view visible to all workspace members
                </p>
              </div>
            </div>
            <Switch
              id="shared"
              checked={isShared}
              onCheckedChange={setIsShared}
            />
          </div>

          {/* Filter summary */}
          <div className="rounded-lg bg-surface-2 p-4">
            <p className="text-sm text-muted-foreground">
              This view will include{" "}
              <span className="font-medium text-foreground">
                {activeFilters} active filter{activeFilters !== 1 ? "s" : ""}
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !name.trim()}
            className="btn-premium text-primary-foreground"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save View
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
