import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import * as schema from './schema'

// enableChangeListener lets Drizzle's live queries react to DB writes
const sqlite = openDatabaseSync('forged.db', { enableChangeListener: true })

export const db = drizzle(sqlite, { schema })
