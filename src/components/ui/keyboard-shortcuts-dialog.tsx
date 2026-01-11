"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown, Keyboard, Search, Plus, CircleDot, Flag, Users, ArrowLeft, X, Check } from "lucide-react"

interface KeyboardShortcut {
  key: string
  description: string
  icon?: React.ReactNode
}

interface ShortcutCategory {
  title: string
  shortcuts: KeyboardShortcut[]
}

const categories: ShortcutCategory[] = [
  {
    title: "Navigation",
    shortcuts: [
      { key: "j / ↓", description: "Move down", icon: <ArrowDown className="h-4 w-4" /> },
      { key: "k / ↑", description: "Move up", icon: <ArrowUp className="h-4 w-4" /> },
      { key: "Enter", description: "Open selected issue" },
      { key: "Escape", description: "Clear selection / Close dialogs", icon: <X className="h-4 w-4" /> },
      { key: "?", description: "Show keyboard shortcuts", icon: <Keyboard className="h-4 w-4" /> },
    ],
  },
  {
    title: "Issue Actions",
    shortcuts: [
      { key: "C", description: "Create new issue", icon: <Plus className="h-4 w-4" /> },
      { key: "1-6", description: "Set status", icon: <CircleDot className="h-4 w-4" /> },
      { key: "Delete", description: "Delete selected issue" },
    ],
  },
  {
    title: "Global",
    shortcuts: [
      { key: "⌘K / Ctrl+K", description: "Open command palette", icon: <Search className="h-4 w-4" /> },
      { key: "A", description: "Assign to me", icon: <Users className="h-4 w-4" /> },
      { key: "P", description: "Change priority", icon: <Flag className="h-4 w-4" /> },
    ],
  },
]

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg">?</kbd> anytime to open this dialog
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {categories.map((category, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {category.title}
              </h3>
              <div className="grid gap-2">
                {category.shortcuts.map((shortcut, shortcutIndex) => (
                  <div
                    key={shortcutIndex}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-surface-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {shortcut.icon && (
                        <span className="text-muted-foreground">
                          {shortcut.icon}
                        </span>
                      )}
                      <span className="text-sm font-medium">{shortcut.description}</span>
                    </div>
                    <kbd className="px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg shadow-sm">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4 border-t">
          <Check className="h-4 w-4 text-emerald-500" />
          <span>Press any key to close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
