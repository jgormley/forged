import { View, Text, ScrollView } from 'react-native'
import { useState, useMemo, useCallback } from 'react'
import { StyleSheet } from 'react-native-unistyles'
import { router, useFocusEffect } from 'expo-router'
import { ScreenHeader } from '@/components/ScreenHeader'
import { HeatmapCalendar } from '@/components/HeatmapCalendar'
import { HabitStatCard } from '@/components/HabitStatCard'
import { Pressable } from '@/components/Pressable'
import { useHabitsStore } from '@/stores/habitsStore'
import { toDateKey } from '@/stores/completionsStore'
import { db } from '@/db/client'
import { completions, type Completion } from '@/db/schema'
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  getCompletionRate,
} from '@/utils/streak'

// ─────────────────────────────────────────────────────────────────────────────
// Milestone definitions (base data — earned flags computed from live data)
// ─────────────────────────────────────────────────────────────────────────────

interface MilestoneDef {
  emoji: string
  title: string
  description: string
  requirement: string
}

const MILESTONE_DEFS: MilestoneDef[] = [
  { emoji: '🌱', title: 'First Spark',    description: 'Complete your first habit',       requirement: 'Complete 1 habit to unlock' },
  { emoji: '🔥', title: 'Week Forged',    description: 'Maintain any habit for 7 days',   requirement: '7-day streak required' },
  { emoji: '⚒️', title: 'Iron Will',     description: 'Reach a 30-day streak',           requirement: '30-day streak required' },
  { emoji: '🏆', title: 'Century',        description: 'Complete 100 habit check-ins',     requirement: '100 total completions' },
  { emoji: '🌿', title: 'Roots Run Deep', description: 'Track 5 different habits',         requirement: 'Add 5 habits to unlock' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

interface AchievementCardProps extends MilestoneDef {
  earned: boolean
}

function AchievementCard({ emoji, title, description, earned, requirement }: AchievementCardProps) {
  return (
    <View style={[styles.achCard, earned && styles.achCardEarned]}>
      <View style={[styles.achBadge, earned ? styles.achBadgeEarned : styles.achBadgeLocked]}>
        <Text style={[styles.achEmoji, !earned && styles.achEmojiLocked]}>{emoji}</Text>
      </View>
      <View style={styles.achInfo}>
        <Text style={[styles.achTitle, !earned && styles.achTitleLocked]}>{title}</Text>
        <Text style={styles.achDesc}>{description}</Text>
        <Text style={earned ? styles.achEarned : styles.achRequirement}>
          {earned ? 'Earned' : requirement}
        </Text>
      </View>
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const habits = useHabitsStore((s) => s.habits)

  // Reload all completions whenever the Progress tab comes into focus so the
  // heatmap and stats always reflect changes made on the Today tab.
  const [rawCompletions, setRawCompletions] = useState<Completion[]>([])
  useFocusEffect(
    useCallback(() => {
      db.select().from(completions).then(setRawCompletions)
    }, []),
  )

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // ── Per-habit completion dates (all-time)
  const completionsByHabit = useMemo<Map<string, Date[]>>(() => {
    const map = new Map<string, Date[]>()
    for (const c of rawCompletions) {
      const arr = map.get(c.habitId)
      const date = new Date(c.completedAt)
      if (arr) arr.push(date)
      else map.set(c.habitId, [date])
    }
    return map
  }, [rawCompletions])

  // ── Heatmap: unique habits completed per calendar day (past year only)
  const heatmapData = useMemo<Map<string, number>>(() => {
    const yearAgo = new Date(today)
    yearAgo.setFullYear(yearAgo.getFullYear() - 1)
    const yearAgoKey = toDateKey(yearAgo)

    const byDay = new Map<string, Set<string>>()
    for (const c of rawCompletions) {
      const key = toDateKey(new Date(c.completedAt))
      if (key < yearAgoKey) continue
      const set = byDay.get(key) ?? new Set<string>()
      set.add(c.habitId)
      byDay.set(key, set)
    }
    const map = new Map<string, number>()
    byDay.forEach((set, key) => map.set(key, set.size))
    return map
  }, [rawCompletions, today])

  // ── Global stats across all active habits
  const globalStats = useMemo(() => {
    if (habits.length === 0) {
      return { currentStreak: 0, bestStreak: 0, thisMonth: 0 }
    }

    let maxCurrent = 0
    let maxBest    = 0
    let rateSum    = 0
    const daysIntoMonth = today.getDate()

    for (const habit of habits) {
      const dates = completionsByHabit.get(habit.id) ?? []
      const curr  = calculateCurrentStreak(dates, habit.frequency, today)
      const best  = calculateLongestStreak(dates, habit.frequency)
      if (curr > maxCurrent) maxCurrent = curr
      if (best > maxBest)    maxBest    = best
      rateSum += getCompletionRate(dates, habit.frequency, daysIntoMonth, today)
    }

    return {
      currentStreak: maxCurrent,
      bestStreak:    maxBest,
      thisMonth:     Math.round((rateSum / habits.length) * 100),
    }
  }, [habits, completionsByHabit, today])

  // ── Milestone earned flags
  const milestones = useMemo(() => [
    { ...MILESTONE_DEFS[0], earned: rawCompletions.length > 0 },
    { ...MILESTONE_DEFS[1], earned: globalStats.bestStreak >= 7 },
    { ...MILESTONE_DEFS[2], earned: globalStats.bestStreak >= 30 },
    { ...MILESTONE_DEFS[3], earned: rawCompletions.length >= 100 },
    { ...MILESTONE_DEFS[4], earned: habits.length >= 5 },
  ], [rawCompletions.length, globalStats.bestStreak, habits.length])

  // ── Formatted stat values
  const hasHabits = habits.length > 0
  const statCurrentStreak = hasHabits ? String(globalStats.currentStreak) : '—'
  const statBestStreak    = hasHabits ? String(globalStats.bestStreak) : '—'
  const statThisMonth     = hasHabits ? `${globalStats.thisMonth}%` : '—'

  return (
    <View style={styles.root}>
      <ScreenHeader style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
      </ScreenHeader>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Global stat boxes */}
        <View style={styles.statsRow}>
          <StatBox value={statCurrentStreak} label="Current streak" />
          <StatBox value={statBestStreak}    label="Best streak" />
          <StatBox value={statThisMonth}     label="This month" />
        </View>

        {/* ── Year at a glance */}
        <Text style={styles.sectionTitle}>Year at a glance</Text>
        <View style={styles.calendarCard}>
          {rawCompletions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>
                Your contribution graph will appear here once you start tracking habits.
              </Text>
            </View>
          ) : (
            <HeatmapCalendar data={heatmapData} />
          )}
        </View>

        {/* ── Habit breakdown */}
        <Text style={styles.sectionTitle}>Habit breakdown</Text>
        {habits.length === 0 ? (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderIcon}>🌿</Text>
            <Text style={styles.placeholderText}>
              Per-habit streaks and completion rates will appear here.
            </Text>
          </View>
        ) : (
          habits.map((habit) => (
            <Pressable
              key={habit.id}
              onLongPress={() => router.push(`/habit/edit/${habit.id}`)}
            >
              <HabitStatCard
                habit={habit}
                completionDates={completionsByHabit.get(habit.id) ?? []}
              />
            </Pressable>
          ))
        )}

        {/* ── Milestones */}
        <Text style={styles.sectionTitle}>Milestones</Text>
        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            Every habit forged leaves a mark. Earn milestones by building consistency — each one a
            testament to your craft.
          </Text>
        </View>
        {milestones.map((m) => (
          <AchievementCard key={m.title} {...m} />
        ))}

      </ScrollView>
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },

  header: {
    backgroundColor: theme.colors.accentDark,
    paddingBottom: theme.spacing.xxxl,
  },
  headerTitle: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.display,
    color: theme.colors.textInverse,
    lineHeight: theme.font.size.display * theme.font.lineHeight.tight,
  },

  // ── Body
  body: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    marginTop: -2,
  },
  bodyContent: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },

  // ── Section titles
  sectionTitle: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },

  // ── Stats row
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  statValue: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.xxl,
    color: theme.colors.text,
    lineHeight: theme.font.size.xxl * theme.font.lineHeight.tight,
  },
  statLabel: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
    marginTop: 2,
  },

  // ── Heatmap card
  calendarCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.xl,
  },

  // ── Empty / placeholder states
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.font.size.md * theme.font.lineHeight.normal,
  },
  placeholderCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.xl,
  },
  placeholderIcon: {
    fontSize: 36,
    marginBottom: theme.spacing.sm,
  },
  placeholderText: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.font.size.md * theme.font.lineHeight.normal,
  },

  // ── Milestones
  callout: {
    backgroundColor: theme.colors.accentSubtle,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  calloutText: {
    fontFamily: theme.font.family.italic,
    fontSize: theme.font.size.md,
    color: theme.colors.textSecondary,
    lineHeight: theme.font.size.md * theme.font.lineHeight.loose,
    textAlign: 'center',
  },
  achCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  achCardEarned: {
    borderColor: theme.colors.border,
  },
  achBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  achBadgeEarned: {
    backgroundColor: theme.colors.accent,
  },
  achBadgeLocked: {
    backgroundColor: theme.colors.overlayLight,
    opacity: 0.5,
  },
  achEmoji: {
    fontSize: 24,
  },
  achEmojiLocked: {
    opacity: 0.4,
  },
  achInfo: {
    flex: 1,
  },
  achTitle: {
    fontFamily: theme.font.family.displayMedium,
    fontSize: theme.font.size.md,
    color: theme.colors.text,
  },
  achTitleLocked: {
    color: theme.colors.textTertiary,
  },
  achDesc: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  achEarned: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: theme.colors.accent,
    fontStyle: 'italic',
    marginTop: 3,
  },
  achRequirement: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: theme.colors.textTertiary,
    marginTop: 3,
  },
}))
