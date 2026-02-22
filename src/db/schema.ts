import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
// Single source of truth for FrequencyConfig lives in the streak engine
export type { FrequencyConfig } from '@/utils/streak'

export type HabitCategory =
  | 'fitness'
  | 'nutrition'
  | 'sleep'
  | 'mindfulness'
  | 'focus'
  | 'recovery'
  | 'custom'

export const habits = sqliteTable('habits', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(), // emoji
  color: text('color').notNull(), // hex
  category: text('category').notNull().$type<HabitCategory>(),
  frequencyJson: text('frequency_json').notNull(), // serialized FrequencyConfig
  reminderTime: text('reminder_time'), // "08:00" 24hr, null if none
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const completions = sqliteTable('completions', {
  id: text('id').primaryKey(),
  habitId: text('habit_id')
    .notNull()
    .references(() => habits.id, { onDelete: 'cascade' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }).notNull(),
  note: text('note'),
})

export type Habit = typeof habits.$inferSelect
export type NewHabit = typeof habits.$inferInsert
export type Completion = typeof completions.$inferSelect
export type NewCompletion = typeof completions.$inferInsert
