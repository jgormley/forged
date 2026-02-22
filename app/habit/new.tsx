import {
  View, Text, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Modal,
} from 'react-native'
import { Pressable } from '@/components/Pressable'
import { useState, useCallback } from 'react'
import { router } from 'expo-router'
import { StyleSheet } from 'react-native-unistyles'
import { useHabitsStore } from '@/stores/habitsStore'
import { HabitCard } from '@/components/HabitCard'
import type { FrequencyConfig } from '@/utils/streak'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const EMOJI_QUICKPICKS = ['🏃', '🏋️', '🧘', '💧', '🥗', '😴', '📚', '🎨']

const ALL_EMOJIS = [
  // Fitness & Movement
  '🏃', '🏋️', '🧘', '🚴', '🏊', '🤸', '⛹️', '🏄', '🧗', '🤾',
  '🥊', '🏓', '🏸', '⛷️', '🏂', '🛹', '🚵', '🤼', '🤺', '🎽',
  // Health & Nutrition
  '💧', '🥗', '🍎', '🥦', '🫐', '🥕', '🍵', '💊', '😴', '🌙',
  '🛁', '🧴', '💆', '🌿', '🦷', '🫀', '🩺', '❤️', '🫁', '🥑',
  // Mind & Focus
  '📚', '✍️', '💻', '🎯', '🧠', '📝', '📖', '🔬', '🎓', '💡',
  '🧩', '♟️', '✏️', '📐', '🔭', '📊', '🗓️', '📌', '📋', '🖊️',
  // Creative & Music
  '🎨', '🎵', '🎹', '🎸', '🎺', '🎻', '🥁', '🎭', '🎬', '📷',
  // Lifestyle
  '🌅', '🌻', '🌱', '🏡', '🐾', '🌍', '♻️', '🧹', '🪴', '🤝',
  '💰', '✈️', '☕', '🫖', '🕯️', '🧺', '🛠️', '🔑', '💬', '🎮',
  // Symbols
  '⭐', '🔥', '💪', '🏆', '🎖️', '✅', '⚡', '🌟', '💎', '🚀',
]

const HABIT_COLORS = [
  '#C8A84B', '#4A6741', '#89B4C8', '#D4897A', '#C4874A',
  '#6B8F61', '#8B5A2B', '#9B7A28', '#4A5568', '#8FA882',
]

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const EMPTY_WEEK = [false, false, false, false, false, false, false]

