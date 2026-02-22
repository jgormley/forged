import { View, Text, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { StyleSheet } from 'react-native-unistyles'
import { ScreenHeader } from '@/components/ScreenHeader'
import { Pressable } from '@/components/Pressable'

function SettingsRow({
  label, value, chevron = true, destructive = false, onPress,
}: {
  label: string; value?: string; chevron?: boolean; destructive?: boolean; onPress?: () => void
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {chevron ? <Text style={styles.rowChevron}>›</Text> : null}
      </View>
    </Pressable>
  )
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  )
}

export default function SettingsScreen() {
  return (
    <View style={styles.root}>
      <ScreenHeader style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </ScreenHeader>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.premiumCard}>
          <View>
            <Text style={styles.premiumLabel}>Forged Free</Text>
            <Text style={styles.premiumSub}>Up to 3 habits</Text>
          </View>
          <Pressable style={styles.premiumCta}>
            <Text style={styles.premiumCtaText}>Unlock All ⚒️</Text>
          </Pressable>
        </View>

        <SettingsSection title="Habits">
          <SettingsRow
            label="Manage habits"
            onPress={() => Alert.alert(
              'Managing Habits',
              'To edit or delete a habit, long-press it on the Today page.',
              [{ text: 'Got it' }],
            )}
          />
          <SettingsRow label="Default reminder time" value="None" />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow label="Daily reminder" value="Off" />
          <SettingsRow label="Streak alerts" value="On" />
          <SettingsRow label="Milestone celebrations" value="On" />
        </SettingsSection>

        <SettingsSection title="Appearance">
          <SettingsRow label="Theme" value="System" />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow label="Rate Forged" />
          <SettingsRow label="Privacy Policy" onPress={() => router.push('/legal/privacy')} />
          <SettingsRow label="Terms of Service" onPress={() => router.push('/legal/terms')} />
          <SettingsRow label="Version" value="1.0.0" chevron={false} />
        </SettingsSection>

        <SettingsSection title="Data">
          <SettingsRow label="Export data" />
          <SettingsRow label="Delete all data" destructive chevron={false} />
        </SettingsSection>
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
    backgroundColor: theme.colors.sky,
    paddingBottom: theme.spacing.xxxl,
  },
  headerTitle: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.display,
    color: theme.colors.textInverse,
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

  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.accentSubtle,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  premiumLabel: {
    fontFamily: theme.font.family.displayMedium,
    fontSize: theme.font.size.md,
    color: theme.colors.text,
  },
  premiumSub: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.sm,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  premiumCta: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  premiumCtaText: {
    fontFamily: theme.font.family.displayMedium,
    fontSize: theme.font.size.sm,
    color: theme.colors.textInverse,
    letterSpacing: 0.2,
  },

  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: theme.font.family.bodySemiBold,
    fontSize: theme.font.size.xs,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  sectionCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  rowLabel: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: theme.colors.text,
  },
  rowLabelDestructive: {
    color: theme.colors.error,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  rowValue: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: theme.colors.textTertiary,
  },
  rowChevron: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.xl,
    color: theme.colors.textTertiary,
    lineHeight: theme.font.size.xl,
  },
}))
