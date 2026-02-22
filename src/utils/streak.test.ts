/** @jest-environment node */
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  getCompletionRate,
  getScheduledDaysInWindow,
  isScheduledDay,
  isStreakAtRisk,
  type FrequencyConfig,
} from './streak'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a Date at midnight local time from a YYYY-MM-DD string */
function d(dateStr: string): Date {
  const [y, m, day] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, day, 0, 0, 0, 0)
}

/** Build an array of consecutive daily completion dates */
function dailyRange(start: string, end: string): Date[] {
  const result: Date[] = []
  let current = d(start)
  const last = d(end)
  while (current <= last) {
    result.push(new Date(current))
    current = new Date(current)
    current.setDate(current.getDate() + 1)
  }
  return result
}

const DAILY: FrequencyConfig = { type: 'daily' }
const MON_WED_FRI: FrequencyConfig = { type: 'daysOfWeek', days: [1, 3, 5] }
const THREE_PER_WEEK: FrequencyConfig = { type: 'xPerWeek', count: 3 }

// ---------------------------------------------------------------------------
// isScheduledDay
// ---------------------------------------------------------------------------

describe('isScheduledDay', () => {
  test('daily: every day is scheduled', () => {
    expect(isScheduledDay(d('2025-01-01'), DAILY)).toBe(true) // Wednesday
    expect(isScheduledDay(d('2025-01-05'), DAILY)).toBe(true) // Sunday
  })

  test('daysOfWeek: only matching days are scheduled', () => {
    // 2025-01-06 is Monday (1), 2025-01-07 is Tuesday (2), 2025-01-08 is Wednesday (3)
    expect(isScheduledDay(d('2025-01-06'), MON_WED_FRI)).toBe(true)  // Mon
    expect(isScheduledDay(d('2025-01-07'), MON_WED_FRI)).toBe(false) // Tue
    expect(isScheduledDay(d('2025-01-08'), MON_WED_FRI)).toBe(true)  // Wed
  })

  test('xPerWeek: every day is scheduled', () => {
    expect(isScheduledDay(d('2025-01-06'), THREE_PER_WEEK)).toBe(true)
    expect(isScheduledDay(d('2025-01-11'), THREE_PER_WEEK)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// calculateCurrentStreak — daily
// ---------------------------------------------------------------------------

describe('calculateCurrentStreak — daily', () => {
  test('no completions returns 0', () => {
    expect(calculateCurrentStreak([], DAILY, d('2025-01-10'))).toBe(0)
  })

  test('only today completed returns 1', () => {
    expect(calculateCurrentStreak([d('2025-01-10')], DAILY, d('2025-01-10'))).toBe(1)
  })

  test('5 consecutive days returns 5', () => {
    const completions = dailyRange('2025-01-06', '2025-01-10')
    expect(calculateCurrentStreak(completions, DAILY, d('2025-01-10'))).toBe(5)
  })

  test('gap in the middle breaks streak — only counts from gap to today', () => {
    const completions = [
      ...dailyRange('2025-01-01', '2025-01-05'),
      ...dailyRange('2025-01-08', '2025-01-10'),
    ]
    expect(calculateCurrentStreak(completions, DAILY, d('2025-01-10'))).toBe(3)
  })

  test("today not completed — streak continues from yesterday (today is 'pending')", () => {
    const completions = dailyRange('2025-01-06', '2025-01-09')
    // today is Jan 10, not completed — streak is still 4 from yesterday
    expect(calculateCurrentStreak(completions, DAILY, d('2025-01-10'))).toBe(4)
  })

  test('long break then comeback — only counts recent streak', () => {
    const completions = [
      ...dailyRange('2024-01-01', '2024-01-10'), // old streak of 10
      ...dailyRange('2025-01-08', '2025-01-10'), // new streak of 3
    ]
    expect(calculateCurrentStreak(completions, DAILY, d('2025-01-10'))).toBe(3)
  })

  test('first-ever completion today returns 1', () => {
    expect(calculateCurrentStreak([d('2025-06-15')], DAILY, d('2025-06-15'))).toBe(1)
  })

  test('completion at 11:59 PM and next at 12:01 AM are different days', () => {
    const lateNight = new Date(2025, 0, 9, 23, 59, 59) // Jan 9 11:59 PM
    const earlyMorn = new Date(2025, 0, 10, 0, 0, 1)   // Jan 10 12:00 AM
    expect(calculateCurrentStreak([lateNight, earlyMorn], DAILY, d('2025-01-10'))).toBe(2)
  })

  test('leap year — Feb 28 and Feb 29 are consecutive', () => {
    // 2024 is a leap year
    const completions = dailyRange('2024-02-27', '2024-02-29')
    expect(calculateCurrentStreak(completions, DAILY, d('2024-02-29'))).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// calculateCurrentStreak — daysOfWeek
// ---------------------------------------------------------------------------

describe('calculateCurrentStreak — daysOfWeek', () => {
  // MON_WED_FRI = days [1, 3, 5]

  test('non-scheduled days do not break the streak', () => {
    // Completed Mon Jan 6, Wed Jan 8, Fri Jan 10 — no Tue/Thu completions
    const completions = [d('2025-01-06'), d('2025-01-08'), d('2025-01-10')]
    expect(calculateCurrentStreak(completions, MON_WED_FRI, d('2025-01-10'))).toBe(3)
  })

  test('missing a scheduled day breaks the streak', () => {
    // Completed Mon Jan 6, Fri Jan 10 — missed Wed Jan 8
    const completions = [d('2025-01-06'), d('2025-01-10')]
    expect(calculateCurrentStreak(completions, MON_WED_FRI, d('2025-01-10'))).toBe(1)
  })

  test("today (a scheduled day) not completed — counts from yesterday's scheduled day", () => {
    // Completed Mon Jan 6, Wed Jan 8. Today is Fri Jan 10 (not yet done).
    const completions = [d('2025-01-06'), d('2025-01-08')]
    expect(calculateCurrentStreak(completions, MON_WED_FRI, d('2025-01-10'))).toBe(2)
  })

  test('today is not a scheduled day — counts from last scheduled day', () => {
    // Today is Tue Jan 7. Last scheduled day was Mon Jan 6 (completed).
    const completions = [d('2025-01-06')]
    expect(calculateCurrentStreak(completions, MON_WED_FRI, d('2025-01-07'))).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// calculateCurrentStreak — xPerWeek
// ---------------------------------------------------------------------------

describe('calculateCurrentStreak — xPerWeek', () => {
  test('3/3 completions in a week counts as streak of 1', () => {
    // Week: Jan 5 (Sun) - Jan 11 (Sat). Completed Mon, Wed, Fri.
    const completions = [d('2025-01-06'), d('2025-01-08'), d('2025-01-10')]
    expect(calculateCurrentStreak(completions, THREE_PER_WEEK, d('2025-01-10'))).toBe(1)
  })

  test('2/3 completions in the only week returns 0', () => {
    const completions = [d('2025-01-06'), d('2025-01-08')]
    expect(calculateCurrentStreak(completions, THREE_PER_WEEK, d('2025-01-10'))).toBe(0)
  })

  test('current week already met goal — includes current week in streak', () => {
    // Last week: Jan 5-11 — completed 3x. This week: Jan 12-18 — already 3x by Jan 14.
    const completions = [
      d('2025-01-06'), d('2025-01-08'), d('2025-01-10'), // last week
      d('2025-01-12'), d('2025-01-13'), d('2025-01-14'), // this week
    ]
    expect(calculateCurrentStreak(completions, THREE_PER_WEEK, d('2025-01-15'))).toBe(2)
  })

  test('current week not yet met — counts from last week', () => {
    // Last week: 3 completions. This week: only 1 so far.
    const completions = [
      d('2025-01-06'), d('2025-01-08'), d('2025-01-10'), // last week: ✓
      d('2025-01-13'),                                    // this week: 1/3
    ]
    expect(calculateCurrentStreak(completions, THREE_PER_WEEK, d('2025-01-15'))).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// calculateLongestStreak
// ---------------------------------------------------------------------------

describe('calculateLongestStreak', () => {
  test('empty completions returns 0', () => {
    expect(calculateLongestStreak([], DAILY)).toBe(0)
  })

  test('single completion returns 1', () => {
    expect(calculateLongestStreak([d('2025-01-10')], DAILY)).toBe(1)
  })

  test('multiple broken streaks returns the longest', () => {
    const completions = [
      ...dailyRange('2025-01-01', '2025-01-05'), // streak of 5
      ...dailyRange('2025-01-10', '2025-01-17'), // streak of 8
      ...dailyRange('2025-01-25', '2025-01-27'), // streak of 3
    ]
    expect(calculateLongestStreak(completions, DAILY)).toBe(8)
  })

  test('daysOfWeek: counts only scheduled days for longest streak', () => {
    // Mon Jan 6, Wed Jan 8, Fri Jan 10 → 3 consecutive scheduled days
    // Gap: missed Mon Jan 13
    // Wed Jan 15, Fri Jan 17 → 2 consecutive
    const completions = [
      d('2025-01-06'), d('2025-01-08'), d('2025-01-10'),
      d('2025-01-15'), d('2025-01-17'),
    ]
    expect(calculateLongestStreak(completions, MON_WED_FRI)).toBe(3)
  })

  test('xPerWeek: longest consecutive weeks meeting goal', () => {
    const completions = [
      // Week 1 (Jan 5-11): 3 completions ✓
      d('2025-01-06'), d('2025-01-07'), d('2025-01-08'),
      // Week 2 (Jan 12-18): 2 completions ✗
      d('2025-01-13'), d('2025-01-14'),
      // Week 3 (Jan 19-25): 3 completions ✓
      d('2025-01-20'), d('2025-01-21'), d('2025-01-22'),
      // Week 4 (Jan 26 - Feb 1): 4 completions ✓
      d('2025-01-27'), d('2025-01-28'), d('2025-01-29'), d('2025-01-30'),
    ]
    expect(calculateLongestStreak(completions, THREE_PER_WEEK)).toBe(2) // weeks 3+4
  })
})

// ---------------------------------------------------------------------------
// isStreakAtRisk
// ---------------------------------------------------------------------------

describe('isStreakAtRisk', () => {
  test('scheduled today, not completed → at risk', () => {
    expect(isStreakAtRisk(null, DAILY, d('2025-01-10'))).toBe(true)
  })

  test('scheduled today, last completion was yesterday → at risk', () => {
    expect(isStreakAtRisk(d('2025-01-09'), DAILY, d('2025-01-10'))).toBe(true)
  })

  test('scheduled today, already completed today → not at risk', () => {
    const completedAt = new Date(2025, 0, 10, 8, 30) // Jan 10 at 8:30 AM
    expect(isStreakAtRisk(completedAt, DAILY, d('2025-01-10'))).toBe(false)
  })

  test('not scheduled today → not at risk', () => {
    // Jan 7 is Tuesday (2) — not in MON_WED_FRI
    expect(isStreakAtRisk(null, MON_WED_FRI, d('2025-01-07'))).toBe(false)
  })

  test('daysOfWeek: scheduled day not completed → at risk', () => {
    // Jan 6 is Monday (1) — scheduled
    expect(isStreakAtRisk(d('2025-01-03'), MON_WED_FRI, d('2025-01-06'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// getCompletionRate
// ---------------------------------------------------------------------------

describe('getCompletionRate', () => {
  test('perfect completion over 7 days returns 1.0', () => {
    const today = d('2025-01-10')
    const completions = dailyRange('2025-01-04', '2025-01-10') // 7 days
    expect(getCompletionRate(completions, DAILY, 7, today)).toBe(1)
  })

  test('no completions returns 0.0', () => {
    expect(getCompletionRate([], DAILY, 30, d('2025-01-10'))).toBe(0)
  })

  test('half completions returns 0.5', () => {
    const today = d('2025-01-10')
    // 7-day window: Jan 4–10. Complete every other day: Jan 4, 6, 8, 10 = 4/7
    const completions = [d('2025-01-04'), d('2025-01-06'), d('2025-01-08'), d('2025-01-10')]
    const rate = getCompletionRate(completions, DAILY, 7, today)
    expect(rate).toBeCloseTo(4 / 7)
  })

  test('daysOfWeek: only counts scheduled days in window', () => {
    // 7-day window Jan 4 (Sat) – Jan 10 (Fri). MON_WED_FRI → Mon Jan 6, Wed Jan 8, Fri Jan 10 = 3 scheduled
    const today = d('2025-01-10')
    const completions = [d('2025-01-06'), d('2025-01-08')] // 2/3 scheduled
    const rate = getCompletionRate(completions, MON_WED_FRI, 7, today)
    expect(rate).toBeCloseTo(2 / 3)
  })
})

// ---------------------------------------------------------------------------
// getScheduledDaysInWindow
// ---------------------------------------------------------------------------

describe('getScheduledDaysInWindow', () => {
  test('daily: returns every day in the window', () => {
    const days = getScheduledDaysInWindow(DAILY, d('2025-01-06'), d('2025-01-10'))
    expect(days).toHaveLength(5)
  })

  test('daysOfWeek: returns only matching days', () => {
    // Jan 6 (Mon) to Jan 12 (Sun) — Mon, Wed, Fri = Jan 6, 8, 10
    const days = getScheduledDaysInWindow(MON_WED_FRI, d('2025-01-06'), d('2025-01-12'))
    expect(days).toHaveLength(3)
    expect(days[0].getDate()).toBe(6)  // Mon
    expect(days[1].getDate()).toBe(8)  // Wed
    expect(days[2].getDate()).toBe(10) // Fri
  })

  test('start == end returns single day if scheduled', () => {
    const days = getScheduledDaysInWindow(DAILY, d('2025-01-10'), d('2025-01-10'))
    expect(days).toHaveLength(1)
  })

  test('xPerWeek: returns every day (any day counts)', () => {
    const days = getScheduledDaysInWindow(THREE_PER_WEEK, d('2025-01-06'), d('2025-01-10'))
    expect(days).toHaveLength(5)
  })
})
