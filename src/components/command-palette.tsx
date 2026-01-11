"use client"

import { useState, useEffect } from "react"
import { Command } from "cmdk"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Search, FileText, FolderKanban, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="overflow-hidden p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-1 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Command.Input placeholder="Type a command or search..." className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
                <Command.List className="max-h-[300px] overflow-y-auto p-1">
                  <Command.Empty className="py-6 text-center text-sm">
                    No results found.
                  </Command.Empty>
                  <Command.Group heading="Navigation">
                    <Command.Item onSelect={() => runCommand(() => router.push("/dashboard"))}>
                      <FileText className="mr-2 h-4 w-4" />
                      Dashboard
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => router.push("/dashboard/projects"))}>
                      <FolderKanban className="mr-2 h-4 w-4" />
                      Projects
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Command.Item>
                  </Command.Group>
                </Command.List>
              </Command>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

