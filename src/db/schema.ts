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
});

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
