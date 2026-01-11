"use client"

import { useState, useEffect, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const DIGIT_TRANSITION = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
}

function AnimatedDigit({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-[1.1em] w-[0.7em] overflow-hidden align-middle",
        className
      )}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={DIGIT_TRANSITION}
          className="absolute inset-0 flex items-center justify-center"
          style={{ willChange: "transform" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function TimeSeparator() {
  return (
    <span className="inline-flex w-[0.35em] items-center justify-center text-muted-foreground/70">
      :
    </span>
  )
}

function getTimeParts(date: Date) {
  const hours24 = date.getHours()
  const hours12 = hours24 % 12 || 12
  return {
    hours: String(hours12).padStart(2, "0"),
    minutes: String(date.getMinutes()).padStart(2, "0"),
    seconds: String(date.getSeconds()).padStart(2, "0"),
    period: hours24 >= 12 ? "PM" : "AM",
    showLeadingHour: hours12 >= 10,
  }
}

export const LiveDateTime = memo(function LiveDateTime() {
  // Start with null to avoid hydration mismatch - time only renders client-side
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    // Set initial time on mount (client-side only)
    setCurrentTime(new Date())

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTimeLabel = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Show placeholder during SSR to avoid hydration mismatch
  if (!currentTime) {
    return (
      <div className="flex flex-col items-end text-right">
        <div className="text-sm font-medium text-foreground h-5 w-48 bg-muted/30 rounded animate-pulse" />
        <div className="text-lg font-mono font-semibold h-6 w-32 bg-muted/20 rounded animate-pulse mt-1" />
      </div>
    )
  }

  const timeParts = getTimeParts(currentTime)

  return (
    <div className="flex flex-col items-end text-right">
      <div className="text-sm font-medium text-foreground">
        {formatDate(currentTime)}
      </div>
      <div
        className={cn(
          "text-lg font-mono font-semibold text-muted-foreground leading-none",
          "tabular-nums"
        )}
      >
        <span className="sr-only">{formatTimeLabel(currentTime)}</span>
        <span className="inline-flex items-center" aria-hidden="true">
          <AnimatedDigit
            value={timeParts.hours[0]}
            className={cn(!timeParts.showLeadingHour && "opacity-0")}
          />
          <AnimatedDigit value={timeParts.hours[1]} />
          <TimeSeparator />
          <AnimatedDigit value={timeParts.minutes[0]} />
          <AnimatedDigit value={timeParts.minutes[1]} />
          <TimeSeparator />
          <AnimatedDigit value={timeParts.seconds[0]} />
          <AnimatedDigit value={timeParts.seconds[1]} />
          <span className="ml-2 text-xs font-semibold tracking-[0.12em] text-muted-foreground/80">
            {timeParts.period}
          </span>
        </span>
      </div>
    </div>
  )
})
