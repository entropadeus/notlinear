"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { ActivityHeatmapData, HeatmapDataPoint } from "@/lib/actions/stats"

interface ActivityHeatmapProps {
  data: ActivityHeatmapData
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Color levels matching GitHub's style but with our orange/primary theme
const LEVEL_COLORS = {
  0: "bg-surface-2 dark:bg-zinc-800/50",
  1: "bg-orange-500/20 dark:bg-orange-500/20",
  2: "bg-orange-500/40 dark:bg-orange-500/40",
  3: "bg-orange-500/70 dark:bg-orange-500/70",
  4: "bg-orange-500 dark:bg-orange-500",
}

interface WeekData {
  days: (HeatmapDataPoint | null)[]
  weekStart: Date
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Organize data into weeks (columns) and days (rows)
  const { weeks, monthLabels } = useMemo(() => {
    if (!data.data || data.data.length === 0) {
      return { weeks: [], monthLabels: [] }
    }

    // Create a map for quick lookup
    const dataMap = new Map(data.data.map(d => [d.date, d]))

    // Find the date range - use UTC dates to match server/database timezone
    const today = new Date()
    const endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    const startDate = new Date(endDate)
    startDate.setUTCDate(endDate.getUTCDate() - 364)

    // Adjust start to the beginning of the week (Sunday)
    const startDayOfWeek = startDate.getUTCDay()
    startDate.setUTCDate(startDate.getUTCDate() - startDayOfWeek)

    const weeks: WeekData[] = []
    const monthLabels: { month: string; weekIndex: number }[] = []
    let currentDate = new Date(startDate)
    let lastMonth = -1

    while (currentDate <= endDate) {
      const weekDays: (HeatmapDataPoint | null)[] = []
      const weekStart = new Date(currentDate)

      // Check if we need a month label
      if (currentDate.getUTCMonth() !== lastMonth) {
        monthLabels.push({
          month: MONTHS[currentDate.getUTCMonth()],
          weekIndex: weeks.length,
        })
        lastMonth = currentDate.getUTCMonth()
      }

      for (let day = 0; day < 7; day++) {
        // Use UTC date formatting to match server/database timezone
        const dateStr = currentDate.getUTCFullYear() + '-' +
          String(currentDate.getUTCMonth() + 1).padStart(2, '0') + '-' +
          String(currentDate.getUTCDate()).padStart(2, '0')
        const dayData = dataMap.get(dateStr)

        // Only include days within our actual range
        if (currentDate <= endDate && currentDate >= startDate) {
          weekDays.push(dayData || { date: dateStr, count: 0, level: 0 as const })
        } else {
          weekDays.push(null)
        }

        currentDate.setUTCDate(currentDate.getUTCDate() + 1)
      }

      weeks.push({ days: weekDays, weekStart })
    }

    return { weeks, monthLabels }
  }, [data.data])

  if (!data.data || data.data.length === 0) {
    return (
      <Card className="overflow-hidden border-border/50">
        <CardContent className="py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10">
              <Activity className="h-4 w-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Activity</h3>
              <p className="text-xs text-muted-foreground">No activity data yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="overflow-hidden border-border/50">
        <CardContent className="py-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10">
                <Activity className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Activity</h3>
                <p className="text-xs text-muted-foreground">
                  {data.totalActivities} contributions in the last year
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "w-2.5 h-2.5 rounded-sm",
                    LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]
                  )}
                />
              ))}
              <span>More</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="w-full">
            {/* Month labels */}
            <div className="flex ml-7 mb-1">
              {monthLabels.map((label, idx) => {
                // Calculate flex basis based on weeks in this month
                const nextLabel = monthLabels[idx + 1]
                const weeksInMonth = nextLabel
                  ? nextLabel.weekIndex - label.weekIndex
                  : weeks.length - label.weekIndex
                return (
                  <div
                    key={`${label.month}-${idx}`}
                    className="text-[10px] text-muted-foreground"
                    style={{ flex: weeksInMonth }}
                  >
                    {label.month}
                  </div>
                )
              })}
            </div>

            {/* Grid with day labels */}
            <div className="flex gap-1">
              {/* Day of week labels */}
              <div className="flex flex-col justify-between shrink-0 w-6">
                {DAYS_OF_WEEK.map((day, idx) => (
                  <div
                    key={day}
                    className={cn(
                      "text-[10px] text-muted-foreground leading-none",
                      idx % 2 === 0 ? "opacity-0" : ""
                    )}
                    style={{ height: "calc((100% - 6 * 2px) / 7)" }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Weeks - flexible grid */}
              <div className="flex-1 grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="grid gap-[2px]" style={{ gridTemplateRows: "repeat(7, 1fr)" }}>
                    {week.days.map((day, dayIdx) => (
                      <div
                        key={`${weekIdx}-${dayIdx}`}
                        className={cn(
                          "aspect-square rounded-sm transition-colors min-h-[8px]",
                          day
                            ? LEVEL_COLORS[day.level]
                            : "bg-transparent"
                        )}
                        title={
                          day
                            ? `${day.count} contribution${day.count !== 1 ? "s" : ""} on ${new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}`
                            : ""
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
