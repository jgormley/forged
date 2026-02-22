import { View, Text, Modal, Dimensions } from 'react-native'
import { useEffect } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { Pressable } from '@/components/Pressable'
import { useUIStore } from '@/stores/uiStore'
import type { MilestoneTier } from '@/stores/uiStore'

const { width: SW, height: SH } = Dimensions.get('window')

// ─────────────────────────────────────────────────────────────────────────────
// Tier config
// ─────────────────────────────────────────────────────────────────────────────

interface TierConfig {
  badge: string
  title: string
  message: string
}

const TIER_CONFIG: Record<MilestoneTier, TierConfig> = {
  7: {
    badge:   '🌱',
    title:   'Week Forged',
    message: 'A week of consistency.\nThe forge is hot.',
  },
  30: {
    badge:   '🔥',
    title:   'Iron Will',
    message: 'Thirty days strong.\nThis is becoming who you are.',
  },
  100: {
    badge:   '⚒️',
    title:   'Century',
    message: 'One hundred days.\nForged in discipline. Unbreakable.',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Particle configs — seeded RNG for deterministic layout across re-renders
// ─────────────────────────────────────────────────────────────────────────────

// Palette-matched confetti colors (earthy, not rainbow)
const CONFETTI_COLORS = [
  '#C8A84B', '#E8D07A', '#9B7A28',  // forge gold family
  '#4A6741', '#6B8F61',              // forest family
  '#8B5A2B', '#C4874A',              // rust family
  '#F0EAD8',                         // parchment
]

function makeRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

interface ConfettiCfg {
  x:        number   // absolute left px
  color:    string
  size:     number   // shorter axis (px)
  isCircle: boolean
  drift:    number   // total lateral travel (px, signed)
  delay:    number   // ms before start
  duration: number   // ms for full fall
  startRot: number   // initial rotation (deg)
  endRot:   number   // final rotation (deg)
}

const rng = makeRng(42)

const CONFETTI_CFGS: ConfettiCfg[] = Array.from({ length: 100 }, () => ({
  x:        rng() * SW,
  color:    CONFETTI_COLORS[Math.floor(rng() * CONFETTI_COLORS.length)],
  size:     3 + rng() * 5,
  isCircle: rng() > 0.45,
  drift:    (rng() - 0.5) * 68,
  delay:    rng() * 600,
  duration: 1600 + rng() * 1200,
  startRot: rng() * 360,
  endRot:   rng() * 360 + 180,
}))

// ─────────────────────────────────────────────────────────────────────────────
// Confetti piece — animates once on mount (component mounts with the modal)
// ─────────────────────────────────────────────────────────────────────────────

function ConfettiPiece({ cfg }: { cfg: ConfettiCfg }) {
  const progress = useSharedValue(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    progress.value = withDelay(
      cfg.delay,
      withTiming(1, { duration: cfg.duration, easing: Easing.linear }),
    )
  }, [])

  const style = useAnimatedStyle(() => {
    const p       = progress.value
    const opacity = p < 0.65 ? 1 : 1 - (p - 0.65) / 0.35
    const rot     = cfg.startRot + (cfg.endRot - cfg.startRot) * p
    return {
      opacity,
      transform: [
        { translateY: p * SH * 0.72 },
        { translateX: cfg.drift * p },
        { rotate: `${rot}deg` },
      ],
    }
  })

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.confettiPiece,
        {
          left:            cfg.x,
          width:           cfg.size,
          height:          cfg.isCircle ? cfg.size : cfg.size * 2.2,
          borderRadius:    cfg.isCircle ? cfg.size / 2 : cfg.size * 0.35,
          backgroundColor: cfg.color,
        },
        style,
      ]}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MilestoneModal() {
  const milestone = useUIStore((s) => s.milestone)
  const dismiss   = useUIStore((s) => s.dismissMilestone)
  const { theme } = useUnistyles()

  const overlayOpacity = useSharedValue(0)
  const cardScale      = useSharedValue(0.84)
  const cardOpacity    = useSharedValue(0)

  useEffect(() => {
    if (milestone) {
      overlayOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
      cardOpacity.value    = withTiming(1, { duration: 220 })
      cardScale.value      = withSpring(1, { damping: 20, stiffness: 300 })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else {
      overlayOpacity.value = 0
      cardScale.value      = 0.84
      cardOpacity.value    = 0
    }
  }, [milestone, overlayOpacity, cardOpacity, cardScale])

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }))
  const cardStyle    = useAnimatedStyle(() => ({
    opacity:   cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }))

  if (!milestone) return null

  const config = TIER_CONFIG[milestone.tier]
  const color  =
    milestone.tier === 7   ? theme.colors.success
    : milestone.tier === 30  ? theme.colors.accent
    : theme.colors.accentDark

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <View style={styles.root}>

        {/* Dark tinted backdrop */}
        <Animated.View style={[styles.backdrop, overlayStyle]} pointerEvents="none" />

        {/* Full-screen dismiss target */}
        <Pressable style={styles.dismissArea} onPress={dismiss} />

        {/* Card */}
        <Pressable style={styles.cardWrapper} onPress={() => {}}>
          <Animated.View style={[styles.card, cardStyle]}>

            {/* ── Habit icon ── */}
            <View style={[styles.iconCircle, { backgroundColor: color }]}>
              <Text style={styles.iconEmoji}>{milestone.habitIcon}</Text>
            </View>

            {/* ── Tier badge ── */}
            <View style={[styles.tierBadge, { backgroundColor: color + '22', borderColor: color }]}>
              <Text style={styles.tierBadgeEmoji}>{config.badge}</Text>
              <Text style={[styles.tierBadgeTitle, { color }]}>{config.title}</Text>
            </View>

            {/* ── Streak number ── */}
            <Text style={[styles.streakNumber, { color }]}>{milestone.streak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>

            {/* ── Habit name ── */}
            <Text style={styles.habitName} numberOfLines={1}>{milestone.habitName}</Text>

            {/* ── Motivational message ── */}
            <Text style={styles.message}>{config.message}</Text>

            {/* ── CTA ── */}
            <Pressable style={[styles.cta, { backgroundColor: color }]} onPress={dismiss}>
              <Text style={styles.ctaText}>Keep Forging ⚒️</Text>
            </Pressable>

          </Animated.View>
        </Pressable>

        {/* Confetti — rendered last, floats above card, no pointer events */}
        <View style={styles.confettiLayer} pointerEvents="none">
          {CONFETTI_CFGS.map((cfg, i) => (
            <ConfettiPiece key={i} cfg={cfg} />
          ))}
        </View>

      </View>
    </Modal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },

  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(12, 10, 8, 0.82)',
  },

  dismissArea: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },

  cardWrapper: {
    width: '100%',
  },

  card: {
    width: '100%',
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.lg,
  },

  // ── Confetti layer — covers full modal, above everything
  confettiLayer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  confettiPiece: {
    position: 'absolute',
    top: -8,
  },

  // ── Icon
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  iconEmoji: {
    fontSize: 44,
  },

  // ── Tier badge
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
  },
  tierBadgeEmoji: {
    fontSize: 14,
  },
  tierBadgeTitle: {
    fontFamily: theme.font.family.bodySemiBold,
    fontSize: theme.font.size.sm,
    letterSpacing: 0.4,
  },

  // ── Streak number
  streakNumber: {
    fontFamily: theme.font.family.display,
    fontSize: 72,
    lineHeight: 68,
    textAlign: 'center',
  },
  streakLabel: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: theme.spacing.md,
  },

  // ── Habit name
  habitName: {
    fontFamily: theme.font.family.displayMedium,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },

  // ── Message
  message: {
    fontFamily: theme.font.family.italic,
    fontSize: theme.font.size.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.font.size.md * theme.font.lineHeight.loose,
    marginBottom: theme.spacing.xl,
  },

  // ── CTA button
  cta: {
    width: '100%',
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: theme.font.family.displayMedium,
    fontSize: theme.font.size.md,
    color: theme.colors.textInverse,
    letterSpacing: 0.3,
  },
}))
