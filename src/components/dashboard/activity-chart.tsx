"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusDistribution } from "@/lib/actions/stats"
import { cn } from "@/lib/utils"

interface ActivityChartProps {
  distribution: StatusDistribution
}

// Status configuration with colors matching the app's aesthetic
const STATUS_CONFIG = [
  { key: "done", label: "Done", color: "rgb(52, 211, 153)", glowColor: "rgba(52, 211, 153, 0.4)" },
  { key: "inReview", label: "In Review", color: "rgb(251, 191, 36)", glowColor: "rgba(251, 191, 36, 0.4)" },
  { key: "inProgress", label: "In Progress", color: "rgb(249, 115, 22)", glowColor: "rgba(249, 115, 22, 0.5)" },
  { key: "todo", label: "To Do", color: "rgb(147, 197, 253)", glowColor: "rgba(147, 197, 253, 0.4)" },
  { key: "backlog", label: "Backlog", color: "rgb(148, 163, 184)", glowColor: "rgba(148, 163, 184, 0.3)" },
  { key: "cancelled", label: "Cancelled", color: "rgb(113, 113, 122)", glowColor: "rgba(113, 113, 122, 0.3)" },
] as const

// Generate smooth velocity curve points
function generateVelocityCurve(segments: number = 24): number[] {
  const points: number[] = []
  const baseHeight = 0.3
  const variance = 0.5

  for (let i = 0; i < segments; i++) {
    // Create organic wave pattern with multiple frequencies
    const wave1 = Math.sin((i / segments) * Math.PI * 2.5) * 0.3
    const wave2 = Math.sin((i / segments) * Math.PI * 4) * 0.15
    const wave3 = Math.cos((i / segments) * Math.PI * 1.5) * 0.2
    const noise = (Math.random() - 0.5) * 0.1

    const value = baseHeight + wave1 + wave2 + wave3 + noise
    points.push(Math.max(0.05, Math.min(0.95, value + variance)))
  }
  return points
}

