import type { Book, NewBook } from '@/db/schema';

/** A row of `public.books` in Supabase (see supabase/migrations). */
export type RemoteBook = {
  user_id: string;
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  page_count: number | null;
  pages_read: number;
  status: Book['status'];
  open_library_key: string | null;
  isbn: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  server_updated_at: string;
};

/** What the app sends on push. The server stamps `server_updated_at` itself. */
export type RemoteBookWrite = Omit<RemoteBook, 'server_updated_at'>;

/**
 * Parses a Postgres timestamptz string. Postgres sends microseconds
 * ("…:05.123456+00:00"); trim to milliseconds so every JS engine parses it.
 */
export function parseTimestamp(value: string) {
  return new Date(value.replace(/(\.\d{3})\d+/, '$1'));
}

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);
const date = (s: string | null) => (s ? parseTimestamp(s) : null);

export function toRemote(book: Book, userId: string): RemoteBookWrite {
  return {
    user_id: userId,
    id: book.id,
    title: book.title,
    author: book.author,
    cover_url: book.coverUrl,
    page_count: book.pageCount,
    pages_read: book.pagesRead,
    status: book.status,
    open_library_key: book.openLibraryKey,
    isbn: book.isbn,
    started_at: iso(book.startedAt),
    finished_at: iso(book.finishedAt),
    created_at: book.createdAt.toISOString(),
    updated_at: book.updatedAt.toISOString(),
    deleted_at: iso(book.deletedAt),
  };
}

/** A server row as a local row. It's already in sync, so it isn't dirty. */
export function fromRemote(row: RemoteBook): NewBook & { id: string } {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    coverUrl: row.cover_url,
    pageCount: row.page_count,
    pagesRead: row.pages_read,
    status: row.status,
    openLibraryKey: row.open_library_key,
    isbn: row.isbn,
    startedAt: date(row.started_at),
    finishedAt: date(row.finished_at),
    createdAt: parseTimestamp(row.created_at),
    updatedAt: parseTimestamp(row.updated_at),
    deletedAt: date(row.deleted_at),
    dirty: false,
  };
}

/**
 * Last write wins: take the server's version only if it's strictly newer than ours.
 * Equal timestamps mean it's the version we already have (often one we pushed).
 */
export function shouldApplyRemote(local: { updatedAt: Date } | undefined, remote: RemoteBook) {
  return !local || parseTimestamp(remote.updated_at).getTime() > local.updatedAt.getTime();
}

/**
 * Timestamp for a local edit. Never goes backwards for a row, so a device whose clock
 * is behind still sees its own newest edit win locally.
 */
export function nextUpdatedAt(previous: Date | null | undefined, now = new Date()) {
  const prev = previous?.getTime() ?? 0;
  return new Date(Math.max(now.getTime(), prev + 1));
}
