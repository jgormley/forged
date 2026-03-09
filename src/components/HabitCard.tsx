import { View, Text } from 'react-native'
import { Pressable } from '@/components/Pressable'
import { useCallback, useEffect, useRef } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { StyleSheet } from 'react-native-unistyles'
import type { HabitWithFrequency } from '@/stores/habitsStore'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface HabitCardProps {
  habit: HabitWithFrequency
  isCompleted: boolean
  /** Current streak length for this habit */
  streak: number
  /**
   * 7 booleans — oldest (Mon or 6 days ago) → newest (today).
   * true = completed that day.
   */
  weekDots?: boolean[]
  onToggle: () => void
  onLongPress?: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Convert "HH:MM" (24hr) to "8:00 AM" display format */
function formatReminderTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

const WEEK_INDICES = [0, 1, 2, 3, 4, 5, 6]

function WeekDots({ dots, color }: { dots: boolean[]; color: string }) {
  return (
    <View style={styles.weekRow}>
      {WEEK_INDICES.map((i) => (
        <View
          key={i}
          style={[styles.dot, dots[i] && { backgroundColor: color }]}
        />
      ))}
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HabitCard
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_WEEK: boolean[] = [false, false, false, false, false, false, false]

export function HabitCard({
  habit,
  isCompleted,
  streak,
  weekDots = EMPTY_WEEK,
  onToggle,
  onLongPress,
}: HabitCardProps) {
  // Shared values
  const fillAnim    = useSharedValue(isCompleted ? 1 : 0)
  const badgeScale  = useSharedValue(1)
  const prevCompleted = useRef(isCompleted)
  const prevStreak    = useRef(streak)

  // Sync fill animation when isCompleted changes externally
  useEffect(() => {
    if (prevCompleted.current !== isCompleted) {
      fillAnim.value = withTiming(isCompleted ? 1 : 0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      })
      prevCompleted.current = isCompleted
    }
  }, [isCompleted, fillAnim])

  // Spring-bounce the badge when streak increments
  useEffect(() => {
    if (streak > prevStreak.current) {
      badgeScale.value = withSpring(1.4, { damping: 8, stiffness: 300 }, () => {
        badgeScale.value = withSpring(1, { damping: 12, stiffness: 200 })
      })
    }
    prevStreak.current = streak
  }, [streak, badgeScale])

  // Animated styles
  const cardOverlayStyle = useAnimatedStyle(() => ({
    opacity: fillAnim.value * 0.13,
  }))

  const iconFillStyle = useAnimatedStyle(() => ({
    opacity: fillAnim.value,
  }))

  const badgeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }))

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onToggle()
  }, [onToggle])

  const handleLongPress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    onLongPress?.()
  }, [onLongPress])

  return (
    <Pressable onPress={handlePress} onLongPress={handleLongPress} style={styles.pressable} ph-label="habit_toggle">
      <View style={styles.card}>

        {/* ── Color fill overlay ── */}
        <Animated.View
          style={[styles.cardOverlay, cardOverlayStyle, { backgroundColor: habit.color }]}
          pointerEvents="none"
        />

        {/* ── Icon circle ── */}
        <View style={styles.iconCircle}>
          <Animated.View
            style={[styles.iconFill, iconFillStyle, { backgroundColor: habit.color }]}
          />
          <Text style={styles.emoji}>{habit.icon}</Text>
        </View>

        {/* ── Name + reminder + week dots ── */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {habit.name}
          </Text>
          {habit.reminderTime ? (
            <View style={styles.reminderRow}>
              <Text style={styles.reminderIcon}>🕐</Text>
              <Text style={styles.reminderText}>{formatReminderTime(habit.reminderTime)}</Text>
            </View>
          ) : null}
          <WeekDots dots={weekDots} color={habit.color} />
        </View>

        {/* ── Streak badge ── */}
        <Animated.View style={[styles.badge, badgeAnimStyle]}>
          <Text style={styles.badgeFire}>🔥</Text>
          <Text style={styles.badgeCount}>{streak > 0 ? streak : '—'}</Text>
        </Animated.View>

      </View>
    </Pressable>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  pressable: {
    marginBottom: theme.spacing.sm,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    overflow: 'hidden',
    ...theme.shadow.sm,
  },

  // Absolutely fills the card — animates opacity for the color tint
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },

  // Absolutely fills the icon circle — animates opacity for the color fill
  iconFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  emoji: {
    fontSize: 22,
  },

  info: {
    flex: 1,
    gap: theme.spacing.xs,
  },

  name: {
    fontFamily: theme.font.family.displayMedium,
    fontSize: theme.font.size.md,
    color: theme.colors.text,
  },

  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  reminderIcon: {
    fontSize: 14,
  },
  reminderText: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.sm,
    color: theme.colors.textTertiary,
  },

  weekRow: {
    flexDirection: 'row',
    gap: 4,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.borderSubtle,
  },

  badge: {
    alignItems: 'center',
    minWidth: 36,
  },

  badgeFire: {
    fontSize: 14,
  },

  badgeCount: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.md,
    color: theme.colors.text,
    lineHeight: theme.font.size.md * theme.font.lineHeight.tight,
    textAlign: 'center',
  },
}))
