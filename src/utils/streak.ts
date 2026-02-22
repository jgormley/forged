export type FrequencyConfig =
  | { type: 'daily' }
  | { type: 'daysOfWeek'; days: number[] } // 0=Sun, 1=Mon, ..., 6=Sat
  | { type: 'xPerWeek'; count: number }

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Returns "YYYY-MM-DD" using local time. Lexicographic sort == chronological. */
function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Returns the Sunday that starts the week containing `date`. */
function startOfWeek(date: Date): Date {
  const d = startOfDay(date)
  d.setDate(d.getDate() - d.getDay())
  return d
}

function countCompletionsInWeek(keys: Set<string>, weekStart: Date): number {
  let count = 0
  for (let i = 0; i < 7; i++) {
    if (keys.has(toDateKey(addDays(weekStart, i)))) count++
  }
  return count
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

export function isScheduledDay(date: Date, frequency: FrequencyConfig): boolean {
  switch (frequency.type) {
    case 'daily':
      return true
    case 'daysOfWeek':
      return frequency.days.includes(date.getDay())
    case 'xPerWeek':
      return true
  }
}

export function getScheduledDaysInWindow(
  frequency: FrequencyConfig,
  startDate: Date,
  endDate: Date,
): Date[] {
  const result: Date[] = []
  let current = startOfDay(startDate)
  const end = startOfDay(endDate)
  while (current <= end) {
    if (isScheduledDay(current, frequency)) result.push(new Date(current))
    current = addDays(current, 1)
  }
  return result
}

export function calculateCurrentStreak(
  completions: Date[],
  frequency: FrequencyConfig,
  today: Date,
): number {
  if (completions.length === 0) return 0

  const keys = new Set(completions.map(toDateKey))

  if (frequency.type === 'xPerWeek') {
    return currentStreakXPerWeek(keys, frequency.count, today)
  }

  // Earliest completion key used as a loop terminator
  const earliest = toDateKey(
    [...completions].sort((a, b) => a.getTime() - b.getTime())[0],
  )

  // If today is a scheduled day that's not yet completed, skip it —
  // the streak is still alive, today is just "pending"
  let cursor = startOfDay(today)
  if (isScheduledDay(cursor, frequency) && !keys.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1)
  }

  let streak = 0
  while (toDateKey(cursor) >= earliest) {
    if (!isScheduledDay(cursor, frequency)) {
      cursor = addDays(cursor, -1)
      continue
    }
    if (keys.has(toDateKey(cursor))) {
      streak++
      cursor = addDays(cursor, -1)
    } else {
      break
    }
  }
  return streak
}

function currentStreakXPerWeek(
  keys: Set<string>,
  required: number,
  today: Date,
): number {
  let weekStart = startOfWeek(today)
  // If the current week hasn't met the goal yet, start checking from last week
  if (countCompletionsInWeek(keys, weekStart) < required) {
    weekStart = addDays(weekStart, -7)
  }
  let streak = 0
  while (true) {
    if (countCompletionsInWeek(keys, weekStart) >= required) {
      streak++
      weekStart = addDays(weekStart, -7)
    } else {
      break
    }
    if (streak > 520) break // safety: 10 years
  }
  return streak
}

export function calculateLongestStreak(
  completions: Date[],
  frequency: FrequencyConfig,
): number {
  if (completions.length === 0) return 0

  const keys = new Set(completions.map(toDateKey))
  const sorted = [...completions].sort((a, b) => a.getTime() - b.getTime())

  if (frequency.type === 'xPerWeek') {
    return longestStreakXPerWeek(keys, frequency.count, sorted[0], sorted[sorted.length - 1])
  }

  // Walk every scheduled day from earliest to latest completion
  const scheduled = getScheduledDaysInWindow(frequency, sorted[0], sorted[sorted.length - 1])
  let longest = 0
  let current = 0
  for (const day of scheduled) {
    if (keys.has(toDateKey(day))) {
      current++
      if (current > longest) longest = current
    } else {
      current = 0
    }
  }
  return longest
}

function longestStreakXPerWeek(
  keys: Set<string>,
  required: number,
  earliest: Date,
  latest: Date,
): number {
  let weekStart = startOfWeek(earliest)
  const lastWeek = startOfWeek(latest)
  let longest = 0
  let current = 0
  while (weekStart <= lastWeek) {
    if (countCompletionsInWeek(keys, weekStart) >= required) {
      current++
      if (current > longest) longest = current
    } else {
      current = 0
    }
    weekStart = addDays(weekStart, 7)
  }
  return longest
}

export function isStreakAtRisk(
  lastCompletion: Date | null,
  frequency: FrequencyConfig,
  now: Date,
): boolean {
  const today = startOfDay(now)
  if (!isScheduledDay(today, frequency)) return false
  if (lastCompletion === null) return true
  return toDateKey(lastCompletion) !== toDateKey(today)
}

export function getCompletionRate(
  completions: Date[],
  frequency: FrequencyConfig,
  windowDays: number,
  today: Date = new Date(),
): number {
  const end = startOfDay(today)
  const start = addDays(end, -(windowDays - 1))
  const scheduled = getScheduledDaysInWindow(frequency, start, end)
  if (scheduled.length === 0) return 0
  const keys = new Set(completions.map(toDateKey))
  const completed = scheduled.filter((d) => keys.has(toDateKey(d))).length
  return completed / scheduled.length
}
