"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const emojiCategories = {
  "Smileys": ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😎", "🤩", "🥳", "😏", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😬", "🤗", "🤭", "🤫", "🤥"],
  "Objects": ["📦", "📁", "📂", "🗂️", "📋", "📌", "📍", "📎", "🔗", "📐", "📏", "🔧", "🔨", "⚙️", "🔩", "🧰", "🛠️", "⚡", "🔥", "💡", "🔮", "💎", "🎯", "🎨", "🎭", "🎪", "🎬", "🎮", "🕹️", "🎲"],
  "Nature": ["🌟", "⭐", "🌙", "☀️", "🌈", "⚡", "🔥", "💧", "🌊", "🌸", "🌺", "🌻", "🌷", "🌹", "🌴", "🌲", "🌳", "🍀", "🍁", "🍂", "🌾", "🌵", "🌿", "☘️", "🪴", "🌱", "🌼", "💐", "🪻", "🪷"],
  "Animals": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🦋", "🐌"],
  "Food": ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🥔", "🍠", "🥐", "🍞", "🥖", "🧀"],
  "Activities": ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️"],
  "Travel": ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🛴", "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞", "🚝"],
  "Symbols": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "✨", "💫", "🌟", "⭐", "💥", "💢", "💦", "💨", "🕳️", "💣", "💬", "👁️‍🗨️"],
  "Flags": ["🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇩🇪", "🇫🇷", "🇯🇵", "🇰🇷", "🇨🇳", "🇮🇳", "🇧🇷", "🇲🇽", "🇪🇸", "🇮🇹", "🇷🇺", "🇳🇱", "🇸🇪", "🇳🇴", "🇩🇰", "🇫🇮", "🇵🇱", "🇨🇭"],
}

interface EmojiPickerProps {
  value?: string
  onChange: (emoji: string) => void
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("Objects")

  const handleSelect = (emoji: string) => {
    onChange(emoji)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal h-10"
        >
          {value ? (
            <span className="text-2xl mr-2">{value}</span>
          ) : (
            <span className="text-muted-foreground">Select an icon...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex border-b">
          <ScrollArea className="w-full">
            <div className="flex p-1 gap-1">
              {Object.keys(emojiCategories).map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-2 text-xs shrink-0",
                    activeCategory === category && "bg-accent"
                  )}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-8 gap-1 p-2">
            {emojiCategories[activeCategory as keyof typeof emojiCategories].map((emoji, index) => (
              <Button
                key={`${emoji}-${index}`}
                variant="ghost"
                className="h-9 w-9 p-0 text-xl hover:bg-accent"
                onClick={() => handleSelect(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </ScrollArea>
        {value && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => {
                onChange("")
                setOpen(false)
              }}
            >
              Clear selection
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

