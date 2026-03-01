import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { Pressable } from '@/components/Pressable'
import { useState, useEffect, useCallback } from 'react'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { usePremium } from '@/hooks/usePremium'
import { useHabitsStore } from '@/stores/habitsStore'
import { posthog } from '@/analytics/posthog'

export default function PaywallScreen() {
  const { purchase, restore, isPremium } = usePremium()
  const habits = useHabitsStore((s) => s.habits)

  const [isPurchasing,  setIsPurchasing]  = useState(false)
  const [isRestoring,   setIsRestoring]   = useState(false)
  const [restoreFailed, setRestoreFailed] = useState(false)

  // Fire paywall_viewed on mount
  useEffect(() => {
    posthog.capture('paywall_viewed', { habit_count: habits.length })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss if already premium
  useEffect(() => {
    if (isPremium) router.back()
  }, [isPremium])

  const handleClose = useCallback(() => {
    posthog.capture('purchase_cancelled', { habit_count: habits.length })
    router.back()
  }, [habits.length])

  const handlePurchase = useCallback(async () => {
    setIsPurchasing(true)
    const success = await purchase()
    setIsPurchasing(false)
    if (success) {
      posthog.capture('purchase_completed')
      router.back()
    }
  }, [purchase])

  const handleRestore = useCallback(async () => {
    setRestoreFailed(false)
    setIsRestoring(true)
    const found = await restore()
    setIsRestoring(false)
    if (found) {
      posthog.capture('purchase_completed', { source: 'restore' })
      router.back()
    } else {
      setRestoreFailed(true)
    }
  }, [restore])

  return (
    <SafeAreaView style={styles.root}>
      {/* ── Close button ── */}
      <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={12}>
        <Text style={styles.closeBtnText}>✕</Text>
      </Pressable>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Medallion ── */}
        <View style={styles.medallion}>
          <Text style={styles.medallionEmoji}>⚒️</Text>
        </View>

        {/* ── Headline ── */}
        <Text style={styles.headline}>Forge Without Limits</Text>
        <Text style={styles.subhead}>Unlock every feature, forever.</Text>

        {/* ── Value props ── */}
        <View style={styles.valueCard}>
          <ValueProp text="Unlimited habits" />
          <ValueProp text="Full year-at-a-glance history" />
          <ValueProp text="Streak milestones & celebrations" />
        </View>

        {/* ── Price block ── */}
        <Text style={styles.price}>$3.99</Text>
        <Text style={styles.priceSub}>One-time purchase. No subscription.</Text>

        {/* ── Purchase CTA ── */}
        <Pressable
          style={styles.ctaBtn}
          onPress={handlePurchase}
          disabled={isPurchasing || isRestoring}
        >
          {isPurchasing
            ? <ActivityIndicator color="#2C2416" />
            : <Text style={styles.ctaBtnText}>Unlock Forged ⚒️</Text>
          }
        </Pressable>

        {/* ── Restore ── */}
        <Pressable
          style={styles.restoreBtn}
          onPress={handleRestore}
          disabled={isPurchasing || isRestoring}
        >
          {isRestoring
            ? <ActivityIndicator color="#8B7A5E" size="small" />
            : <Text style={styles.restoreBtnText}>Restore Purchase</Text>
          }
        </Pressable>

        {restoreFailed && (
          <Text style={styles.restoreFailed}>No purchase found.</Text>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Pressable onPress={() => router.push('/legal/privacy')}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Pressable>
          <Text style={styles.footerDot}>·</Text>
          <Pressable onPress={() => router.push('/legal/terms')}>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function ValueProp({ text }: { text: string }) {
  return (
    <View style={styles.valuePropRow}>
      <Text style={styles.valuePropCheck}>✓</Text>
      <Text style={styles.valuePropText}>{text}</Text>
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

  closeBtn: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.md,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: theme.font.family.bodyMedium,
    fontSize: theme.font.size.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.font.size.sm * 1.2,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxxl,
  },

  medallion: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accentSubtle,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  medallionEmoji: {
    fontSize: 40,
  },

  headline: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.xxl,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subhead: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },

  valueCard: {
    width: '100%',
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  valuePropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  valuePropCheck: {
    fontFamily: theme.font.family.bodyBold,
    fontSize: theme.font.size.md,
    color: theme.colors.success,
  },
  valuePropText: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: theme.colors.text,
  },

  price: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.display,
    color: theme.colors.accent,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  priceSub: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.sm,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },

  ctaBtn: {
    width: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginBottom: theme.spacing.md,
  },
  ctaBtnText: {
    fontFamily: theme.font.family.displayMedium,
    fontSize: theme.font.size.lg,
    color: theme.colors.textInverse,
    letterSpacing: 0.3,
  },

  restoreBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    marginBottom: theme.spacing.sm,
  },
  restoreBtnText: {
    fontFamily: theme.font.family.bodyMedium,
    fontSize: theme.font.size.md,
    color: theme.colors.textSecondary,
  },

  restoreFailed: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.sm,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  footerLink: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: theme.colors.textTertiary,
  },
  footerDot: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: theme.colors.textTertiary,
  },
}))
