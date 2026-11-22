import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

// enableChangeListener lets drizzle's useLiveQuery re-render screens when rows change.
const sqlite = openDatabaseSync('bookstack.db', { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });
