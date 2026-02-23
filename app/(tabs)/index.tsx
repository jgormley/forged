import { View, Text, ScrollView } from 'react-native'
import { Pressable } from '@/components/Pressable'
import { useEffect, useMemo, useCallback } from 'react'
import { router } from 'expo-router'
import { StyleSheet } from 'react-native-unistyles'
import { ScreenHeader } from '@/components/ScreenHeader'
import { HabitCard } from '@/components/HabitCard'
import { useHabitsStore } from '@/stores/habitsStore'
import { useCompletionsStore, toDateKey } from '@/stores/completionsStore'
import { useUIStore, getMilestoneTier } from '@/stores/uiStore'
import { useNotificationSettingsStore } from '@/stores/notificationSettingsStore'
import { calculateCurrentStreak } from '@/utils/streak'
import type { Completion } from '@/db/schema'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

function getHour(): number {
  return new Date().getHours()
}

function greeting(): string {
  const h = getHour()
  if (h < 12) return 'Good morning ⚒️'
  if (h < 17) return 'Good afternoon ⚒️'
  return 'Good evening ⚒️'
}

/** Returns 7 booleans (6 days ago → today) for whether a habit was completed. */
function buildWeekDots(habitId: string, completions: Completion[]): boolean[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const key = toDateKey(d)
    return completions.some(
      (c) => c.habitId === habitId && toDateKey(c.completedAt) === key
    )
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function TodayScreen() {
  const habits           = useHabitsStore((s) => s.habits)
  const loadHabits       = useHabitsStore((s) => s.load)
  const completions      = useCompletionsStore((s) => s.completions)
  const completedTodayIds = useCompletionsStore((s) => s.completedTodayIds)
  const loadAll          = useCompletionsStore((s) => s.loadAll)
  const toggle           = useCompletionsStore((s) => s.toggle)
  const showMilestone           = useUIStore((s) => s.showMilestone)
  const milestoneCelebrations   = useNotificationSettingsStore((s) => s.milestoneCelebrations)

  useEffect(() => {
    loadHabits()
    loadAll()
  }, [loadHabits, loadAll])

  // Per-habit derived data — recomputed only when completions or habits change
  const habitData = useMemo(() => {
    const today = new Date()
    return habits.map((habit) => {
      const habitCompletions = completions
        .filter((c) => c.habitId === habit.id)
        .map((c) => c.completedAt)
      const streak  = calculateCurrentStreak(habitCompletions, habit.frequency, today)
      const weekDots = buildWeekDots(habit.id, completions)
      return { habit, streak, weekDots }
    })
  }, [habits, completions])

  const totalCount     = habits.length
  const completedCount = habits.filter((h) => completedTodayIds.has(h.id)).length
  const pct            = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const debugMilestone = useCallback(() => {
    showMilestone({ habitId: 'debug', habitName: 'Morning Run', habitIcon: '🏃', streak: 7, tier: 7 })
  }, [showMilestone])

  const handleToggle = useCallback(async (habitId: string, currentStreak: number) => {
    const result = await toggle(habitId)
    if (result && milestoneCelebrations) {
      // Habit was just completed — check for milestone
      const newStreak = currentStreak + 1
      const tier = getMilestoneTier(newStreak)
      if (tier) {
        const habit = habits.find((h) => h.id === habitId)
        if (habit) {
          showMilestone({
            habitId,
            habitName: habit.name,
            habitIcon: habit.icon,
            streak: newStreak,
            tier,
          })
        }
      }
    }
  }, [toggle, habits, showMilestone, milestoneCelebrations])

  return (
    <View style={styles.root}>

      {/* ── Hero ── */}
      <ScreenHeader style={styles.hero}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroDate}>{TODAY}</Text>
          <Pressable onPress={debugMilestone}>
            <Text style={styles.debugBtn}>show modal</Text>
          </Pressable>
        </View>
        <Text style={styles.heroGreeting}>{greeting()}</Text>

        <View style={styles.progressCard}>
          <View>
            <Text style={styles.progressPct}>{pct}%</Text>
            <Text style={styles.progressLabel}>Today's forge</Text>
          </View>
          <View style={styles.progressBarWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.progressSub}>
              {totalCount === 0
                ? 'No habits being forged — start one today!'
                : `${completedCount} of ${totalCount} habit${totalCount !== 1 ? 's' : ''} complete`}
            </Text>
          </View>
        </View>
      </ScreenHeader>

      {/* ── Body ── */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Today's Habits</Text>

        {habitData.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyHeading}>Your forge awaits</Text>
            <Text style={styles.emptyBody}>
              Add your first habit to begin building the life you want, one day at a time.
            </Text>
            <Pressable style={styles.addButton} onPress={() => router.push('/habit/new')}>
              <Text style={styles.addButtonText}>Forge Your First Habit</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {habitData.map(({ habit, streak, weekDots }) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompleted={completedTodayIds.has(habit.id)}
                streak={streak}
                weekDots={weekDots}
                onToggle={() => handleToggle(habit.id, streak)}
                onLongPress={() => router.push(`/habit/edit/${habit.id}`)}
              />
            ))}

            <Pressable style={styles.addButton} onPress={() => router.push('/habit/new')}>
              <Text style={styles.addButtonText}>Forge a New Habit</Text>
            </Pressable>
          </>
        )}
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

  hero: {
    backgroundColor: theme.colors.success,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  heroDate: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: 'rgba(249,245,236,0.65)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  debugBtn: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: 'rgba(249,245,236,0.65)',
    letterSpacing: 0.8,
  },
  heroGreeting: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.display,
    color: theme.colors.accentLight,
    lineHeight: theme.font.size.display * theme.font.lineHeight.tight,
    marginBottom: theme.spacing.md,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  progressPct: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.xxl,
    color: theme.colors.accentLight,
    lineHeight: theme.font.size.xxl * theme.font.lineHeight.tight,
  },
  progressLabel: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: 'rgba(249,245,236,0.65)',
  },
  progressBarWrap: {
    flex: 1,
  },
  progressTrack: {
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accentLight,
    borderRadius: theme.radius.full,
  },
  progressSub: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: 'rgba(249,245,236,0.60)',
  },

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
  sectionTitle: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  emptyCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  emptyHeading: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.xl,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.font.size.md * theme.font.lineHeight.normal,
  },

  addButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  addButtonText: {
    fontFamily: theme.font.family.displayMedium,
    fontSize: theme.font.size.md,
    color: theme.colors.textInverse,
    letterSpacing: 0.3,
  },
}))
