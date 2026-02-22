import { create } from 'zustand'
import { eq, gte, and } from 'drizzle-orm'
import { db } from '@/db/client'
import { completions } from '@/db/schema'
import type { Completion, NewCompletion } from '@/db/schema'
import { randomUUID } from 'expo-crypto'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStart(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function daysAgo(n: number): Date {
  const d = todayStart()
  d.setDate(d.getDate() - n)
  return d
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface CompletionsState {
  /**
   * All completions loaded for the current context.
   * Populated by loadAll() for the Today view, or loadForHabit() for the
   * detail screen.
   */
  completions: Completion[]
  /** Quick lookup set — which habit IDs are completed today. */
  completedTodayIds: Set<string>
  isLoading: boolean

  /**
   * Load all completions within a rolling window (default 90 days).
   * Call this on Today view mount; covers streak + 7-day dot calculation.
   */
  loadAll: (windowDays?: number) => Promise<void>
  /** Load all completions for a specific habit (for stats / detail screen) */
  loadForHabit: (habitId: string) => Promise<void>
  /** Load today's completions for all habits */
  loadToday: () => Promise<void>
  /**
   * Toggle a habit's completion for today.
   * Returns the new completion if added, or null if removed.
   */
  toggle: (habitId: string) => Promise<Completion | null>
}

export const useCompletionsStore = create<CompletionsState>((set, get) => ({
  completions: [],
  completedTodayIds: new Set(),
  isLoading: false,

  loadAll: async (windowDays = 90) => {
    set({ isLoading: true })
    try {
      const since = daysAgo(windowDays)
      const rows = await db
        .select()
        .from(completions)
        .where(gte(completions.completedAt, since))
        .orderBy(completions.completedAt)
      const ids = new Set(
        rows.filter((r) => toDateKey(r.completedAt) === toDateKey(new Date())).map((r) => r.habitId)
      )
      set({ completions: rows, completedTodayIds: ids, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  loadToday: async () => {
    set({ isLoading: true })
    try {
      const rows = await db
        .select()
        .from(completions)
        .where(gte(completions.completedAt, todayStart()))
      const ids = new Set(rows.map((r) => r.habitId))
      set({ completedTodayIds: ids, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  loadForHabit: async (habitId) => {
    set({ isLoading: true })
    try {
      const rows = await db
        .select()
        .from(completions)
        .where(eq(completions.habitId, habitId))
        .orderBy(completions.completedAt)
      set({ completions: rows, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  toggle: async (habitId) => {
    const { completedTodayIds } = get()

    if (completedTodayIds.has(habitId)) {
      // Remove today's completion
      await db
        .delete(completions)
        .where(
          and(
            eq(completions.habitId, habitId),
            gte(completions.completedAt, todayStart()),
          ),
        )
      set((s) => {
        const next = new Set(s.completedTodayIds)
        next.delete(habitId)
        const todayKey = toDateKey(new Date())
        return {
          completedTodayIds: next,
          completions: s.completions.filter(
            (c) => !(c.habitId === habitId && toDateKey(c.completedAt) === todayKey)
          ),
        }
      })
      return null
    } else {
      // Add completion
      const newCompletion: NewCompletion = {
        id: randomUUID(),
        habitId,
        completedAt: new Date(),
        note: null,
      }
      await db.insert(completions).values(newCompletion)
      set((s) => ({
        completedTodayIds: new Set([...s.completedTodayIds, habitId]),
        completions: [...s.completions, newCompletion as Completion],
      }))
      return newCompletion as Completion
    }
  },
}))
