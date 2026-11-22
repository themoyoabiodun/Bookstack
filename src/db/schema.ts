import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const BOOK_STATUSES = ['reading', 'finished'] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export const books = sqliteTable('books', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull().default(''),
  coverUrl: text('cover_url'),
  pageCount: integer('page_count'),
  pagesRead: integer('pages_read').notNull().default(0),
  status: text('status', { enum: BOOK_STATUSES }).notNull().default('reading'),
  /** Open Library work key, e.g. "/works/OL45804W". Lets us de-duplicate and refetch metadata. */
  openLibraryKey: text('open_library_key'),
  isbn: text('isbn'),
  startedAt: integer('started_at', { mode: 'timestamp_ms' }),
  finishedAt: integer('finished_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),

  // --- Sync bookkeeping (see src/features/sync) ---
  /** Last local or remote change. Drives last-write-wins conflict resolution. */
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`0`),
  /** Soft delete, so deletions sync to other devices. Queries must filter these out. */
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
  /** True when this row has changes the server hasn't accepted yet. */
  dirty: integer('dirty', { mode: 'boolean' }).notNull().default(true),
});

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
