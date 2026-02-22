import { View, Text, ScrollView } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

export default function ProgressScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>Your growth</Text>
        <Text style={styles.headerTitle}>Progress</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <StatBox value="—" label="Current streak" />
          <StatBox value="—" label="Best streak" />
          <StatBox value="—" label="This month" />
        </View>

        <Text style={styles.sectionTitle}>Year at a glance</Text>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderIcon}>📅</Text>
          <Text style={styles.placeholderText}>
            Your contribution graph will appear here once you start tracking habits.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Habit breakdown</Text>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderIcon}>🌿</Text>
          <Text style={styles.placeholderText}>
            Per-habit streaks and completion rates will appear here.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create((theme, rt) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },

  // ── Header
  header: {
    backgroundColor: theme.colors.accent,
    paddingTop: rt.insets.top + theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  headerEyebrow: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xs,
    color: 'rgba(28,25,18,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
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
    marginTop: -theme.spacing.lg,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
  bodyContent: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },

  // ── Stats
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

  sectionTitle: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
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
}))
