import { View, Text, ScrollView } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { ScreenHeader } from '@/components/ScreenHeader'

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
      <View style={[styles.badge, earned ? styles.badgeEarned : styles.badgeLocked]}>
        <Text style={[styles.badgeEmoji, !earned && styles.badgeEmojiLocked]}>{emoji}</Text>
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
  { emoji: '🌱', title: 'First Spark',     description: 'Complete your first habit',           earned: false, requirement: 'Complete 1 habit to unlock' },
  { emoji: '🔥', title: 'Week Forged',     description: 'Maintain any habit for 7 days',       earned: false, requirement: '7-day streak required' },
  { emoji: '⚒️', title: 'Iron Will',      description: 'Reach a 30-day streak',               earned: false, requirement: '30-day streak required' },
  { emoji: '🏆', title: 'Century',         description: 'Complete 100 habit check-ins',         earned: false, requirement: '100 total completions' },
  { emoji: '🌿', title: 'Roots Run Deep',  description: 'Track 5 different habits',             earned: false, requirement: 'Add 5 habits to unlock' },
]

export default function ForgeScreen() {
  return (
    <View style={styles.root}>
      <ScreenHeader style={styles.header}>
        <Text style={styles.headerEyebrow}>Milestones & achievements</Text>
        <Text style={styles.headerTitle}>The Forge</Text>
      </ScreenHeader>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            Every habit forged leaves a mark. Earn milestones by building consistency — each one a
            testament to your craft.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Milestones</Text>
        {MILESTONES.map((m) => (
          <AchievementCard key={m.title} {...m} />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },

  header: {
    backgroundColor: theme.colors.accentDark,
  },
  headerEyebrow: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: 'rgba(249,245,236,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.display,
    color: theme.colors.accentLight,
    lineHeight: theme.font.size.display * theme.font.lineHeight.tight,
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

  callout: {
    backgroundColor: theme.colors.accentSubtle,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  calloutText: {
    fontFamily: theme.font.family.italic,
    fontSize: theme.font.size.md,
    color: theme.colors.textSecondary,
    lineHeight: theme.font.size.md * theme.font.lineHeight.loose,
    textAlign: 'center',
  },

  sectionTitle: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
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
  badge: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeEarned: {
    backgroundColor: theme.colors.accent,
  },
  badgeLocked: {
    backgroundColor: theme.colors.overlayLight,
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeEmojiLocked: {
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
