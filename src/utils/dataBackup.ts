import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { db } from '@/db/client'
import { habits as habitsTable, completions as completionsTable } from '@/db/schema'
import type { NewHabit, NewCompletion, HabitCategory } from '@/db/schema'

// ─────────────────────────────────────────────────────────────────────────────
// File format
// ─────────────────────────────────────────────────────────────────────────────

const BACKUP_VERSION = 1

interface BackupFile {
  version: number
  exportedAt: string
  habits: SerializedHabit[]
  completions: SerializedCompletion[]
}

interface SerializedHabit {
  id: string
  name: string
  icon: string
  color: string
  category: string
  frequencyJson: string
  reminderTime: string | null
  createdAt: string   // ISO-8601
  isArchived: boolean
  sortOrder: number
}

interface SerializedCompletion {
  id: string
  habitId: string
  completedAt: string  // ISO-8601
  note: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export async function exportData(): Promise<void> {
  const allHabits      = await db.select().from(habitsTable)
  const allCompletions = await db.select().from(completionsTable)

  const payload: BackupFile = {
    version:     BACKUP_VERSION,
    exportedAt:  new Date().toISOString(),
    habits: allHabits.map((h) => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
    })),
    completions: allCompletions.map((c) => ({
      ...c,
      completedAt: c.completedAt.toISOString(),
    })),
  }

  const json     = JSON.stringify(payload, null, 2)
  const date     = new Date().toISOString().slice(0, 10)
  const filename = `forged-backup-${date}.json`
  const path     = `${FileSystem.cacheDirectory}${filename}`

  await FileSystem.writeAsStringAsync(path, json, {
    encoding: 'utf8',
  })

  const canShare = await Sharing.isAvailableAsync()
  if (!canShare) throw new Error('Sharing is not available on this device.')

  await Sharing.shareAsync(path, {
    mimeType:    'application/json',
    dialogTitle: 'Export Forged Data',
    UTI:         'public.json',
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Import — step 1: pick + parse (no DB changes yet)
// ─────────────────────────────────────────────────────────────────────────────

export interface ImportPreview {
  habitCount:      number
  completionCount: number
  exportedAt:      string
  // Parsed and ready to insert — kept private-ish via underscore convention
  _habits:      NewHabit[]
  _completions: NewCompletion[]
}

/**
 * Opens the document picker, reads the file, validates it, and returns a
 * preview of what would be imported.  Throws 'CANCELLED' if the user cancels.
 */
export async function readImportFile(): Promise<ImportPreview> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  })

  if (result.canceled) throw new Error('CANCELLED')

  const uri     = result.assets[0].uri
  const content = await FileSystem.readAsStringAsync(uri, {
    encoding: 'utf8',
  })

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('The file is not valid JSON.')
  }

  if (!isValidBackup(parsed)) {
    throw new Error('This file does not appear to be a Forged backup.')
  }

  const data = parsed as BackupFile

  const habits: NewHabit[] = data.habits.map((h) => ({
    ...h,
    category:  h.category as HabitCategory,
    createdAt: new Date(h.createdAt),
  }))

  const completions: NewCompletion[] = data.completions.map((c) => ({
    ...c,
    completedAt: new Date(c.completedAt),
  }))

  return {
    habitCount:      habits.length,
    completionCount: completions.length,
    exportedAt:      data.exportedAt,
    _habits:         habits,
    _completions:    completions,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Import — step 2: apply to DB (call after user confirms)
// ─────────────────────────────────────────────────────────────────────────────

const COMPLETION_BATCH_SIZE = 200

export async function applyImport(preview: ImportPreview): Promise<void> {
  // Wipe existing data — cascade delete handles completions
  await db.delete(habitsTable)

  if (preview._habits.length > 0) {
    await db.insert(habitsTable).values(preview._habits)
  }

  // Batch completions to stay within SQLite's bound-parameter limit
  for (let i = 0; i < preview._completions.length; i += COMPLETION_BATCH_SIZE) {
    const batch = preview._completions.slice(i, i + COMPLETION_BATCH_SIZE)
    await db.insert(completionsTable).values(batch)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function isValidBackup(data: unknown): data is BackupFile {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return (
    typeof d.version     === 'number' &&
    typeof d.exportedAt  === 'string' &&
    Array.isArray(d.habits) &&
    Array.isArray(d.completions)
  )
}
