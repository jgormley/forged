import { create } from 'zustand'
import { eq, asc } from 'drizzle-orm'
import { db } from '@/db/client'
import { habits } from '@/db/schema'
import type { Habit, NewHabit, FrequencyConfig } from '@/db/schema'
import { randomUUID } from 'expo-crypto'
import {
  scheduleHabitReminders,
  cancelHabitReminders,
  rescheduleHabitReminders,
} from '@/utils/notifications'
import { posthog } from '@/analytics/posthog'

// ---------------------------------------------------------------------------
// Helpers — FrequencyConfig <-> JSON column
// ---------------------------------------------------------------------------

export function serializeFrequency(f: FrequencyConfig): string {
  return JSON.stringify(f)
}

export function deserializeFrequency(json: string): FrequencyConfig {
  return JSON.parse(json) as FrequencyConfig
}

// Extend the raw DB row with a parsed frequency field
export type HabitWithFrequency = Omit<Habit, 'frequencyJson'> & {
  frequency: FrequencyConfig
}

function toHabitWithFrequency(raw: Habit): HabitWithFrequency {
  const { frequencyJson, ...rest } = raw
  return { ...rest, frequency: deserializeFrequency(frequencyJson) }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface HabitsState {
  habits: HabitWithFrequency[]
  isLoading: boolean
  error: string | null

  load: () => Promise<void>
  add: (input: {
    name: string
    icon: string
    color: string
    category: Habit['category']
    frequency: FrequencyConfig
    reminderTime?: string | null
  }) => Promise<HabitWithFrequency>
  update: (
    id: string,
    changes: Partial<{
      name: string
      icon: string
      color: string
      category: Habit['category']
      frequency: FrequencyConfig
      reminderTime: string | null
      sortOrder: number
    }>,
  ) => Promise<void>
  remove: (id: string) => Promise<void>
  archive: (id: string) => Promise<void>
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null })
    try {
      const rows = await db
        .select()
        .from(habits)
        .where(eq(habits.isArchived, false))
        .orderBy(asc(habits.sortOrder), asc(habits.createdAt))
      set({ habits: rows.map(toHabitWithFrequency), isLoading: false })
    } catch (e) {
      set({ error: String(e), isLoading: false })
    }
  },

  add: async ({ name, icon, color, category, frequency, reminderTime = null }) => {
    const newRow: NewHabit = {
      id: randomUUID(),
      name,
      icon,
      color,
      category,
      frequencyJson: serializeFrequency(frequency),
      reminderTime,
      createdAt: new Date(),
      isArchived: false,
      sortOrder: get().habits.length,
    }
    await db.insert(habits).values(newRow)
    const habit = toHabitWithFrequency(newRow as Habit)
    set((s) => ({ habits: [...s.habits, habit] }))
    scheduleHabitReminders(habit)
    posthog.capture('habit_created', {
      habit_id: habit.id,
      category: habit.category,
      frequency_type: habit.frequency.type,
      has_reminder: !!habit.reminderTime,
    })
    return habit
  },

  update: async (id, changes) => {
    const dbChanges: Partial<NewHabit> = { ...changes }
    if (changes.frequency !== undefined) {
      dbChanges.frequencyJson = serializeFrequency(changes.frequency)
      delete (dbChanges as Record<string, unknown>).frequency
    }
    await db.update(habits).set(dbChanges).where(eq(habits.id, id))
    set((s) => ({
      habits: s.habits.map((h) =>
        h.id === id ? { ...h, ...changes } : h,
      ),
    }))
    if (changes.reminderTime !== undefined || changes.frequency !== undefined) {
      const updated = get().habits.find((h) => h.id === id)
      if (updated) rescheduleHabitReminders(updated)
    }
  },

  remove: async (id) => {
    await db.delete(habits).where(eq(habits.id, id))
    set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }))
    cancelHabitReminders(id)
    posthog.capture('habit_deleted', { habit_id: id })
  },

  archive: async (id) => {
    await db.update(habits).set({ isArchived: true }).where(eq(habits.id, id))
    set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }))
  },
}))
