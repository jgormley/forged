import { View, Text } from 'react-native'
import { Pressable } from '@/components/Pressable'
import { useState, useCallback, useRef } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useHabitsStore } from '@/stores/habitsStore'
import { posthog } from '@/analytics/posthog'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const ONBOARDING_KEY = '@forged/onboardingComplete'

const LIGHT_GRADIENT: [string, string, string] = ['#2D4A28', '#4A6741', '#F9F5EC']
const DARK_GRADIENT:  [string, string, string] = ['#050503', '#0F1A0D', '#1C1912']
const GRADIENT_LOCATIONS: [number, number, number] = [0, 0.4, 1]

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ProgressDots({ step, total }: { step: number; total: number }) {
  const { theme } = useUnistyles()
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            dotStyles.dot,
            i === step
              ? {
                  width: 20,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: theme.colors.accentLight,
                }
              : {
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
          ]}
        />
      ))}
    </View>
  )
}

const dotStyles = StyleSheet.create(() => ({
  row: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  dot: {},
}))

function Medallion() {
  return (
    <View style={medallionStyles.ring}>
      <View style={medallionStyles.circle}>
        <Text style={medallionStyles.icon}>⚒️</Text>
      </View>
    </View>
  )
}

const medallionStyles = StyleSheet.create((theme) => ({
  ring: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(200,168,75,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  circle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.md,
  },
  icon: {
    fontSize: 36,
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Screen 0 — Welcome
// ─────────────────────────────────────────────────────────────────────────────

function WelcomeScreen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const FEATURES = [
    { icon: '🔥', text: 'Build powerful streaks that keep you going' },
    { icon: '🔔', text: 'Smart reminders at the time you choose' },
    { icon: '📊', text: 'Track your progress with beautiful charts' },
  ]

  return (
    <View style={welcomeStyles.card}>
      <View style={welcomeStyles.featureList}>
        {FEATURES.map((f) => (
          <View key={f.icon} style={welcomeStyles.featureRow}>
            <Text style={welcomeStyles.featureIcon}>{f.icon}</Text>
            <Text style={welcomeStyles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={welcomeStyles.actions}>
        <Pressable onPress={onNext} style={welcomeStyles.cta}>
          <LinearGradient
            colors={['#E8D07A', '#C8A84B', '#9B7A28']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={welcomeStyles.ctaGradient}
          >
            <Text style={welcomeStyles.ctaText}>Get Started →</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={onSkip} hitSlop={12} style={welcomeStyles.skipBtn}>
          <Text style={welcomeStyles.skipText}>Skip</Text>
        </Pressable>
      </View>
    </View>
  )
}

const welcomeStyles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  featureList: {
    gap: theme.spacing.lg,
    flex: 1,
    justifyContent: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: theme.colors.borderSubtle,
  },
  featureIcon: {
    fontSize: 26,
    width: 36,
    textAlign: 'center',
  },
  featureText: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: theme.colors.text,
    flex: 1,
    lineHeight: theme.font.size.md * 1.4,
  },
  actions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
  },
  cta: {
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.radius.pill,
  },
  ctaText: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.lg,
    color: '#1C1912',
    letterSpacing: 0.3,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  skipText: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: theme.colors.textTertiary,
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Screen 1 — Pick a habit
// ─────────────────────────────────────────────────────────────────────────────

const HABIT_OPTIONS = [
  { label: 'Write my daily pages',  emoji: '📝', preset: 'daily-pages' },
  { label: 'Get 8 hours of sleep',  emoji: '😴', preset: 'sleep' },
  { label: 'Workout 3 days/week',   emoji: '💪', preset: 'workout' },
  { label: 'Custom habit',          emoji: '✏️', preset: null },
]

function HabitPickScreen({ onAutoAdvance, onSkip }: { onAutoAdvance: () => void; onSkip: () => void }) {
  const habits = useHabitsStore((s) => s.habits)
  // Only auto-advance after the user has tapped an option and navigated away.
  // Without this guard, useFocusEffect fires on dep change (habits loading in
  // the background) and skips straight to step 2 before the user sees step 1.
  const hasNavigated = useRef(false)

  useFocusEffect(
    useCallback(() => {
      if (hasNavigated.current && habits.length > 0) onAutoAdvance()
    }, [habits.length, onAutoAdvance])
  )

  const handlePick = (preset: string | null) => {
    hasNavigated.current = true
    if (preset) {
      router.push(`/habit/new?preset=${preset}`)
    } else {
      router.push('/habit/new')
    }
  }

  return (
    <View style={pickStyles.card}>
      <View style={pickStyles.optionList}>
        {HABIT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.emoji}
            onPress={() => handlePick(opt.preset)}
            style={pickStyles.optionRow}
          >
            <Text style={pickStyles.optionEmoji}>{opt.emoji}</Text>
            <Text style={pickStyles.optionLabel}>{opt.label}</Text>
            <Text style={pickStyles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={onSkip} hitSlop={12} style={pickStyles.skipBtn}>
        <Text style={pickStyles.skipText}>Skip</Text>
      </Pressable>
    </View>
  )
}

const pickStyles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  optionList: {
    gap: theme.spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: theme.colors.borderSubtle,
  },
  optionEmoji: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  optionLabel: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: theme.colors.text,
    flex: 1,
  },
  chevron: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xl,
    color: theme.colors.textTertiary,
    lineHeight: theme.font.size.xl,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  skipText: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: theme.colors.textTertiary,
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Screen 2 — Congratulations
// ─────────────────────────────────────────────────────────────────────────────

function CongratulationsScreen({ onDone }: { onDone: () => void }) {
  return (
    <View style={congratsStyles.card}>
      <View style={congratsStyles.messageBox}>
        <Text style={congratsStyles.celebrationIcon}>🏆</Text>
        <Text style={congratsStyles.messageText}>
          You are one step closer to a better you.
        </Text>
      </View>

      <Pressable onPress={onDone} style={congratsStyles.cta}>
        <LinearGradient
          colors={['#E8D07A', '#C8A84B', '#9B7A28']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={congratsStyles.ctaGradient}
        >
          <Text style={congratsStyles.ctaText}>Start Forging →</Text>
        </LinearGradient>
      </Pressable>
    </View>
  )
}

const congratsStyles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  messageBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.borderSubtle,
  },
  celebrationIcon: {
    fontSize: 56,
  },
  messageText: {
    fontFamily: theme.font.family.italic,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: theme.font.size.lg * 1.5,
  },
  cta: {
    marginTop: theme.spacing.xl,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.radius.pill,
  },
  ctaText: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.lg,
    color: '#1C1912',
    letterSpacing: 0.3,
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Main screen — shared shell
// ─────────────────────────────────────────────────────────────────────────────

const HEADINGS = [
  'Forge your best self.',
  'What do you want to forge?',
  'Congratulations!',
]

const SUBHEADINGS = [
  'Daily habits, built one day at a time.',
  'Start with one. Add more anytime.',
  'You are one step closer to a better you.',
]

export default function OnboardingScreen() {
  const [step, setStep] = useState(0)
  const { theme } = useUnistyles()

  const gradient = theme.colors.background === '#E8E3D8'
    ? LIGHT_GRADIENT
    : DARK_GRADIENT

  const markDone = useCallback(async () => {
    posthog.capture('onboarding_completed')
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    router.replace('/(tabs)')
  }, [])

  return (
    <LinearGradient
      colors={gradient}
      locations={GRADIENT_LOCATIONS}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Progress dots */}
        <ProgressDots step={step} total={3} />

        {/* Medallion */}
        <Medallion />

        {/* Heading */}
        <Text style={styles.heading}>{HEADINGS[step]}</Text>

        {/* Subheading */}
        <Text style={styles.subheading}>{SUBHEADINGS[step]}</Text>

        {/* Card */}
        <View style={styles.card}>
          {step === 0 && <WelcomeScreen onNext={() => setStep(1)} onSkip={markDone} />}
          {step === 1 && <HabitPickScreen onAutoAdvance={() => setStep(2)} onSkip={() => setStep(2)} />}
          {step === 2 && <CongratulationsScreen onDone={markDone} />}
        </View>

      </SafeAreaView>
    </LinearGradient>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  heading: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.xxl,
    color: theme.colors.accentLight,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subheading: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
}))
