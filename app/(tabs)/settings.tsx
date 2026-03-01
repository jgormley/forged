import { View, Text, ScrollView, Alert, Platform } from 'react-native'
import { router } from 'expo-router'
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles'
import { ScreenHeader } from '@/components/ScreenHeader'
import { Pressable } from '@/components/Pressable'
import { useState, useRef, useEffect } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNotificationSettingsStore } from '@/stores/notificationSettingsStore'
import type { NotificationSettings } from '@/stores/notificationSettingsStore'
import { cancelAllReminders, rescheduleAllReminders } from '@/utils/notifications'
import { useHabitsStore } from '@/stores/habitsStore'
import { usePremium, FREE_HABIT_LIMIT } from '@/hooks/usePremium'
import { posthog } from '@/analytics/posthog'

type ThemeMode = 'light' | 'dark' | 'system'

const THEME_KEY = '@forged/theme'
const REMINDER_TIME_KEY = '@forged/defaultReminderTime'

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light',  label: 'Light'  },
  { value: 'dark',   label: 'Dark'   },
  { value: 'system', label: 'System' },
]

function applyTheme(mode: ThemeMode) {
  if (mode === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true)
  } else {
    UnistylesRuntime.setAdaptiveThemes(false)
    UnistylesRuntime.setTheme(mode)
  }
}

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

function SettingsToggleRow({
  label, value, onChange,
}: {
  label: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={segmentStyles.track}>
        <Pressable
          onPress={() => onChange(false)}
          style={[segmentStyles.option, !value && segmentStyles.optionActiveOff]}
        >
          <Text style={[segmentStyles.optionText, !value && segmentStyles.optionTextActive]}>Off</Text>
        </Pressable>
        <Pressable
          onPress={() => onChange(true)}
          style={[segmentStyles.option, value && segmentStyles.optionActive]}
        >
          <Text style={[segmentStyles.optionText, value && segmentStyles.optionTextActive]}>On</Text>
        </Pressable>
      </View>
    </View>
  )
}