// Create SVG path from points
function createSmoothPath(points: number[], width: number, height: number): string {
  if (points.length < 2) return ""

  const stepX = width / (points.length - 1)
  let path = `M 0 ${height - points[0] * height}`

  for (let i = 1; i < points.length; i++) {
    const x = i * stepX
    const y = height - points[i] * height
    const prevX = (i - 1) * stepX
    const prevY = height - points[i - 1] * height

    // Cubic bezier for smooth curves
    const cpX1 = prevX + stepX * 0.4
    const cpX2 = x - stepX * 0.4

    path += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`
  }

  return path
}

// Create area path (path + bottom closure)
function createAreaPath(points: number[], width: number, height: number): string {
  const linePath = createSmoothPath(points, width, height)
  return `${linePath} L ${width} ${height} L 0 ${height} Z`
}

export function ActivityChart({ distribution }: ActivityChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(chartRef, { once: true, margin: "-50px" })

  // Calculate percentages
  const segments = useMemo(() => {
    if (distribution.total === 0) return []

    return STATUS_CONFIG.map(config => ({
      ...config,
      value: distribution[config.key as keyof StatusDistribution] as number,
      percentage: ((distribution[config.key as keyof StatusDistribution] as number) / distribution.total) * 100,
    })).filter(s => s.value > 0)
  }, [distribution])

  // Generate velocity curve
  const velocityPoints = useMemo(() => generateVelocityCurve(28), [])

  const chartWidth = 320
  const chartHeight = 64

  const linePath = createSmoothPath(velocityPoints, chartWidth, chartHeight)
  const areaPath = createAreaPath(velocityPoints, chartWidth, chartHeight)

  if (distribution.total === 0) {
    return null
  }

  // Calculate cumulative positions for stacked bar
  let cumulativePercent = 0
  const barSegments = segments.map(seg => {
    const start = cumulativePercent
    cumulativePercent += seg.percentage
    return { ...seg, start }
  })

  return (
    <motion.div
      ref={chartRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: [0, 0, 0.2, 1] }}
    >
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card to-surface-2">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Issue Distribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {distribution.total} total issues across all workspaces
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>

          {/* Stacked Horizontal Bar */}
          <div className="relative h-10 rounded-xl overflow-hidden bg-surface-2/50 mb-5">
            {/* Ambient glow behind bar */}
            <div
              className="absolute inset-0 opacity-30 blur-xl"
              style={{
                background: `linear-gradient(90deg, ${segments.map((s, i) =>
                  `${s.color} ${(i / segments.length) * 100}%`
                ).join(", ")})`
              }}
            />

            {/* Bar segments */}
            <div className="relative h-full flex">
              {barSegments.map((segment, index) => (
                <motion.div
                  key={segment.key}
                  className="relative h-full overflow-hidden"
                  initial={{ width: 0, opacity: 0 }}
                  animate={isInView ? {
                    width: `${segment.percentage}%`,
                    opacity: 1
                  } : { width: 0, opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5 + index * 0.08,
                    ease: [0.19, 1, 0.22, 1],
                  }}
                  style={{
                    background: `linear-gradient(180deg, ${segment.color} 0%, ${segment.color}dd 100%)`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 0 20px ${segment.glowColor}`,
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 opacity-40"
                    initial={{ x: "-100%" }}
                    animate={isInView ? { x: "200%" } : { x: "-100%" }}
                    transition={{
                      duration: 1.5,
                      delay: 0.8 + index * 0.1,
                      ease: "easeInOut",
                    }}
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                      width: "50%",
                    }}
                  />

                  {/* Percentage label for larger segments */}
                  {segment.percentage > 12 && (
                    <motion.span
                      className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white/90 drop-shadow-sm"
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                    >
                      {Math.round(segment.percentage)}%
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
            {segments.map((segment, index) => (
              <motion.div
                key={segment.key}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                transition={{ delay: 0.8 + index * 0.05 }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: segment.color,
                    boxShadow: `0 0 6px ${segment.glowColor}`,
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {segment.label}
                  <span className="text-foreground font-medium ml-1">{segment.value}</span>
                </span>
              </motion.div>
            ))}
          </div>

          {/* Velocity Chart */}
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">Activity Trend</span>
              <span className="text-xs text-emerald-400 font-medium">+12% this week</span>
            </div>

            <div className="relative h-16 overflow-hidden rounded-lg">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between opacity-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-px bg-foreground" />
                ))}
              </div>

              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Gradient for area fill */}
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(249, 115, 22)" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="rgb(249, 115, 22)" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0" />
                  </linearGradient>

                  {/* Gradient for line */}
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(251, 191, 36)" />
                    <stop offset="50%" stopColor="rgb(249, 115, 22)" />
                    <stop offset="100%" stopColor="rgb(239, 68, 68)" />
                  </linearGradient>

                  {/* Glow filter */}
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Clip path for animation */}
                  <clipPath id="revealClip">
                    <motion.rect
                      x="0"
                      y="0"
                      height={chartHeight}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: chartWidth } : { width: 0 }}
                      transition={{ duration: 1.5, delay: 0.6, ease: [0.19, 1, 0.22, 1] }}
                    />
                  </clipPath>
                </defs>

                {/* Area fill */}
                <path
                  d={areaPath}
                  fill="url(#areaGradient)"
                  clipPath="url(#revealClip)"
                />

                {/* Main line with glow */}
                <g clipPath="url(#revealClip)">
                  <path
                    d={linePath}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />
                </g>

                {/* Animated dot at the end */}
                <motion.circle
                  cx={chartWidth}
                  cy={chartHeight - velocityPoints[velocityPoints.length - 1] * chartHeight}
                  r="4"
                  fill="rgb(249, 115, 22)"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ delay: 2, duration: 0.3, ease: "backOut" }}
                  filter="url(#glow)"
                />

                {/* Pulse ring around dot */}
                <motion.circle
                  cx={chartWidth}
                  cy={chartHeight - velocityPoints[velocityPoints.length - 1] * chartHeight}
                  r="4"
                  fill="none"
                  stroke="rgb(249, 115, 22)"
                  strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? {
                    opacity: [0, 0.6, 0],
                    scale: [1, 2.5, 2.5],
                  } : { opacity: 0 }}
                  transition={{
                    delay: 2.2,
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
