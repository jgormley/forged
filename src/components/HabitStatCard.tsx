import { View, Text, ScrollView, useWindowDimensions } from 'react-native'
import { Pressable } from '@/components/Pressable'
import { useMemo, useRef, useCallback } from 'react'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import type { HabitWithFrequency } from '@/stores/habitsStore'
import {
  calculateCurrentStreak,
  getCompletionRate,
} from '@/utils/streak'
import { toDateKey } from '@/stores/completionsStore'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface HabitStatCardProps {
  habit: HabitWithFrequency
  /** All-time completion dates for this habit (passed from parent's live query) */
  completionDates: Date[]
  /** Long-press handler (e.g. to edit the habit) */
  onLongPress?: () => void
}

interface CalendarDay {
  key: string        // YYYY-MM-DD
  dayNum: number     // 1-31
  dayName: string    // "Mon", "Tue", etc.
  month: string      // "Jan", "Feb", etc.
  completed: boolean
  isFirstOfMonth: boolean
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_CELL_WIDTH = 36
const DAY_CELL_GAP = 6

/** Convert "HH:MM" (24hr) to "8:00 AM" display format */
function formatReminderTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

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

export function HabitStatCard({ habit, completionDates, onLongPress }: HabitStatCardProps) {
  const { theme } = useUnistyles()
  const scrollRef = useRef<ScrollView>(null)
  const { width: screenWidth } = useWindowDimensions()

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

  // Build calendar day data — go back to whichever is earlier: creation date or oldest completion
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const completedKeys = new Set(completionDates.map(toDateKey))

    let daysSinceOldest = daysSinceCreation
    for (const d of completionDates) {
      const dStart = new Date(d)
      dStart.setHours(0, 0, 0, 0)
      const diff = Math.floor((today.getTime() - dStart.getTime()) / (1000 * 60 * 60 * 24))
      if (diff > daysSinceOldest) daysSinceOldest = diff
    }

    const totalDays = Math.max(7, daysSinceOldest + 1)
    const days: CalendarDay[] = []

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (totalDays - 1 - i))
      const key = toDateKey(date)
      days.push({
        key,
        dayNum: date.getDate(),
        dayName: DAY_NAMES[date.getDay()],
        month: MONTH_NAMES[date.getMonth()],
        completed: completedKeys.has(key),
        isFirstOfMonth: date.getDate() === 1 || i === 0,
      })
    }
    return days
  }, [completionDates, today, daysSinceCreation])

  // Scroll to end (most recent) on initial layout
  const handleLayout = useCallback(() => {
    // Estimate total content width vs visible width to decide if we need to scroll
    const contentWidth = calendarDays.length * (DAY_CELL_WIDTH + DAY_CELL_GAP)
    // Card has md padding on each side, so visible width is roughly screenWidth - padding*2 - border
    const visibleWidth = screenWidth - 64
    if (contentWidth > visibleWidth) {
      scrollRef.current?.scrollToEnd({ animated: false })
    }
  }, [calendarDays.length, screenWidth])

  // Track the visible month label based on scroll position
  const visibleMonth = useMemo(() => {
    // Default to the last day's month (since we scroll to end)
    return calendarDays.length > 0 ? calendarDays[calendarDays.length - 1].month : ''
  }, [calendarDays])

  return (
    <View style={[styles.card, { borderLeftColor: habit.color }]}>
      <Pressable onLongPress={onLongPress}>
        {/* ── Header: icon + name */}
        <View style={styles.header}>
          <Text style={styles.icon}>{habit.icon}</Text>
          <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
        </View>

        {/* ── Reminder time */}
        {habit.reminderTime ? (
          <View style={styles.reminderRow}>
            <Text style={styles.reminderIcon}>🕐</Text>
            <Text style={styles.reminderText}>{formatReminderTime(habit.reminderTime)}</Text>
          </View>
        ) : null}

        {/* ── Stat chips */}
        <View style={styles.chipRow}>
          <StatChip value={String(currentStreak)} label="Streak" color={habit.color} />
          <View style={styles.chipDivider} />
          <StatChip value={`${forgeRate}%`} label="Forge Rate" />
          <View style={styles.chipDivider} />
          <StatChip value={String(total)} label="Total" />
        </View>
      </Pressable>

      {/* ── Horizontal scrolling calendar */}
      <View style={styles.calendarWrap}>
        <Text style={styles.calendarMonth}>{visibleMonth}</Text>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onLayout={handleLayout}
          contentContainerStyle={styles.calendarContent}
        >
          {calendarDays.map((day) => (
            <View key={day.key} style={styles.calendarDay}>
              {day.isFirstOfMonth ? (
                <Text style={styles.calendarDayMonth}>{day.month}</Text>
              ) : (
                <View style={styles.calendarDayMonthSpacer} />
              )}
              <Text style={styles.calendarDayName}>{day.dayName}</Text>
              <View
                style={[
                  styles.calendarDayBox,
                  day.completed
                    ? { backgroundColor: habit.color }
                    : styles.calendarDayBoxIncomplete,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayNum,
                    day.completed && styles.calendarDayNumCompleted,
                  ]}
                >
                  {day.dayNum}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
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

  // ── Reminder — left padding aligns with habit name (md + icon 20 + gap sm)
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingLeft: theme.spacing.md + 20 + theme.spacing.sm,
    paddingRight: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  reminderIcon: {
    fontSize: 14,
  },
  reminderText: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.sm,
    color: theme.colors.textTertiary,
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

  // ── Calendar
  calendarWrap: {
    marginTop: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
  },
  calendarMonth: {
    fontFamily: theme.font.family.bodySemiBold,
    fontSize: theme.font.size.xs,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'right',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  calendarContent: {
    paddingHorizontal: theme.spacing.md,
    gap: DAY_CELL_GAP,
  },
  calendarDay: {
    alignItems: 'center',
    width: DAY_CELL_WIDTH,
  },
  calendarDayMonth: {
    fontFamily: theme.font.family.bodyMedium,
    fontSize: 9,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  calendarDayMonthSpacer: {
    height: 9 + 2, // match calendarDayMonth fontSize + marginBottom
  },
  calendarDayName: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.xs,
  },
  calendarDayBox: {
    width: DAY_CELL_WIDTH,
    height: DAY_CELL_WIDTH,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayBoxIncomplete: {
    backgroundColor: theme.colors.surfaceAlt,
  },
  calendarDayNum: {
    fontFamily: theme.font.family.bodyMedium,
    fontSize: theme.font.size.sm,
    color: theme.colors.textSecondary,
  },
  calendarDayNumCompleted: {
    color: theme.colors.textInverse,
    fontFamily: theme.font.family.bodySemiBold,
  },
}))
