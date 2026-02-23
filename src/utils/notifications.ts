import * as Notifications from 'expo-notifications'
import { SchedulableTriggerInputTypes } from 'expo-notifications'
import type { HabitWithFrequency } from '@/stores/habitsStore'
import { useNotificationSettingsStore } from '@/stores/notificationSettingsStore'

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

// Notification ID scheme:
//   daily / xPerWeek  → `habit-{id}`           (one DailyTrigger)
//   daysOfWeek        → `habit-{id}-{weekday}`  (one WeeklyTrigger per scheduled day)
//
// expo-notifications weekday: 1=Sunday … 7=Saturday
// JS Date getDay():           0=Sunday … 6=Saturday  (add 1 to convert)

export async function scheduleHabitReminders(habit: HabitWithFrequency): Promise<void> {
  if (!habit.reminderTime) return
  if (!useNotificationSettingsStore.getState().dailyReminders) return
  const [hourStr, minStr] = habit.reminderTime.split(':')
  const hour = parseInt(hourStr, 10)
  const minute = parseInt(minStr, 10)

  if (habit.frequency.type === 'daysOfWeek') {
    for (const day of habit.frequency.days) {
      await Notifications.scheduleNotificationAsync({
        identifier: `habit-${habit.id}-${day}`,
        content: {
          title: `${habit.icon} ${habit.name}`,
          body: 'Time to forge your habit.',
        },
        trigger: { type: SchedulableTriggerInputTypes.WEEKLY, weekday: day + 1, hour, minute },
      })
    }
  } else {
    // daily and xPerWeek both get a daily repeating notification
    await Notifications.scheduleNotificationAsync({
      identifier: `habit-${habit.id}`,
      content: {
        title: `${habit.icon} ${habit.name}`,
        body: 'Time to forge your habit.',
      },
      trigger: { type: SchedulableTriggerInputTypes.DAILY, hour, minute },
    })
  }
}

export async function cancelHabitReminders(habitId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const toCancel = scheduled
    .filter((n) => n.identifier.startsWith(`habit-${habitId}`))
    .map((n) => n.identifier)
  await Promise.all(toCancel.map((id) => Notifications.cancelScheduledNotificationAsync(id)))
}

export async function rescheduleHabitReminders(habit: HabitWithFrequency): Promise<void> {
  await cancelHabitReminders(habit.id)
  await scheduleHabitReminders(habit)
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

export async function rescheduleAllReminders(habits: HabitWithFrequency[]): Promise<void> {
  await Promise.all(
    habits.filter((h) => h.reminderTime).map((h) => scheduleHabitReminders(h))
  )
}
