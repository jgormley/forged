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

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface CompletionsState {
  // All completions loaded for the current habit/stats context
  completions: Completion[]
  // Set of habit IDs completed today — drives the Today view UI
  completedTodayIds: Set<string>
  isLoading: boolean

  /** Load all completions for a specific habit (for stats / detail screen) */
  loadForHabit: (habitId: string) => Promise<void>
  /** Load today's completions for all habits (called on Today view mount) */
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
        return { completedTodayIds: next }
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
