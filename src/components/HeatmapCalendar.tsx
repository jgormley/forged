import { View, Text, ScrollView } from 'react-native'
import { useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native-unistyles'

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────────────────────────────────────

const CELL_SIZE = 11
const CELL_GAP  = 3
const CELL_STEP = CELL_SIZE + CELL_GAP  // 14px per column/row slot
const NUM_WEEKS = 53

const MONTH_ROW_H = CELL_STEP                         // 14px — space for month labels
const GRID_W      = NUM_WEEKS * CELL_STEP - CELL_GAP  // 739px
const GRID_H      = 7 * CELL_STEP - CELL_GAP          // 95px
const TOTAL_H     = MONTH_ROW_H + GRID_H              // 109px

const DAY_LABEL_W = 22

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
// Only show Mon, Wed, Fri to avoid clutter on the 7-row grid
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  return 4
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface HeatmapCalendarProps {
  /** YYYY-MM-DD → count of distinct habits completed that day */
  data: Map<string, number>
}

export function HeatmapCalendar({ data }: HeatmapCalendarProps) {
  const scrollRef = useRef<ScrollView>(null)
  const { weeks, monthLabels, today } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Anchor to the Sunday of the current week, then go back (NUM_WEEKS - 1)
    // weeks so the rightmost column is always the current week.
    const currentWeekSunday = new Date(today)
    currentWeekSunday.setDate(currentWeekSunday.getDate() - currentWeekSunday.getDay())
    const startDate = new Date(currentWeekSunday)
    startDate.setDate(startDate.getDate() - (NUM_WEEKS - 1) * 7)

    const weeks: Date[][] = []
    const monthLabels: Array<{ col: number; label: string }> = []
    const cursor = new Date(startDate)
    let prevMonth = -1

    for (let w = 0; w < NUM_WEEKS; w++) {
      const week: Date[] = []
      for (let d = 0; d < 7; d++) {
        week.push(new Date(cursor))
        cursor.setDate(cursor.getDate() + 1)
      }
      weeks.push(week)
      const m = week[0].getMonth()
      if (m !== prevMonth) {
        monthLabels.push({ col: w, label: MONTH_ABBR[m] })
        prevMonth = m
      }
    }

    return { weeks, monthLabels, today }
  }, [])

  const levelStyles = [styles.cellL0, styles.cellL1, styles.cellL2, styles.cellL3, styles.cellL4]

  return (
    <View style={styles.wrap}>
      <View style={styles.outer}>

        {/* Fixed day-of-week labels — outside the ScrollView so they don't scroll away */}
        <View style={styles.dayLabelCol}>
          {DAY_LABELS.map((label, i) => (
            <Text key={i} style={styles.dayLabel}>{label}</Text>
          ))}
        </View>

        {/* Horizontally scrollable calendar grid — starts scrolled to today (right end) */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {/* Fixed-size container so absolute children position correctly */}
          <View style={{ width: GRID_W, height: TOTAL_H }}>

            {/* Month labels — absolutely positioned so text can overflow column width */}
            {monthLabels.map(({ col, label }) => (
              <Text
                key={col}
                style={[styles.monthLabel, { position: 'absolute', left: col * CELL_STEP, top: 0 }]}
              >
                {label}
              </Text>
            ))}

            {/* Week columns — offset below the month label row */}
            <View style={[styles.weeks, { position: 'absolute', top: MONTH_ROW_H, left: 0 }]}>
              {weeks.map((week, w) => (
                <View key={w} style={styles.week}>
                  {week.map((date, d) => {
                    const isFuture = date > today
                    const count    = isFuture ? 0 : (data.get(toKey(date)) ?? 0)
                    const level    = isFuture ? -1 : getLevel(count)
                    return (
                      <View
                        key={d}
                        style={[styles.cell, level < 0 ? styles.cellFuture : levelStyles[level]]}
                      />
                    )
                  })}
                </View>
              ))}
            </View>

          </View>
        </ScrollView>
      </View>

      {/* Intensity legend */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Less</Text>
        {levelStyles.map((s, i) => (
          <View key={i} style={[styles.cell, s]} />
        ))}
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  wrap: {},

  outer: {
    flexDirection: 'row',
    height: TOTAL_H,
  },

  // ── Fixed left column: day-of-week labels
  dayLabelCol: {
    width: DAY_LABEL_W,
    paddingTop: MONTH_ROW_H,
    gap: CELL_GAP,
    marginRight: CELL_GAP,
    alignItems: 'flex-end',
  },
  dayLabel: {
    fontFamily: theme.font.family.body,
    fontSize: 9,
    color: theme.colors.textTertiary,
    height: CELL_SIZE,
    lineHeight: CELL_SIZE,
    textAlign: 'right',
  },

  // ── Month label (absolutely positioned per column)
  monthLabel: {
    fontFamily: theme.font.family.body,
    fontSize: 9,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    lineHeight: CELL_SIZE,
  },

  // ── Grid
  weeks: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  week: {
    flexDirection: 'column',
    gap: CELL_GAP,
  },

  // ── Cells
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
  cellFuture: { backgroundColor: 'transparent' },
  cellL0: { backgroundColor: theme.colors.heatmapL0 },
  cellL1: { backgroundColor: theme.colors.heatmapL1 },
  cellL2: { backgroundColor: theme.colors.heatmapL2 },
  cellL3: { backgroundColor: theme.colors.heatmapL3 },
  cellL4: { backgroundColor: theme.colors.heatmapL4 },

  // ── Legend
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: theme.spacing.sm,
    justifyContent: 'flex-end',
  },
  legendLabel: {
    fontFamily: theme.font.family.body,
    fontSize: 9,
    color: theme.colors.textTertiary,
  },
}))