function ThemeToggle({ value, onChange }: { value: ThemeMode; onChange: (m: ThemeMode) => void }) {
  return (
    <View style={segmentStyles.track}>
      {THEME_OPTIONS.map((opt) => {
        const active = opt.value === value
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[segmentStyles.option, active && segmentStyles.optionActive]}
          >
            <Text style={[segmentStyles.optionText, active && segmentStyles.optionTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const segmentStyles = StyleSheet.create((theme) => ({
  track: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.sm,
    padding: 3,
    gap: 2,
  },
  option: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    borderRadius: theme.radius.xs,
  },
  optionActive: {
    backgroundColor: theme.colors.accent,
  },
  optionActiveOff: {
    backgroundColor: theme.colors.textTertiary,
  },
  optionText: {
    fontFamily: theme.font.family.bodyMedium,
    fontSize: theme.font.size.sm,
    color: theme.colors.textSecondary,
  },
  optionTextActive: {
    color: theme.colors.textInverse,
  },
}))

function makeDefaultReminderDate(): Date {
  const d = new Date()
  d.setHours(8, 0, 0, 0)
  return d
}

function formatSettingsTime(d: Date): string {
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${m} ${ampm}`
}

function toHHMM(d: Date): string {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function parseHHMM(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

export default function SettingsScreen() {
  const [defaultReminderTime, setDefaultReminderTime] = useState<Date>(makeDefaultReminderDate)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const versionTaps = useRef(0)

  const habits           = useHabitsStore((s) => s.habits)
  const { isPremium }    = usePremium()
  const dailyReminders        = useNotificationSettingsStore((s) => s.dailyReminders)
  const streakAlerts          = useNotificationSettingsStore((s) => s.streakAlerts)
  const milestoneCelebrations = useNotificationSettingsStore((s) => s.milestoneCelebrations)
  const updateNotifSettings   = useNotificationSettingsStore((s) => s.update)

  const handleNotifChange = async (key: keyof NotificationSettings, value: boolean) => {
    await updateNotifSettings({ [key]: value })
    posthog.capture('notifications_toggled', { setting: key, enabled: value })
    if (key === 'dailyReminders') {
      if (value) {
        await rescheduleAllReminders(habits)
      } else {
        await cancelAllReminders()
      }
    }
  }

  // Load persisted reminder time on mount
  useEffect(() => {
    AsyncStorage.getItem(REMINDER_TIME_KEY).then((value) => {
      if (value) setDefaultReminderTime(parseHHMM(value))
    })
  }, [])

  const handleReminderTimeChange = (date: Date) => {
    setDefaultReminderTime(date)
    AsyncStorage.setItem(REMINDER_TIME_KEY, toHHMM(date))
  }

  const [themeMode, setThemeMode] = useState<ThemeMode>(() =>
    UnistylesRuntime.hasAdaptiveThemes
      ? 'system'
      : UnistylesRuntime.themeName === 'dark' ? 'dark' : 'light'
  )

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
    applyTheme(mode)
    AsyncStorage.setItem(THEME_KEY, mode)
    posthog.capture('theme_changed', { theme: mode })
  }

  const handleVersionTap = () => {
    versionTaps.current += 1
    if (versionTaps.current >= 5) {
      versionTaps.current = 0
      router.push('/debug')
    }
  }

  const reminderValue = formatSettingsTime(defaultReminderTime)

  return (
    <View style={styles.root}>
      <ScreenHeader style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </ScreenHeader>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.premiumCard}>
          <View>
            <Text style={styles.premiumLabel}>{isPremium ? 'Forged Premium' : 'Forged Free'}</Text>
            <Text style={[styles.premiumSub, isPremium && styles.premiumSubUnlocked]}>
              {isPremium ? 'All features unlocked' : `Up to ${FREE_HABIT_LIMIT} habits`}
            </Text>
          </View>
          {!isPremium && (
            <Pressable style={styles.premiumCta} onPress={() => router.push('/paywall')}>
              <Text style={styles.premiumCtaText}>Unlock All ⚒️</Text>
            </Pressable>
          )}
        </View>

        <SettingsSection title="Habits">
          <SettingsRow
            label="Manage habits"
            onPress={() => Alert.alert(
              'Managing Habits',
              'To edit or delete a habit, long-press it on the Today or Progress page.',
              [{ text: 'Got it' }],
            )}
          />
          <SettingsRow
            label="Default reminder time"
            value={reminderValue}
            onPress={() => setShowTimePicker(true)}
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsToggleRow
            label="Daily reminders"
            value={dailyReminders}
            onChange={(v) => handleNotifChange('dailyReminders', v)}
          />
          <SettingsToggleRow
            label="Streak alerts"
            value={streakAlerts}
            onChange={(v) => handleNotifChange('streakAlerts', v)}
          />
          <SettingsToggleRow
            label="Milestone celebrations"
            value={milestoneCelebrations}
            onChange={(v) => handleNotifChange('milestoneCelebrations', v)}
          />
        </SettingsSection>

        <SettingsSection title="Appearance">
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Theme</Text>
            <ThemeToggle value={themeMode} onChange={handleThemeChange} />
          </View>
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow label="Rate Forged" />
          <SettingsRow label="Privacy Policy" onPress={() => router.push('/legal/privacy')} />
          <SettingsRow label="Terms of Service" onPress={() => router.push('/legal/terms')} />
          <SettingsRow label="Version" value="1.0.0" chevron={false} onPress={handleVersionTap} />
        </SettingsSection>

        <SettingsSection title="Data">
          <SettingsRow label="Export data" />
          <SettingsRow label="Delete all data" destructive chevron={false} />
        </SettingsSection>

      </ScrollView>

      {showTimePicker && Platform.OS === 'ios' && (
        <DateTimePicker
          value={defaultReminderTime}
          mode="time"
          display="spinner"
          onChange={(_, date) => {
            setShowTimePicker(false)
            if (date) handleReminderTimeChange(date)
          }}
        />
      )}

      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={defaultReminderTime}
          mode="time"
          display="default"
          onChange={(_, date) => {
            setShowTimePicker(false)
            if (date) handleReminderTimeChange(date)
          }}
        />
      )}
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
  premiumSubUnlocked: {
    color: theme.colors.successLight,
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
