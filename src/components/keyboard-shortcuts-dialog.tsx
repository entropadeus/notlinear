"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Keyboard } from "lucide-react"
import { cn } from "@/lib/utils"

interface ShortcutGroup {
  title: string
  shortcuts: { keys: string[]; description: string }[]
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["j", "↓"], description: "Move down" },
      { keys: ["k", "↑"], description: "Move up" },
      { keys: ["Enter"], description: "Open issue" },
      { keys: ["Esc"], description: "Clear selection" },
      { keys: ["Home"], description: "Go to first item" },
      { keys: ["End"], description: "Go to last item" },
    ],
  },
   {
     title: "Actions",
     shortcuts: [
       { keys: ["c"], description: "Create new issue" },
       { keys: ["⌘", "K"], description: "Open command palette" },
     ],
   },
   {
     title: "Issue Actions (with item selected)",
     shortcuts: [
       { keys: ["A"], description: "Assign to me" },
       { keys: ["P"], description: "Change priority" },
       { keys: ["Delete"], description: "Delete issue" },
     ],
   },
  {
    title: "Quick Status (with item selected)",
    shortcuts: [
      { keys: ["1"], description: "Set to Backlog" },
      { keys: ["2"], description: "Set to Todo" },
      { keys: ["3"], description: "Set to In Progress" },
      { keys: ["4"], description: "Set to In Review" },
      { keys: ["5"], description: "Set to Done" },
      { keys: ["6"], description: "Set to Cancelled" },
    ],
  },
  {
    title: "Help",
    shortcuts: [
      { keys: ["?"], description: "Show keyboard shortcuts" },
    ],
  },
]

function KeyboardKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className={cn(
      "inline-flex items-center justify-center min-w-[24px] h-6 px-1.5",
      "text-xs font-medium font-mono",
      "bg-surface-2 border border-border/50 rounded-md",
      "shadow-[0_1px_0_1px_hsl(var(--border)/0.5)]",
      "text-muted-foreground"
    )}>
      {children}
    </kbd>
  )
}

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <AnimatePresence>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl glass">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center">
                  <Keyboard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-xl">Keyboard Shortcuts</span>
                  <p className="text-sm text-muted-foreground font-normal mt-0.5">
                    Navigate like a pro
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 pt-2">
              {SHORTCUT_GROUPS.map((group, groupIndex) => (
                <motion.div
                  key={group.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.05 }}
                  className={cn(
                    group.title === "Quick Status (with item selected)" && "col-span-2"
                  )}
                >
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    {group.title}
                  </h3>
                  <div className={cn(
                    "space-y-2",
                    group.title === "Quick Status (with item selected)" && "grid grid-cols-2 gap-2 space-y-0"
                  )}>
                    {group.shortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-surface-2/50 transition-colors"
                      >
                        <span className="text-sm text-muted-foreground">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <span key={keyIndex} className="flex items-center gap-1">
                              <KeyboardKey>{key}</KeyboardKey>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-muted-foreground/50 text-xs mx-0.5">/</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                Press <KeyboardKey>?</KeyboardKey> anytime to toggle this dialog
              </p>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  )
}
