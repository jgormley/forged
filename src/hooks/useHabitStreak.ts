import { useMemo } from 'react'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { completions } from '@/db/schema'
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  isStreakAtRisk,
  type FrequencyConfig,
} from '@/utils/streak'

interface HabitStreakResult {
  currentStreak: number
  longestStreak: number
  isAtRisk: boolean
  completionDates: Date[]
}

export function useHabitStreak(
  habitId: string,
  frequency: FrequencyConfig,
): HabitStreakResult {
  const { data } = useLiveQuery(
    db.select().from(completions).where(eq(completions.habitId, habitId)),
  )

  const completionDates = useMemo(
    () => (data ?? []).map((c) => new Date(c.completedAt)),
    [data],
  )

  const today = new Date()

  const currentStreak = useMemo(
    () => calculateCurrentStreak(completionDates, frequency, today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completionDates, frequency],
  )

  const longestStreak = useMemo(
    () => calculateLongestStreak(completionDates, frequency),
    [completionDates, frequency],
  )

  const isAtRisk = useMemo(() => {
    if (completionDates.length === 0) return isStreakAtRisk(null, frequency, today)
    const last = completionDates.reduce((a, b) => (a > b ? a : b))
    return isStreakAtRisk(last, frequency, today)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completionDates, frequency])

  return { currentStreak, longestStreak, isAtRisk, completionDates }
}
