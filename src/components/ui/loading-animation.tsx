"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Inline loading spinner for buttons
export function InlineLoader({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("h-4 w-4 rounded-full border-2 border-current border-t-transparent", className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
}

// Simple dots loader
export function DotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  )
}
