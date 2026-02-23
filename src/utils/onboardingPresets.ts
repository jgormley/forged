import type { FrequencyConfig } from '@/utils/streak'

export interface HabitPreset {
  name: string
  icon: string
  color: string
  category: string
  frequency: FrequencyConfig
}

// Days: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
export const ONBOARDING_PRESETS: Record<string, HabitPreset> = {
  'daily-pages': {
    name: 'Write my daily pages',
    icon: '📝',
    color: '#C8A84B',
    category: 'mindfulness',
    frequency: { type: 'daily' },
  },
  'sleep': {
    name: 'Get 8 hours of sleep',
    icon: '😴',
    color: '#89B4C8',
    category: 'health',
    frequency: { type: 'daily' },
  },
  'workout': {
    name: 'Workout',
    icon: '💪',
    color: '#4A6741',
    category: 'fitness',
    frequency: { type: 'daysOfWeek', days: [1, 3, 5] }, // Mon, Wed, Fri
  },
}
