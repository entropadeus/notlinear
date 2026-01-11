"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export interface KeyboardNavigationOptions {
  items: { id: string; identifier?: string }[]
  workspaceSlug: string
  onCreateNew?: () => void
  onStatusChange?: (id: string, status: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
  onAssignToMe?: (id: string) => void
  onChangePriority?: (id: string) => void
  onViewBoard?: () => void
  onViewList?: () => void
  onSearch?: () => void
  enabled?: boolean
}

const STATUS_KEYS: Record<string, string> = {
  "1": "backlog",
  "2": "todo",
  "3": "in_progress",
  "4": "in_review",
  "5": "done",
  "6": "cancelled",
}

export function useKeyboardNavigation({
  items,
  workspaceSlug,
  onCreateNew,
  onStatusChange,
  onAssignToMe,
  onChangePriority,
  onDelete,
  enabled = true,
}: KeyboardNavigationOptions) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()

  const selectedItem = selectedIndex >= 0 && selectedIndex < items.length
    ? items[selectedIndex]
    : null

  // Reset selection when items change
  useEffect(() => {
    if (selectedIndex >= items.length) {
      setSelectedIndex(items.length > 0 ? items.length - 1 : -1)
    }
  }, [items.length, selectedIndex])

  const navigateUp = useCallback(() => {
    if (items.length === 0) return
    setIsNavigating(true)
    setSelectedIndex((prev) => {
      if (prev <= 0) return items.length - 1 // Wrap to bottom
      return prev - 1
    })
  }, [items.length])

  const navigateDown = useCallback(() => {
    if (items.length === 0) return
    setIsNavigating(true)
    setSelectedIndex((prev) => {
      if (prev < 0 || prev >= items.length - 1) return 0 // Wrap to top or start
      return prev + 1
    })
  }, [items.length])

  const openSelected = useCallback(() => {
    if (!selectedItem) return
    const identifier = selectedItem.identifier || selectedItem.id
    router.push(`/w/${workspaceSlug}/issue/${identifier}`)
  }, [selectedItem, workspaceSlug, router])

  const clearSelection = useCallback(() => {
    setSelectedIndex(-1)
    setIsNavigating(false)
  }, [])

  const selectIndex = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setSelectedIndex(index)
      setIsNavigating(true)
    }
  }, [items.length])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest("[role='dialog']") ||
        target.closest("[data-radix-popper-content-wrapper]")
      ) {
        return
      }

      // Don't interfere with command palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        return
      }

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault()
          navigateDown()
          break

        case "k":
        case "ArrowUp":
          e.preventDefault()
          navigateUp()
          break

        case "Enter":
          if (selectedItem) {
            e.preventDefault()
            openSelected()
          }
          break

        case "Escape":
          e.preventDefault()
          clearSelection()
          break

        case "c":
          if (onCreateNew && !e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            onCreateNew()
          }
          break

        case "a":
          if (selectedItem && onAssignToMe && !e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            onAssignToMe(selectedItem.id)
          }
          break

        case "p":
          if (selectedItem && onChangePriority && !e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            onChangePriority(selectedItem.id)
          }
          break

        case "Delete":
        case "Backspace":
          if (selectedItem && onDelete && !e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            onDelete(selectedItem.id)
          }
          break

        case "g":
          // 'g' followed by another key for go-to commands
          // We'll handle this in a future iteration
          break

        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
          if (selectedItem && onStatusChange) {
            e.preventDefault()
            const newStatus = STATUS_KEYS[e.key]
            onStatusChange(selectedItem.id, newStatus)
          }
          break

        case "Home":
          e.preventDefault()
          if (items.length > 0) {
            setSelectedIndex(0)
            setIsNavigating(true)
          }
          break

        case "End":
          e.preventDefault()
          if (items.length > 0) {
            setSelectedIndex(items.length - 1)
            setIsNavigating(true)
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [
    enabled,
    navigateDown,
    navigateUp,
    openSelected,
    clearSelection,
    selectedItem,
    onCreateNew,
    onStatusChange,
    onAssignToMe,
    onChangePriority,
    onDelete,
    items.length,
  ])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && isNavigating) {
      const element = document.querySelector(`[data-issue-index="${selectedIndex}"]`)
      element?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [selectedIndex, isNavigating])

  return {
    selectedIndex,
    selectedItem,
    isNavigating,
    selectIndex,
    clearSelection,
    navigateUp,
    navigateDown,
    openSelected,
  }
}
