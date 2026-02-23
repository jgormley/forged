import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationSettings {
  dailyReminders:        boolean  // per-habit push notifications
  streakAlerts:          boolean  // streak-at-risk alerts (future feature)
  milestoneCelebrations: boolean  // in-app milestone modal + confetti
}

const STORAGE_KEY = '@forged/notificationSettings'

const DEFAULTS: NotificationSettings = {
  dailyReminders:        true,
  streakAlerts:          true,
  milestoneCelebrations: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationSettingsState extends NotificationSettings {
  load:   () => Promise<void>
  update: (patch: Partial<NotificationSettings>) => Promise<void>
}

export const useNotificationSettingsStore = create<NotificationSettingsState>((set, get) => ({
  ...DEFAULTS,

  load: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (raw) {
      const stored = JSON.parse(raw) as Partial<NotificationSettings>
      set({ ...DEFAULTS, ...stored })
    }
  },

  update: async (patch) => {
    const next: NotificationSettings = {
      dailyReminders:        get().dailyReminders,
      streakAlerts:          get().streakAlerts,
      milestoneCelebrations: get().milestoneCelebrations,
      ...patch,
    }
    set(next)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  },
}))
