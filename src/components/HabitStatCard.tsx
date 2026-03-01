import { View, Text, StyleSheet as RNStyleSheet } from 'react-native'
import { useMemo } from 'react'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { CartesianChart, Line } from 'victory-native'
import { useFont } from '@shopify/react-native-skia'
import type { HabitWithFrequency } from '@/stores/habitsStore'
import {
  calculateCurrentStreak,
  getCompletionRate,
} from '@/utils/streak'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface HabitStatCardProps {
  habit: HabitWithFrequency
  /** All-time completion dates for this habit (passed from parent's live query) */
  completionDates: Date[]
}

// Chart shows up to 12 weekly data points, limited to the habit's actual age
type ChartPoint = { week: number; rate: number }

const MAX_CHART_WEEKS = 12
const AXIS_FONT_SIZE = 9

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: stat chip
// ─────────────────────────────────────────────────────────────────────────────

function StatChip({
  value,
  label,
  color,
}: {
  value: string
  label: string
  color?: string
}) {
  return (
    <View style={styles.chip}>
      <Text style={[styles.chipValue, color ? { color } : undefined]}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HabitStatCard
// ─────────────────────────────────────────────────────────────────────────────

export function HabitStatCard({ habit, completionDates }: HabitStatCardProps) {
  const { theme } = useUnistyles()

  // Load CrimsonPro for axis labels — local .ttf bundled with app, no async delay
  const axisFont = useFont(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@expo-google-fonts/crimson-pro/400Regular/CrimsonPro_400Regular.ttf'),
    AXIS_FONT_SIZE,
  )

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const currentStreak = useMemo(
    () => calculateCurrentStreak(completionDates, habit.frequency, today),
    [completionDates, habit.frequency, today],
  )

  // Days since the habit was created — used to avoid penalising new habits.
  const daysSinceCreation = useMemo(() => {
    const habitStart = new Date(habit.createdAt)
    habitStart.setHours(0, 0, 0, 0)
    return Math.floor((today.getTime() - habitStart.getTime()) / (1000 * 60 * 60 * 24))
  }, [habit.createdAt, today])

  // Forge Rate: % of scheduled opportunities hit, looking back up to 30 days
  // but no further than the habit's creation date.
  const forgeRate = useMemo(
    () => Math.round(
      getCompletionRate(
        completionDates,
        habit.frequency,
        Math.max(1, Math.min(30, daysSinceCreation + 1)),
        today,
      ) * 100,
    ),
    [completionDates, habit.frequency, today, daysSinceCreation],
  )

  const total = completionDates.length

  // Number of weekly buckets to show — driven by the oldest completion.
  // No upper cap: habits older than MAX_CHART_WEEKS show all-time data.
  // Minimum 2 so CartesianChart always has enough points to draw a line.
  const chartWeeks = useMemo(() => {
    if (completionDates.length === 0) return 2
    const oldest = completionDates.reduce((min, d) => (d < min ? d : min), completionDates[0]!)
    const daysSinceOldest = Math.floor((today.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(2, Math.ceil((daysSinceOldest + 1) / 7))
  }, [completionDates, today])

  // Chart: one data point per week spanning chartWeeks weeks back from today
  const chartData = useMemo<ChartPoint[]>(() => {
    return Array.from({ length: chartWeeks }, (_, w) => {
      const weekEnd = new Date(today)
      weekEnd.setDate(weekEnd.getDate() - (chartWeeks - 1 - w) * 7)
      const rate = getCompletionRate(completionDates, habit.frequency, 7, weekEnd)
      return { week: w + 1, rate: Math.round(rate * 100) }
    })
  }, [completionDates, habit.frequency, today, chartWeeks])

  const chartCaption = chartWeeks > MAX_CHART_WEEKS
    ? 'All time'
    : chartWeeks <= 1
      ? 'This week'
      : `Last ${chartWeeks} weeks`

  return (
    <View style={[styles.card, { borderLeftColor: habit.color }]}>
      {/* ── Header: icon + name */}
      <View style={styles.header}>
        <Text style={styles.icon}>{habit.icon}</Text>
        <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
      </View>

      {/* ── Stat chips */}
      <View style={styles.chipRow}>
        <StatChip value={String(currentStreak)} label="Streak" color={habit.color} />
        <View style={styles.chipDivider} />
        <StatChip value={`${forgeRate}%`} label="Forge Rate" />
        <View style={styles.chipDivider} />
        <StatChip value={String(total)} label="Total" />
      </View>

      {/* ── Line chart
            padding.top = breathing room so the line isn't clipped when rate=100
            padding.right = space for the y-axis labels drawn outside the plot area */}
      <View style={styles.chartWrap}>
        <CartesianChart
          data={chartData}
          xKey="week"
          yKeys={['rate']}
          domain={{ y: [0, 110] }}
          padding={{ top: 4, right: 32 }}
          frame={{
            lineWidth: { top: 0, right: 0, bottom: RNStyleSheet.hairlineWidth, left: 0 },
            lineColor: theme.colors.borderSubtle,
          }}
          yAxis={[{
            font: axisFont,
            axisSide: 'right',
            tickValues: [0, 50, 100],
            formatYLabel: (v) => `${v}%`,
            labelColor: theme.colors.textTertiary,
            lineColor: theme.colors.borderSubtle,
            lineWidth: RNStyleSheet.hairlineWidth,
            labelOffset: 6,
          }]}
        >
          {({ points }) => (
            <Line
              points={points.rate}
              color={habit.color}
              strokeWidth={1.5}
              curveType="natural"
            />
          )}
        </CartesianChart>
      </View>

      {/* ── Chart x-axis label */}
      <Text style={styles.chartCaption}>{chartCaption}</Text>
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderLeftWidth: 3,
    // borderLeftColor is set inline from habit.color
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadow.sm,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  name: {
    fontFamily: theme.font.family.displayMedium,
    fontSize: theme.font.size.md,
    color: theme.colors.text,
    flex: 1,
  },

  // ── Stat chips
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    overflow: 'hidden',
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  chipValue: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.xl,
    color: theme.colors.text,
    lineHeight: theme.font.size.xl * theme.font.lineHeight.tight,
  },
  chipLabel: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  chipDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.borderSubtle,
  },

  // ── Chart
  // Height increased to 80 so the 10px top padding doesn't make the plot area feel cramped
  chartWrap: {
    height: 80,
    marginHorizontal: theme.spacing.md,
  },
  chartCaption: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: theme.colors.textTertiary,
    textAlign: 'right',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    marginTop: 2,
  },
}))
