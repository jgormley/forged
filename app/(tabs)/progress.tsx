import { View, Text, ScrollView } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { ScreenHeader } from '@/components/ScreenHeader'

// ─────────────────────────────────────────────────────────────────────────────
// Milestones (merged from Forge)
// ─────────────────────────────────────────────────────────────────────────────

interface AchievementCardProps {
  emoji: string
  title: string
  description: string
  earned: boolean
  requirement: string
  dateEarned?: string
}

function AchievementCard({ emoji, title, description, earned, requirement, dateEarned }: AchievementCardProps) {
  return (
    <View style={[styles.achCard, earned && styles.achCardEarned]}>
      <View style={[styles.achBadge, earned ? styles.achBadgeEarned : styles.achBadgeLocked]}>
        <Text style={[styles.achEmoji, !earned && styles.achEmojiLocked]}>{emoji}</Text>
      </View>
      <View style={styles.achInfo}>
        <Text style={[styles.achTitle, !earned && styles.achTitleLocked]}>{title}</Text>
        <Text style={styles.achDesc}>{description}</Text>
        {earned && dateEarned
          ? <Text style={styles.achDate}>Earned {dateEarned}</Text>
          : <Text style={styles.achRequirement}>{requirement}</Text>
        }
      </View>
    </View>
  )
}

const MILESTONES: AchievementCardProps[] = [
  { emoji: '🌱', title: 'First Spark',    description: 'Complete your first habit',         earned: false, requirement: 'Complete 1 habit to unlock' },
  { emoji: '🔥', title: 'Week Forged',    description: 'Maintain any habit for 7 days',     earned: false, requirement: '7-day streak required' },
  { emoji: '⚒️', title: 'Iron Will',     description: 'Reach a 30-day streak',             earned: false, requirement: '30-day streak required' },
  { emoji: '🏆', title: 'Century',        description: 'Complete 100 habit check-ins',       earned: false, requirement: '100 total completions' },
  { emoji: '🌿', title: 'Roots Run Deep', description: 'Track 5 different habits',           earned: false, requirement: 'Add 5 habits to unlock' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────────────────────────────────────

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function ProgressScreen() {
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
        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <StatBox value="—" label="Current streak" />
          <StatBox value="—" label="Best streak" />
          <StatBox value="—" label="This month" />
        </View>

        {/* ── Year at a glance ── */}
        <Text style={styles.sectionTitle}>Year at a glance</Text>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderIcon}>📅</Text>
          <Text style={styles.placeholderText}>
            Your contribution graph will appear here once you start tracking habits.
          </Text>
        </View>

        {/* ── Habit breakdown ── */}
        <Text style={styles.sectionTitle}>Habit breakdown</Text>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderIcon}>🌿</Text>
          <Text style={styles.placeholderText}>
            Per-habit streaks and completion rates will appear here.
          </Text>
        </View>

        {/* ── Milestones ── */}
        <Text style={styles.sectionTitle}>Milestones</Text>
        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            Every habit forged leaves a mark. Earn milestones by building consistency — each one a
            testament to your craft.
          </Text>
        </View>
        {MILESTONES.map((m) => (
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

  // ── Section titles
  sectionTitle: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },

  // ── Placeholder cards
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

  // ── Milestones callout
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

  // ── Achievement cards
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
  achDate: {
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
