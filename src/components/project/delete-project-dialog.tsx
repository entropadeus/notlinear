"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteProject, getProjectDeletionStats } from "@/lib/actions/projects"
import { motion, AnimatePresence } from "framer-motion"
import { Skull, AlertTriangle, Trash2, Heart, Loader2, Flame } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  projectIcon?: string | null
  workspaceSlug: string
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  projectIcon,
  workspaceSlug,
}: DeleteProjectDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [stats, setStats] = useState<{ issueCount: number; labelCount: number; commentCount: number } | null>(null)
  const [stage, setStage] = useState<"warning" | "confirm" | "farewell">("warning")

  const confirmPhrase = projectName.toLowerCase().replace(/\s+/g, "-")
  const isConfirmed = confirmText === confirmPhrase

  useEffect(() => {
    if (open) {
      setStage("warning")
      setConfirmText("")
      getProjectDeletionStats(projectId).then(setStats)
    }
  }, [open, projectId])

  const handleDelete = async () => {
    if (!isConfirmed) return

    setStage("farewell")
    
    // Give them a moment to say goodbye
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    setIsDeleting(true)
    try {
      await deleteProject(projectId)
      toast({
        title: "Project deleted",
        description: `${projectName} has been permanently deleted.`,
      })
      onOpenChange(false)
      router.push(`/w/${workspaceSlug}`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
      setStage("confirm")
    } finally {
      setIsDeleting(false)
    }
  }

  const totalItemsLost = stats ? stats.issueCount + stats.labelCount + stats.commentCount : 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg overflow-hidden">
        <AnimatePresence mode="wait">
          {stage === "warning" && (
            <motion.div
              key="warning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AlertDialogHeader className="text-center sm:text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/30"
                >
                  <AlertTriangle className="h-10 w-10 text-red-500" />
                </motion.div>
                <AlertDialogTitle className="text-2xl">
                  Hold on there...
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base pt-2">
                  You're about to delete <span className="font-semibold text-foreground">{projectIcon} {projectName}</span>.
                  <br />
                  This is a <span className="text-red-500 font-medium">permanent</span> action.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {stats && totalItemsLost > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="my-6 p-4 rounded-lg bg-red-500/5 border border-red-500/20"
                >
                  <p className="text-sm text-center text-muted-foreground mb-3">
                    The following will be lost forever:
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-2xl font-bold text-red-500">{stats.issueCount}</p>
                      <p className="text-xs text-muted-foreground">issues</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-2xl font-bold text-orange-500">{stats.commentCount}</p>
                      <p className="text-xs text-muted-foreground">comments</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="text-2xl font-bold text-yellow-500">{stats.labelCount}</p>
                      <p className="text-xs text-muted-foreground">labels</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              <AlertDialogFooter className="sm:justify-center gap-2 pt-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  <Heart className="mr-2 h-4 w-4 text-pink-500" />
                  Keep it safe
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setStage("confirm")}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <Skull className="mr-2 h-4 w-4" />
                  I understand, continue
                </Button>
              </AlertDialogFooter>
            </motion.div>
          )}

          {stage === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AlertDialogHeader className="text-center sm:text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-600/30 to-red-900/30 border-2 border-red-600/50"
                >
                  <Trash2 className="h-10 w-10 text-red-500" />
                </motion.div>
                <AlertDialogTitle className="text-2xl">
                  Point of no return
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base pt-2">
                  Type <code className="px-2 py-1 rounded bg-muted font-mono text-sm text-red-500">{confirmPhrase}</code> to confirm deletion.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="my-6 space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-muted-foreground">
                    Confirm project name
                  </Label>
                  <Input
                    id="confirm"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={confirmPhrase}
                    className={`font-mono ${isConfirmed ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                {isConfirmed && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-center text-red-500"
                  >
                    ⚠️ This will permanently destroy all project data
                  </motion.p>
                )}
              </motion.div>

              <AlertDialogFooter className="sm:justify-center gap-2">
                <Button variant="outline" onClick={() => setStage("warning")}>
                  Go back
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={!isConfirmed || isDeleting}
                  className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:opacity-50"
                >
                  <Flame className="mr-2 h-4 w-4" />
                  Delete forever
                </Button>
              </AlertDialogFooter>
            </motion.div>
          )}

          {stage === "farewell" && (
            <motion.div
              key="farewell"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8"
            >
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 0], opacity: [1, 1, 0] }}
                  transition={{ duration: 2, times: [0, 0.3, 1] }}
                  className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20"
                >
                  <span className="text-5xl">{projectIcon || "📁"}</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <h3 className="text-xl font-semibold text-muted-foreground">
                    Goodbye, {projectName}
                  </h3>
                  <p className="text-sm text-muted-foreground/70 italic">
                    "The work you did here mattered."
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="flex items-center justify-center gap-2 text-muted-foreground"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Deleting...</span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AlertDialogContent>
    </AlertDialog>
  )
}

