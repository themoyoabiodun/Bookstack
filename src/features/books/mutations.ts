import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { books, type BookStatus } from '@/db/schema';
import { requestSync } from '@/features/sync/engine';
import { nextUpdatedAt } from '@/features/sync/remote-book';
import { createId } from '@/lib/id';
import type { BookSearchResult } from './open-library';

/** Adds a book from search, or returns the existing id if it's already on the shelf. */
export async function addBook(result: BookSearchResult, status: BookStatus = 'reading') {
  const existing = await db
    .select({ id: books.id })
    .from(books)
    .where(and(eq(books.openLibraryKey, result.openLibraryKey), isNull(books.deletedAt)))
    .limit(1);
  if (existing[0]) return existing[0].id;

  const now = new Date();
  const id = createId();
  await db.insert(books).values({
    id,
    ...result,
    status,
    startedAt: now,
    finishedAt: status === 'finished' ? now : null,
    pagesRead: status === 'finished' ? (result.pageCount ?? 0) : 0,
    createdAt: now,
    updatedAt: now,
    dirty: true,
  });
  requestSync();
  return id;
}

export async function setBookStatus(id: string, status: BookStatus) {
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  if (!book) return;
  await db
    .update(books)
    .set({
      ...(status === 'finished'
        ? { status, finishedAt: new Date(), pagesRead: book.pageCount ?? book.pagesRead }
        : { status, finishedAt: null }),
      updatedAt: nextUpdatedAt(book.updatedAt),
      dirty: true,
    })
    .where(eq(books.id, id));
  requestSync();
}

/** Soft delete, so the removal syncs to the user's other devices. */
export async function deleteBook(id: string) {
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  if (!book) return;
  await db
    .update(books)
    .set({ deletedAt: new Date(), updatedAt: nextUpdatedAt(book.updatedAt), dirty: true })
    .where(eq(books.id, id));
  requestSync();
}
