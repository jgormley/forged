import { useMemo } from 'react'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { completions } from '@/db/schema'
import { getCompletionRate, type FrequencyConfig } from '@/utils/streak'

interface CompletionRateResult {
  rate: number        // 0.0 – 1.0
  ratePercent: number // 0 – 100, rounded
}

export function useCompletionRate(
  habitId: string,
  frequency: FrequencyConfig,
  windowDays: 7 | 30 | 90 = 30,
): CompletionRateResult {
  const { data } = useLiveQuery(
    db.select().from(completions).where(eq(completions.habitId, habitId)),
  )

  const rate = useMemo(() => {
    const dates = (data ?? []).map((c) => new Date(c.completedAt))
    return getCompletionRate(dates, frequency, windowDays)
  }, [data, frequency, windowDays])

  return {
    rate,
    ratePercent: Math.round(rate * 100),
  }
}
