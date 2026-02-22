import { View, Text, ScrollView, Pressable } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { ScreenHeader } from '@/components/ScreenHeader'

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

export default function TodayScreen() {
  return (
    <View style={styles.root}>
      {/* ── Hero ── */}
      <ScreenHeader style={styles.hero}>
        <Text style={styles.heroDate}>{TODAY}</Text>
        <Text style={styles.heroGreeting}>Good morning ⚒️</Text>

        <View style={styles.progressCard}>
          <View>
            <Text style={styles.progressPct}>0%</Text>
            <Text style={styles.progressLabel}>Today's forge</Text>
          </View>
          <View style={styles.progressBarWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '0%' }]} />
            </View>
            <Text style={styles.progressSub}>0 of 0 habits complete</Text>
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

        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🌱</Text>
          <Text style={styles.emptyHeading}>Your forge awaits</Text>
          <Text style={styles.emptyBody}>
            Add your first habit to begin building the life you want, one day at a time.
          </Text>
        </View>

        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Your First Habit</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },

  hero: {
    backgroundColor: theme.colors.success,
  },
  heroDate: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: 'rgba(249,245,236,0.65)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  heroGreeting: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.xl,
    color: theme.colors.accentLight,
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
  sectionTitle: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  // ── Empty state
  emptyCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.md,
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

  // ── Add button
  addButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  addButtonText: {
    fontFamily: theme.font.family.displayMedium,
    fontSize: theme.font.size.md,
    color: theme.colors.textInverse,
    letterSpacing: 0.3,
  },
}))
