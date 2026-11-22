import { and, eq, inArray } from 'drizzle-orm';
import { Storage } from 'expo-sqlite/kv-store';

import { db } from '@/db/client';
import { books } from '@/db/schema';
import { useSessionStore } from '@/features/auth/session-store';
import { supabase } from '@/lib/supabase';
import {
  fromRemote,
  parseTimestamp,
  shouldApplyRemote,
  toRemote,
  type RemoteBook,
} from './remote-book';
import { useSyncStore } from './sync-store';

const PAGE_SIZE = 500;
const PUSH_BATCH = 200;
/**
 * Re-read this much history on every pull. A write that started before our last pull but
 * committed after it carries an older server timestamp; the overlap catches it.
 * Re-reading is harmless — rows we already have are skipped.
 */
const PULL_OVERLAP_MS = 60_000;
const DEBOUNCE_MS = 1500;

/** Which account the local database belongs to (null = signed-out guest data). */
const OWNER_KEY = 'sync.owner';
const cursorKey = (userId: string) => `sync.cursor.${userId}`;

type Cursor = { since: string; afterId: string };

// ---------------------------------------------------------------------------------------
// Public API

let running: Promise<void> | null = null;
let rerun = false;
let timer: ReturnType<typeof setTimeout> | null = null;

/** Sync soon. Call after local edits; bursts of edits collapse into one sync. */
export function requestSync() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void syncNow();
  }, DEBOUNCE_MS);
}

/** Push local changes, then pull remote ones. Safe to call any time; runs one at a time. */
export function syncNow(): Promise<void> {
  if (running) {
    rerun = true;
    return running;
  }
  running = (async () => {
    try {
      do {
        rerun = false;
        await syncOnce();
      } while (rerun);
    } finally {
      running = null;
    }
  })();
  return running;
}

/**
 * Called when a session appears. If the local shelf belongs to a different account,
 * clear it first so one person's books never upload into another's account.
 * Signed-out (guest) books are kept and uploaded into the new account.
 */
export async function adoptLocalDataFor(userId: string) {
  const owner = Storage.getItemSync(OWNER_KEY);
  if (owner && owner !== userId) await clearLocalData(owner);
  Storage.setItemSync(OWNER_KEY, userId);
}

/** Number of local changes the server doesn't have yet. */
export async function pendingChangeCount() {
  const rows = await db.select({ id: books.id }).from(books).where(eq(books.dirty, true));
  return rows.length;
}

/** Removes every local book and the sync cursor (used on sign-out). */
export async function clearLocalData(userId: string | null) {
  await db.delete(books);
  if (userId) Storage.removeItemSync(cursorKey(userId));
  Storage.removeItemSync(OWNER_KEY);
  useSyncStore.setState({ status: 'idle', lastSyncedAt: null, error: null });
}

// ---------------------------------------------------------------------------------------
// Internals

async function syncOnce() {
  const userId = useSessionStore.getState().session?.user.id;
  if (!supabase || !userId) return;

  useSyncStore.setState({ status: 'syncing', error: null });
  try {
    await push(userId);
    await pull(userId);
    useSyncStore.setState({ status: 'idle', lastSyncedAt: new Date() });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    useSyncStore.setState({ status: 'error', error: message });
  }
}

async function push(userId: string) {
  const client = supabase!;
  const dirty = await db.select().from(books).where(eq(books.dirty, true));

  for (let i = 0; i < dirty.length; i += PUSH_BATCH) {
    const batch = dirty.slice(i, i + PUSH_BATCH);
    const { data, error } = await client
      .from('books')
      .upsert(
        batch.map((b) => toRemote(b, userId)),
        { onConflict: 'user_id,id' },
      )
      .select('id');
    if (error) throw error;

    // Mark pushed rows clean — unless they were edited again while we were pushing.
    for (const book of batch) {
      await db
        .update(books)
        .set({ dirty: false })
        .where(and(eq(books.id, book.id), eq(books.updatedAt, book.updatedAt)));
    }

    // The server skips writes older than what it has. Fetch its newer versions now,
    // so we don't keep showing a stale local copy.
    const accepted = new Set((data ?? []).map((r) => r.id));
    const rejected = batch.filter((b) => !accepted.has(b.id)).map((b) => b.id);
    if (rejected.length > 0) {
      const { data: newer, error: fetchError } = await client
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .in('id', rejected);
      if (fetchError) throw fetchError;
      await applyRemote((newer ?? []) as RemoteBook[]);
    }
  }
}

async function pull(userId: string) {
  const client = supabase!;
  const stored = readCursor(userId);
  let cursor: Cursor = stored
    ? {
        since: new Date(parseTimestamp(stored.since).getTime() - PULL_OVERLAP_MS).toISOString(),
        afterId: '',
      }
    : { since: '-infinity', afterId: '' };
  let newest = stored;

  for (;;) {
    const { data, error } = await client.rpc('pull_books', {
      since: cursor.since,
      after_id: cursor.afterId,
      page_size: PAGE_SIZE,
    });
    if (error) throw error;
    const rows = (data ?? []) as RemoteBook[];
    if (rows.length === 0) break;

    await applyRemote(rows);

    const last = rows[rows.length - 1];
    cursor = { since: last.server_updated_at, afterId: last.id };
    if (!newest || parseTimestamp(last.server_updated_at) >= parseTimestamp(newest.since)) {
      newest = cursor;
    }
    if (rows.length < PAGE_SIZE) break;
  }

  if (newest) Storage.setItemSync(cursorKey(userId), JSON.stringify(newest));
}

async function applyRemote(rows: RemoteBook[]) {
  if (rows.length === 0) return;
  const local = await db
    .select({ id: books.id, updatedAt: books.updatedAt })
    .from(books)
    .where(
      inArray(
        books.id,
        rows.map((r) => r.id),
      ),
    );
  const byId = new Map(local.map((b) => [b.id, b]));

  for (const row of rows) {
    if (!shouldApplyRemote(byId.get(row.id), row)) continue;
    const values = fromRemote(row);
    await db.insert(books).values(values).onConflictDoUpdate({ target: books.id, set: values });
  }
}

function readCursor(userId: string): Cursor | null {
  const raw = Storage.getItemSync(cursorKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Cursor;
  } catch {
    return null;
  }
}
