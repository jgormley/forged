import * as Sentry from '@sentry/react-native'
import { View, Text, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StyleSheet } from 'react-native-unistyles'
import { Pressable } from '@/components/Pressable'
import { useHabitsStore } from '@/stores/habitsStore'
import { db } from '@/db/client'
import { completions } from '@/db/schema'
import type { NewCompletion } from '@/db/schema'
import { randomUUID } from 'expo-crypto'
import { posthog } from '@/analytics/posthog'
import Purchases from 'react-native-purchases'
import { setDevForceFree, getDevForceFree } from '@/hooks/usePremium'

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

// Days ago (from today) that are intentionally skipped — chosen to produce
// realistic-looking streaks: best=23d, current=5d, total=79/90, forge≈88%
const MOCK_SKIP_DAYS = new Set([5, 6, 21, 22, 23, 47, 48, 68, 69, 84, 85])

type AddFn = ReturnType<typeof useHabitsStore.getState>['add']

async function seedHabitWithHistory(
  add: AddFn,
): Promise<void> {
  const habit = await add({
    name: 'Morning Run',
    icon: '🏃',
    color: '#4A6741',  // forest green
    category: 'fitness',
    frequency: { type: 'daily' },
    reminderTime: '07:00',
  })

  // Build 90 days of completions, skipping MOCK_SKIP_DAYS
  const records: NewCompletion[] = []
  for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
    if (MOCK_SKIP_DAYS.has(daysAgo)) continue
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(7, 12, 0, 0)  // ~7am each day
    records.push({ id: randomUUID(), habitId: habit.id, completedAt: date, note: null })
  }

  await db.insert(completions).values(records)
}

// ─────────────────────────────────────────────────────────────────────────────
// Debug action button
// ─────────────────────────────────────────────────────────────────────────────

type ActionState = 'idle' | 'loading' | 'done' | 'error'

function DebugButton({
  label,
  description,
  onPress,
  state,
}: {
  label: string
  description: string
  onPress: () => void
  state: ActionState
}) {
  const isLoading = state === 'loading'
  const isDone    = state === 'done'
  const isError   = state === 'error'

  return (
    <Pressable
      style={[styles.actionBtn, isDone && styles.actionBtnDone, isError && styles.actionBtnError]}
      onPress={onPress}
      disabled={isLoading || isDone}
    >
      <Text style={[styles.actionLabel, isDone && styles.actionLabelDone, isError && styles.actionLabelError]}>
        {isLoading ? 'Working…' : isDone ? '✓ Done' : isError ? '✗ Failed' : label}
      </Text>
      {!isLoading && !isDone && !isError && (
        <Text style={styles.actionDesc}>{description}</Text>
      )}
    </Pressable>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function DebugScreen() {
  const add = useHabitsStore((s) => s.add)
  const [mockState, setMockState] = useState<ActionState>('idle')
  const [sentryState, setSentryState] = useState<ActionState>('idle')
  const [posthogState, setPosthogState] = useState<ActionState>('idle')
  const [onboardingResetState, setOnboardingResetState] = useState<ActionState>('idle')
  const [rcStatusState, setRcStatusState] = useState<ActionState>('idle')
  const [rcOfferingsState, setRcOfferingsState] = useState<ActionState>('idle')
  const [rcForceFreeActive, setRcForceFreeActive] = useState(() => getDevForceFree())

  const handleAddMockHabit = async () => {
    setMockState('loading')
    try {
      await seedHabitWithHistory(add)
      setMockState('done')
    } catch (e) {
      console.error('[debug] seedHabitWithHistory failed:', e)
      Alert.alert('Error', String(e))
      setMockState('error')
    }
  }

  return (
    <View style={styles.root}>
      {/* ── Header */}
      <View style={styles.header}>
        <View style={styles.dragHandle} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Debug</Text>
          <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={16}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>
        <Text style={styles.headerSub}>Internal tools — not visible in production</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Test Data</Text>

        <DebugButton
          label="Add Habit with Mock History"
          description="Creates '🏃 Morning Run' (daily) with 90 days of realistic completions — 79 total, 5-day current streak, 23-day best."
          onPress={handleAddMockHabit}
          state={mockState}
        />

        <Text style={styles.sectionLabel}>Onboarding</Text>

        <DebugButton
          label="Reset Onboarding"
          description="Clears the onboarding completion flag. Next launch (or app restart) will show the onboarding flow again."
          onPress={async () => {
            setOnboardingResetState('loading')
            try {
              await AsyncStorage.removeItem('@forged/onboardingComplete')
              setOnboardingResetState('done')
            } catch (e) {
              Alert.alert('Error', String(e))
              setOnboardingResetState('error')
            }
          }}
          state={onboardingResetState}
        />

        <Text style={styles.sectionLabel}>PostHog</Text>

        <DebugButton
          label="Send Test Event to PostHog"
          description="Captures a 'user_signed_up' event and flushes immediately to verify the PostHog integration."
          onPress={async () => {
            setPosthogState('loading')
            try {
              posthog.capture('user_signed_up')
              await posthog.flush()
              setPosthogState('done')
              Alert.alert('Sent', 'Test event sent to PostHog.')
            } catch (e) {
              Alert.alert('Error', String(e))
              setPosthogState('error')
            }
          }}
          state={posthogState}
        />

        <Text style={styles.sectionLabel}>Sentry</Text>

        <DebugButton
          label="Send Test Error to Sentry"
          description="Captures a test exception and sends it to Sentry to verify the integration."
          onPress={() => {
            setSentryState('loading')
            Sentry.captureException(new Error('Sentry test error from Debug screen'))
            setSentryState('done')
            Alert.alert('Sent', 'Test error sent to Sentry.')
          }}
          state={sentryState}
        />

        <Text style={styles.sectionLabel}>RevenueCat</Text>

        <DebugButton
          label="Check RC Entitlements"
          description="Fetches current CustomerInfo and shows active entitlements. Use this after a purchase to see what RC returned."
          onPress={async () => {
            setRcStatusState('loading')
            try {
              const info = await Purchases.getCustomerInfo()
              const keys = Object.keys(info.entitlements.active)
              console.log('[RC debug] activeEntitlements:', keys)
              console.log('[RC debug] allEntitlements:', JSON.stringify(info.entitlements.all, null, 2))
              Alert.alert(
                'RC Entitlements',
                keys.length > 0
                  ? `Active:\n${keys.join('\n')}`
                  : 'No active entitlements.\n\nExpected: forged_premium_lifetime\n\nCheck RC dashboard → Entitlements.',
              )
              setRcStatusState('done')
            } catch (e) {
              console.warn('[RC debug] getCustomerInfo error:', e)
              Alert.alert('RC Error', String(e))
              setRcStatusState('error')
            }
          }}
          state={rcStatusState}
        />

        <DebugButton
          label="Check RC Offerings"
          description="Fetches current offerings from RevenueCat. Verifies that a product is configured and available to purchase."
          onPress={async () => {
            setRcOfferingsState('loading')
            try {
              const offerings = await Purchases.getOfferings()
              const current = offerings.current
              console.log('[RC debug] current offering:', current?.identifier ?? 'null')
              console.log('[RC debug] packages:', current?.availablePackages.map(p => `${p.identifier} (${p.packageType})`))
              Alert.alert(
                'RC Offerings',
                current
                  ? `Offering: ${current.identifier}\nPackages: ${current.availablePackages.map(p => p.identifier).join(', ')}`
                  : 'No current offering found.\n\nGo to RevenueCat dashboard → Offerings and set a "current" offering.',
              )
              setRcOfferingsState('done')
            } catch (e) {
              console.warn('[RC debug] getOfferings error:', e)
              Alert.alert('RC Error', String(e))
              setRcOfferingsState('error')
            }
          }}
          state={rcOfferingsState}
        />

        <DebugButton
          label={rcForceFreeActive ? 'Free Tier Override: ON — tap to disable' : 'Force Free Tier (dev override)'}
          description={rcForceFreeActive
            ? 'The app is currently treating you as a free user regardless of your RC entitlement. Tap to restore normal behaviour.'
            : 'Instantly puts the app in free tier without touching RevenueCat. Resets on next Metro reload. Use this to test the paywall gate.'}
          onPress={() => {
            const next = !rcForceFreeActive
            setDevForceFree(next)
            setRcForceFreeActive(next)
          }}
          state="idle"
        />

        <DebugButton
          label="Show RC App User ID"
          description="Shows your current RC anonymous user ID. Copy it and paste into RC Dashboard → Customers to delete the customer and fully reset purchase history."
          onPress={async () => {
            try {
              const userId = await Purchases.getAppUserID()
              Alert.alert('RC App User ID', userId, [
                { text: 'Copy', onPress: () => {
                  // expo-clipboard is not installed; log to Metro as fallback
                  console.log('[RC debug] appUserID:', userId)
                  Alert.alert('Copied to Metro log', 'The ID has been printed to the Metro console.')
                }},
                { text: 'OK' },
              ])
            } catch (e) {
              Alert.alert('Error', String(e))
            }
          }}
          state="idle"
        />

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

  // ── Header
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.borderSubtle,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.xl,
    color: theme.colors.text,
  },
  headerSub: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.sm,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: theme.font.family.bodySemiBold,
    fontSize: theme.font.size.md,
    color: theme.colors.textSecondary,
    lineHeight: theme.font.size.md * 1.4,
  },

  // ── Body
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  sectionLabel: {
    fontFamily: theme.font.family.bodySemiBold,
    fontSize: theme.font.size.xs,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: theme.spacing.sm,
  },

  // ── Action buttons
  actionBtn: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  actionBtnDone: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successSubtle,
  },
  actionBtnError: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.errorSubtle,
  },
  actionLabel: {
    fontFamily: theme.font.family.bodyMedium,
    fontSize: theme.font.size.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  actionLabelDone: {
    color: theme.colors.success,
  },
  actionLabelError: {
    color: theme.colors.error,
  },
  actionDesc: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.font.size.sm * 1.5,
  },
}))
