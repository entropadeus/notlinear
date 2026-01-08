"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"

// ============================================
// LOGO LOADER - Pure CSS, instant display
// ============================================

// Full-page logo loader with breathing glow effect
// Uses CSS animations for instant display (no JS hydration wait)
export function LogoLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full w-full min-h-[400px] items-center justify-center", className)}>
      <div className="relative flex flex-col items-center gap-5">
        {/* Logo with breathing glow */}
        <div className="relative">
          <div className="logo-glow rounded-2xl">
            <Image
              src="/NotLinear-icon.png"
              alt="NotLinear"
              width={56}
              height={56}
              className="rounded-xl"
              priority
            />
          </div>
          {/* Ambient blur behind logo */}
          <div className="absolute -inset-3 rounded-3xl bg-primary/20 blur-xl -z-10 logo-pulse" />
        </div>

        {/* Loading dots - pure CSS */}
        <div className="flex gap-1.5">
          <div className="loading-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
          <div className="loading-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
          <div className="loading-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}

// Compact logo loader for inline use
export function LogoLoaderCompact({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <div className="logo-glow-subtle rounded-lg">
        <Image
          src="/NotLinear-icon.png"
          alt="Loading"
          width={32}
          height={32}
          className="rounded-lg"
          priority
        />
      </div>
      <div className="flex gap-1">
        <div className="loading-dot h-1 w-1 rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
        <div className="loading-dot h-1 w-1 rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
        <div className="loading-dot h-1 w-1 rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  )
}

// ============================================
// MOTION-BASED LOADERS - For interactive use
// ============================================

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