type FreqType = 'daily' | 'daysOfWeek' | 'xPerWeek'

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function NewHabitScreen() {
  const add = useHabitsStore((s) => s.add)

  const [name,         setName]         = useState('')
  const [icon,         setIcon]         = useState(EMOJI_QUICKPICKS[0])
  const [color,        setColor]        = useState(HABIT_COLORS[0])
  const [freqType,     setFreqType]     = useState<FreqType>('daily')
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [xPerWeek,     setXPerWeek]     = useState(3)
  const [saving,       setSaving]       = useState(false)
  const [pickerOpen,   setPickerOpen]   = useState(false)

  const canSave =
    name.trim().length > 0 &&
    (freqType !== 'daysOfWeek' || selectedDays.length > 0)

  // Is the current icon one of the quick picks? Drives [+] appearance.
  const isQuickPick = EMOJI_QUICKPICKS.includes(icon)

  const toggleDay = useCallback((day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    )
  }, [])

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      const frequency: FrequencyConfig =
        freqType === 'daily'
          ? { type: 'daily' }
          : freqType === 'daysOfWeek'
            ? { type: 'daysOfWeek', days: selectedDays }
            : { type: 'xPerWeek', count: xPerWeek }
      await add({ name: name.trim(), icon, color, category: 'custom', frequency })
      router.back()
    } finally {
      setSaving(false)
    }
  }, [canSave, saving, freqType, selectedDays, xPerWeek, name, icon, color, add])

  // isCompleted=true so the color fill is visible in the preview
  const preview = {
    id:           '__preview__',
    name:         name.trim() || 'Your new habit',
    icon,
    color,
    category:     'custom' as const,
    frequency:    { type: 'daily' } as FrequencyConfig,
    reminderTime: null as string | null,
    createdAt:    new Date(),
    isArchived:   false,
    sortOrder:    0,
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.root}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.dragHandle} />
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={styles.cancelBtn}>Cancel</Text>
            </Pressable>
            <Text style={styles.headerTitle}>New Habit</Text>
            <Pressable onPress={handleSave} disabled={!canSave || saving} hitSlop={12}>
              <Text style={[styles.createBtn, (!canSave || saving) && styles.createBtnDisabled]}>
                {saving ? 'Saving…' : 'Create'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── Form ── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Live preview — isCompleted=true so habit color is visible */}
          <View pointerEvents="none" style={styles.previewWrap}>
            <HabitCard
              habit={preview}
              isCompleted={true}
              streak={0}
              weekDots={EMPTY_WEEK}
              onToggle={() => {}}
            />
          </View>

          {/* ── Name ── */}
          <Text style={styles.sectionLabel}>Habit name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Morning run"
            placeholderTextColor="rgba(44,36,22,0.30)"
            maxLength={40}
            returnKeyType="done"
            autoFocus
          />

          {/* ── Frequency ── */}
          <Text style={styles.sectionLabel}>Frequency</Text>
          <View style={styles.segmentRow}>
            {(['daily', 'daysOfWeek', 'xPerWeek'] as FreqType[]).map((t) => {
              const active = freqType === t
              const label  = t === 'daily' ? 'Daily' : t === 'daysOfWeek' ? 'Days' : 'Weekly'
              return (
                <Pressable
                  key={t}
                  onPress={() => setFreqType(t)}
                  style={[styles.segBtn, active && { backgroundColor: color }]}
                >
                  <Text style={[styles.segLabel, active && styles.segLabelActive]}>{label}</Text>
                </Pressable>
              )
            })}
          </View>

          {freqType === 'daysOfWeek' && (
            <View style={styles.daysRow}>
              {DAYS_SHORT.map((d, i) => {
                const active = selectedDays.includes(i)
                return (
                  <Pressable
                    key={i}
                    onPress={() => toggleDay(i)}
                    style={[styles.dayBtn, active && { backgroundColor: color, borderColor: color }]}
                  >
                    <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{d}</Text>
                  </Pressable>
                )
              })}
            </View>
          )}

          {freqType === 'xPerWeek' && (
            <View style={styles.stepper}>
              <Pressable
                onPress={() => setXPerWeek((n) => Math.max(1, n - 1))}
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </Pressable>
              <Text style={[styles.stepValue, { color }]}>{xPerWeek}× per week</Text>
              <Pressable
                onPress={() => setXPerWeek((n) => Math.min(6, n + 1))}
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </Pressable>
            </View>
          )}

          {/* ── Icon ── */}
          <Text style={styles.sectionLabel}>Icon</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emojiRow}
          >
            {/* [+] opens the full picker; shows selected emoji if not a quick pick */}
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={[styles.emojiBtn, !isQuickPick && { borderColor: color }]}
            >
              {isQuickPick
                ? <Text style={styles.emojiBtnPlusText}>+</Text>
                : <Text style={styles.emojiText}>{icon}</Text>
              }
            </Pressable>

            {EMOJI_QUICKPICKS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setIcon(e)}
                style={[styles.emojiBtn, e === icon && { borderColor: color }]}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* ── Color ── */}
          <Text style={styles.sectionLabel}>Color</Text>
          <View style={styles.colorRow}>
            {HABIT_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[styles.colorDot, { backgroundColor: c }, c === color && styles.colorDotSelected]}
              />
            ))}
          </View>

          {/* ── Bottom CTA ── */}
          <Pressable
            onPress={handleSave}
            disabled={!canSave || saving}
            style={[styles.cta, canSave && { backgroundColor: color, borderColor: 'transparent' }]}
          >
            <Text style={[styles.ctaText, canSave && styles.ctaTextEnabled]}>
              {saving ? 'Creating…' : 'Create Habit'}
            </Text>
          </Pressable>

        </ScrollView>
      </View>

      {/* ── Full Emoji Picker Modal ── */}
      <Modal
        visible={pickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.pickerRoot}>
          <View style={styles.pickerHeader}>
            <View style={styles.dragHandle} />
            <View style={styles.pickerHeaderRow}>
              <Text style={styles.pickerTitle}>Choose an icon</Text>
              <Pressable onPress={() => setPickerOpen(false)} hitSlop={12}>
                <Text style={styles.pickerDone}>Done</Text>
              </Pressable>
            </View>
          </View>
          <ScrollView
            contentContainerStyle={styles.pickerGrid}
            showsVerticalScrollIndicator={false}
          >
            {ALL_EMOJIS.map((e) => (
              // Each item fills exactly 1/5 of the grid width for even distribution
              // on any screen size (iOS and Android). The border stays on the inner
              // button so selection indicators are visually consistent in size.
              <Pressable
                key={e}
                onPress={() => { setIcon(e); setPickerOpen(false) }}
                style={styles.pickerCell}
              >
                <View style={[styles.emojiBtnLarge, e === icon && { borderColor: color }]}>
                  <Text style={styles.emojiText}>{e}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme, rt) => ({
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
  cancelBtn: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.md,
    color: theme.colors.textSecondary,
  },
  headerTitle: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
  },
  createBtn: {
    fontFamily: theme.font.family.bodySemiBold,
    fontSize: theme.font.size.md,
    color: theme.colors.accent,
  },
  createBtnDisabled: {
    color: theme.colors.textTertiary,
  },

  // ── Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },

  // ── Preview
  previewWrap: {
    marginBottom: theme.spacing.sm,
  },

  // ── Section labels
  sectionLabel: {
    fontFamily: theme.font.family.bodySemiBold,
    fontSize: theme.font.size.xs,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },

  // ── Name input
  input: {
    fontFamily: theme.font.family.body,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },

  // ── Emoji row (horizontal scroll with quick picks + [+])
  // Gap of xs (4px) + button width of 40px → 9 items span ~388px on a 361px
  // viewport, ensuring the last emoji is visibly clipped to hint at scrollability.
  emojiRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingVertical: 2,
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Full-style button used in the picker modal grid (standalone View, not combined with emojiBtn)
  emojiBtnLarge: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  emojiBtnPlusText: {
    fontFamily: theme.font.family.bodyBold,
    fontSize: theme.font.size.lg,
    color: theme.colors.textSecondary,
    lineHeight: theme.font.size.lg * 1.2,
  },

  // ── Color row
  colorRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: theme.colors.text,
    transform: [{ scale: 1.2 }],
  },

  // ── Frequency segments
  segmentRow: {
    flexDirection: 'row',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    overflow: 'hidden',
  },
  segBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceRaised,
  },
  segLabel: {
    fontFamily: theme.font.family.bodyMedium,
    fontSize: theme.font.size.sm,
    color: theme.colors.textSecondary,
  },
  segLabelActive: {
    color: theme.colors.textInverse,
  },

  // ── Days-of-week picker
  daysRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  dayBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.surfaceRaised,
    alignItems: 'center',
  },
  dayLabel: {
    fontFamily: theme.font.family.bodyMedium,
    fontSize: theme.font.size.xs,
    color: theme.colors.textSecondary,
  },
  dayLabelActive: {
    color: '#FFFFFF',
  },

  // ── X-per-week stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    padding: theme.spacing.md,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontFamily: theme.font.family.bodyBold,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
    lineHeight: theme.font.size.lg * 1.3,
  },
  stepValue: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.xl,
    minWidth: 130,
    textAlign: 'center',
  },

  // ── Bottom CTA
  // Disabled: readable border + muted text on a visible surface.
  // Enabled: habit color background with inverse (white) text, no border.
  cta: {
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ctaText: {
    fontFamily: theme.font.family.displayMedium,
    fontSize: theme.font.size.md,
    color: theme.colors.textTertiary,
    letterSpacing: 0.3,
  },
  ctaTextEnabled: {
    color: theme.colors.textInverse,
  },

  // ── Full emoji picker modal
  pickerRoot: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  pickerHeader: {
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  pickerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerTitle: {
    fontFamily: theme.font.family.display,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
  },
  pickerDone: {
    fontFamily: theme.font.family.bodySemiBold,
    fontSize: theme.font.size.md,
    color: theme.colors.accent,
  },
  // Grid uses exactly 5 columns computed from screen width so rows fill
  // the full width evenly on every device (fixes iOS flex-wrap alignment).
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.sm,
    paddingBottom: theme.spacing.xxxl,
  },
  pickerCell: {
    width: (rt.screen.width - 2 * theme.spacing.sm) / 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
  },
}))
